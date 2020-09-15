// Import the Feathers client module that we've created before
import { api } from './api'

const auth = {
  // keep track of the logged in user
  user: null,
  accessToken: null,

  setUser (u) {
    this.user = u
  },

  async getUser () {
    return this.user
  },

  async setToken (token) {
    const { user, accessToken } = token
    if (user) this.setUser(user)
    if (accessToken) this.setAccessToken(accessToken)
  },

  setAccessToken (accessToken) {
    this.AccessToken = accessToken
  },

  async getAccessToken () {
    return this.AccessToken
  },

  authenticated () {
    return this.getUser() != null
  },
  async reAuthenticate () {
    // console.log('reAuthenticate')
    return await api.reAuthenticate()
  },
  async register (credential) {
    return await api.service('users').create(credential)
  },

  /*
  async login (credentials) {
    if (!credentials) {
      // Try to authenticate using an existing token
      return await api.reAuthenticate()
    } else {
      // Otherwise log in with the `local` strategy using the credentials we got
      return await api.authenticate({
        strategy: 'local',
        ...credentials
      })
    }
  },
  */
  login (credentials) {
    if (!credentials) {
      // Try to authenticate using an existing token
      return api.reAuthenticate()
    } else {
      // Otherwise log in with the `local` strategy using the credentials we got
      return api.authenticate({
        strategy: 'local',
        ...credentials
      })
    }
  },

  async signout () {
    return await api.logout()
  },

  onLogout (callback) {
    api.on('logout', () => {
      this.user = null
      callback()
    })
  },

  onAuthenticated (callback) {
    api.on('authenticated', response => {
      // console.log('authenticated', response)
      this.user = response.user
      callback(this.user)
    })
  }
}

export default auth
