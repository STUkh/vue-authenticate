if (typeof Object.assign != 'function') {
  Object.assign = function(target, varArgs) {
    'use strict';
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource != null) { // Skip over if undefined or null
        for (var nextKey in nextSource) {
          // Avoid bugs when hasOwnProperty is shadowed
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

export function camelCase(name) {
  return name.replace(/([\:\-\_]+(.))/g, function (_, separator, letter, offset) {
    return offset ? letter.toUpperCase() : letter;
  });
}

export function isUndefined(value) {
  return typeof value === 'undefined'
}

export function isDefined(value) {
  return typeof value !== 'undefined'
}

export function isObject(value) {
  return value !== null && typeof value === 'object'
}

export function isString(value) {
  return typeof value === 'string'
}

export function isNumber(value) {
  return typeof value === 'number'
}

export function isFunction(value) {
  return typeof value === 'function'
}

export function objectExtend(a, b) {

  // Don't touch 'null' or 'undefined' objects.
  if (a == null || b == null) {
    return a;
  }

  Object.keys(b).forEach(function (key) {
    if (Object.prototype.toString.call(b[key]) == '[object Object]') {
      if (Object.prototype.toString.call(a[key]) != '[object Object]') {
        a[key] = b[key];
      } else {
        a[key] = objectExtend(a[key], b[key]);
      }
    } else {
      a[key] = b[key];
    }
  });

  return a;
};

/**
 * Assemble url from two segments
 *
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Method taken from https://github.com/sahat/satellizer
 *
 * @param  {String} baseUrl Base url
 * @param  {String} url     URI
 * @return {String}
 */
export function joinUrl(baseUrl, url) {
  if (/^(?:[a-z]+:)?\/\//i.test(url)) {
    return url;
  }
  let joined = [baseUrl, url].join('/');
  let normalize = function (str) {
    return str
      .replace(/[\/]+/g, '/')
      .replace(/\/\?/g, '?')
      .replace(/\/\#/g, '#')
      .replace(/\:\//g, '://');
  };
  return normalize(joined);
}

/**
 * Get full path based on current location
 *
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Method taken from https://github.com/sahat/satellizer
 *
 * @param  {Location} location
 * @return {String}
 */
export function getFullUrlPath(location) {
  const isHttps = location.protocol === 'https:';
  return location.protocol + '//' + location.hostname +
    ':' + (location.port || (isHttps ? '443' : '80')) +
    (/^\//.test(location.pathname) ? location.pathname : '/' + location.pathname);
}

/**
 * Parse query string variables
 *
 * @author Sahat Yalkabov <https://github.com/sahat>
 * @copyright Method taken from https://github.com/sahat/satellizer
 *
 * @param  {String} Query string
 * @return {String}
 */
export function parseQueryString(str) {
  let obj = {};
  let key;
  let value;
  (str || '').split('&').forEach((keyValue) => {
    if (keyValue) {
      value = keyValue.split('=');
      key = decodeURIComponent(value[0]);
      obj[key] = (!!value[1]) ? decodeURIComponent(value[1]) : true;
    }
  });
  return obj;
}

export const decodeJWT = (token) => {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace('-', '+').replace('_', '/')
  return JSON.parse(window.atob(base64))
}

export function parseCookies(str) {
  if (str.length === 0) return {};
  const parsed = {};
  const pattern = new RegExp('\\s*;\\s*');
  str.split(pattern).forEach((i) => {
    const [encodedKey, encodedValue] = i.split('=');
    const key = decodeURIComponent(encodedKey);
    const value = decodeURIComponent(encodedValue);
    parsed[key] = value;
  });
  return parsed;
};

export function formatOptions(options) {
  const { path, domain, expires, secure } = options;
  return [
    typeof path === 'undefined' || path === null
      ? '' : ';path=' + path,
    typeof domain === 'undefined' || domain === null
      ? '' : ';domain=' + domain,
    typeof expires === 'undefined' || expires === null
      ? '' : ';expires=' + expires.toUTCString(),
    typeof secure === 'undefined' || secure === null || secure === false
      ? '' : ';secure'
  ].join('');
};

export function formatCookie(key, value, options) {
  return [
    encodeURIComponent(key),
    '=',
    encodeURIComponent(value),
    formatOptions(options)
  ].join('');
};
