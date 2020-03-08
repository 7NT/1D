const feathers = require('@feathersjs/feathers')
const socketio = require('@feathersjs/socketio-client')
const io = require('socket.io-client')
const auth = require('@feathersjs/authentication-client')

// Set up Socket.io client with the socket
const socket = io('http://localhost:3030')

const api = feathers()

api.configure(socketio(socket))
api.configure(auth())

const userService = api.service('/users')
const chatService = api.service('/chats')
const playerService = api.service('/players')
const tableService = api.service('/tables')

// export default api
export {
  api,
  userService,
  chatService,
  playerService,
  tableService
}
