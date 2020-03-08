// Import the Feathers client module that we've created before
import {
  api
} from './api'

const auth = {
  // keep track of the logged in user
  user: null,

  authenticated () {
    return this.user != null
  },

  register (credential) {
    console.log('register', credential)
    return api.service('users').create(credential)
  },

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

  signout () {
    // api.service('players').remove(this.user._id)
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
      this.user = response.user
      callback(this.user)
    })
  }
}

export default auth
