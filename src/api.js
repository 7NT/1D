const feathers = require('@feathersjs/feathers')
const socketio = require('@feathersjs/socketio-client')
const io = require('socket.io-client')
const auth = require('@feathersjs/authentication-client')

// Set up Socket.io client with the socket
const host = 'www.jbridge.net' // '192.168.1.4' // 72' 'localhost' //
const socket = io(`http://${host}:3030`)

const api = feathers()

api.configure(socketio(socket))
api.configure(auth())

const users$ = api.service('/users')
const chats$ = api.service('/chats')
const players$ = api.service('/players')
const tables$ = api.service('/tables')
const results$ = api.service('/results')

// export default api
export {
  api,
  users$,
  chats$,
  players$,
  tables$,
  results$
}
