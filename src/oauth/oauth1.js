import OAuthPopup from './popup.js'
import { objectExtend, isString, isObject, isFunction, joinUrl } from '../utils.js'

const defaultProviderConfig = {
  name: null,
  url: null,
  authorizationEndpoint: null,
  scope: null,
  scopePrefix: null,
  scopeDelimiter: null,
  redirectUri: null,
  requiredUrlParams: null,
  defaultUrlParams: null,
  oauthType: '1.0',
  popupOptions: {}
}

export default class OAuth {
  constructor($http, storage, providerConfig, options) {
    this.$http = $http
    this.storage = storage
    this.providerConfig = objectExtend({}, defaultProviderConfig)
    this.providerConfig = objectExtend(this.providerConfig, providerConfig)
    this.options = options
  }

  /**
   * Initialize OAuth1 process
   * @param  {Object} userData User data
   * @return {Promise}
   */
  init(userData) {
    this.oauthPopup = new OAuthPopup('about:blank', this.providerConfig.name, this.providerConfig.popupOptions)

    if (window && !window['cordova']) {
      this.oauthPopup.open(this.providerConfig.redirectUri, true)
    }

    return this.getRequestToken().then((response) => {
      return this.openPopup(response).then((popupResponse) => {
        return this.exchangeForToken(popupResponse, userData)
      })
    })
  }

  /**
   * Get OAuth1 request token
   * @return {Promise}
   */
  getRequestToken() {
    let requestOptions = {}
    requestOptions.method = 'POST'
    requestOptions[this.options.requestDataKey] = objectExtend({}, this.providerConfig)
    requestOptions.withCredentials = this.options.withCredentials
    if (this.options.baseUrl) {
      requestOptions.url = joinUrl(this.options.baseUrl, this.providerConfig.url)
    } else {
      requestOptions.url = this.providerConfig.url
    }

    return this.$http(requestOptions)
  }

  /**
   * Open OAuth1 popup
   * @param  {Object} response Response object containing request token
   * @return {Promise}
   */
  openPopup(response) {
    if (isFunction(this.providerConfig.authorizationEndpoint)) {
      this.providerConfig.authorizationEndpoint = this.providerConfig.authorizationEndpoint()
    }
    Promise.resolve(this.providerConfig.authorizationEndpoint).then(authorizationEndpoint => {
      const requestParams = this.buildQueryString(response[this.options.responseDataKey])
      const url = requestParams.length ? [authorizationEndpoint, requestParams].join('?') : authorizationEndpoint

      this.oauthPopup.popup.location = url
      if (window && window['cordova']) {
        return this.oauthPopup.open(this.providerConfig.redirectUri)
      } else {
        return this.oauthPopup.pooling(this.providerConfig.redirectUri)
      }
    })
  }

  /**
   * Exchange token and token verifier for access token
   * @param  {Object} oauth    OAuth data containing token and token verifier
   * @param  {Object} userData User data
   * @return {Promise}
   */
  exchangeForToken(oauth, userData) {
    let payload = objectExtend({}, userData)
    payload = objectExtend(payload, oauth)
    let requestOptions = {}
    requestOptions.method = 'POST'
    requestOptions[this.options.requestDataKey] = payload
    requestOptions.withCredentials = this.options.withCredentials
    if (this.options.baseUrl) {
      requestOptions.url = joinUrl(this.options.baseUrl, this.providerConfig.url)
    } else {
      requestOptions.url = this.providerConfig.url
    }
    return this.$http(requestOptions)
  }

  buildQueryString(params) {
    const parsedParams = [];
    for (var key in params) {
      let value = params[key]
      parsedParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
    return parsedParams.join('&');
  }
}
