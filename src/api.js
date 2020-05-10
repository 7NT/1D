const feathers = require('@feathersjs/feathers')
const socketio = require('@feathersjs/socketio-client')
const io = require('socket.io-client')
const auth = require('@feathersjs/authentication-client')

// Set up Socket.io client with the socket
const socket = io('http://localhost:3030')
// const socket = io('http://www.jbridge.net:3030', {transports: ['websocket'], forceNew: true})

const api = feathers()

api.configure(socketio(socket))
api.configure(auth())

const users$ = api.service('/users')
const chats$ = api.service('/chats')
const players$ = api.service('/players')
const tables$ = api.service('/tables')
const results$ = api.service('/results')
const tourneys$ = api.service('/tourneys')
const teams$ = api.service('/teams')

// export default api
export {
  api,
  users$,
  chats$,
  players$,
  tables$,
  results$,
  tourneys$,
  teams$
}
