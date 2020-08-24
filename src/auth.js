// Import the Feathers client module that we've created before
import { api } from './api'

const auth = {
  // keep track of the logged in user
  user: null,

  authenticated () {
    return this.user != null
  },
  async reAuthenticate () {
    console.log('reAuthenticate')
    return await api.reAuthenticate()
  },
  register (credential) {
    // api.removeAccessToken()
    return api.service('users').create(credential)
  },

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

  signout () {
    // api.removeAccessToken()
    return api.logout()
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
