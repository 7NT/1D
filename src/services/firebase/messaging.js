/* eslint-disable eqeqeq */
import firebase from 'firebase/app'
import 'firebase/messaging'
import axios from 'axios'

// [START get_messaging_object]
// Retrieve Firebase Messaging object.
export const messaging = () => {
  // const messaging = firebase.messaging()
  return firebase.messaging()
}

// [END get_messaging_object]
// [START set_public_vapid_key]
// Add the public key generated from the console here.
const vapidKey = 'BGnR59Ic1a7VvKO5l590yChTQxYTBxghjadriHvJ3LFP9O9iOPv17rPfRv0vEaan901mwwp37Ju4bfDzqobJ8Mo'
// messaging.usePublicVapidKey(vapidKey)
// [END set_public_vapid_key]

// getToken(options ?: { vapidKey?: string; serviceWorkerRegistration?: ServiceWorkerRegistration }):

// Get Instance ID token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.
export const getToken = async () => {
  return messaging().getToken({ vapidKey }).then((currentToken) => {
    if (currentToken) {
      console.log('currentToken', currentToken)
      // sendTokenToServer(currentToken)
      // updateUIForPushEnabled(currentToken)
    } else {
      // Show permission request.
      console.log('No Instance ID token available. Request permission to generate one.')
      // Show permission UI.
      // updateUIForPushPermissionRequired()
      // setTokenSentToServer(false)
    }
  }).catch((err) => {
    console.log('An error occurred while retrieving token. ', err)
    // showToken('Error retrieving Instance ID token. ', err)
    // setTokenSentToServer(false)
  })
}

export const getMessagingToken = () => {
  messaging.getToken().then(async (token) => {
    if (token) {
      const currentMessageToken = window.localStorage.getItem('messagingToken')
      console.log('token will be updated', currentMessageToken != token)
      if (currentMessageToken != token) {
        await this.saveToken(token)
      }
    } else {
      console.log('No Instance ID token available. Request permission to generate one.')
      this.notificationsPermisionRequest()
    }
  }).catch(function (err) {
    console.log('An error occurred while retrieving token. ', err)
  })
}

export const notificationsPermisionRequest = () => {
  messaging.requestPermission()
    .then(() => {
      this.getMessagingToken()
    })
    .catch((err) => {
      console.log('Unable to get permission to notify.', err)
    })
}

export const listenTokenRefresh = () => {
  const currentMessageToken = window.localStorage.getItem('messagingToken')
  console.log('currentMessageToken', currentMessageToken)
  if (currentMessageToken) {
    messaging.onTokenRefresh(function () {
      messaging.getToken().then(function (token) {
        this.saveToken(token)
      }).catch(function (err) {
        console.log('Unable to retrieve refreshed token ', err)
      })
    })
  }
}

export const saveToken = (token) => {
  console.log('tokens', token)
  axios.post('https://us-central1-cropchien.cloudfunctions.net/GeneralSubscription', { token })
    .then(response => {
      window.localStorage.setItem('messagingToken', token)
      console.log(response)
    }).catch((err) => {
      console.log(err)
    })
}
