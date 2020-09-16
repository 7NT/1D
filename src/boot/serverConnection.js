import firebaseService from '../services/firebase'

export default ({ store, Vue }) => {
  // const config = process.env.environments.FIREBASE_CONFIG
  const FIREBASE_CONFIG = {
    apiKey: 'AIzaSyAb7hm-HRy6H09KvhUechIj7GwLwIRbhoE',
    authDomain: 'd-app-286301.firebaseapp.com',
    databaseURL: 'https://d-app-286301.firebaseio.com',
    projectId: 'd-app-286301',
    storageBucket: 'd-app-286301.appspot.com',
    messagingSenderId: '819669594394',
    appId: '1:819669594394:web:1f97a0671c8b37f3de3ca3',
    measurementId: 'G-6XCJSRDLTV'
  }

  firebaseService.fBInit(FIREBASE_CONFIG)

  // Tell the application what to do when the
  // authentication state has changed
  firebaseService.auth().onAuthStateChanged((currentUser) => {
    firebaseService.handleOnAuthStateChanged(store, currentUser)
  }, (error) => {
    console.error(error)
  })

  Vue.prototype.$fb = firebaseService
  store.$fb = firebaseService
}
