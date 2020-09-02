const feathers = require('@feathersjs/feathers')
const socketio = require('@feathersjs/socketio-client')
const io = require('socket.io-client')
const auth = require('@feathersjs/authentication-client')

// Set up Socket.io client with the socket
const host = 'http://localhost:3030' // http://www.jbridge.net:3030
const socket = io(host, { transports: ['websocket'], forceNew: true })

const api = feathers()

// api.configure(socketio(socket))
api.configure(socketio(socket, {
  timeout: 20000,
  pingInterval: 10000,
  pingTimeout: 50000
}))
// api.configure(auth())
api.configure(
  auth({
    storage: window.localStorage,
    storageKey: 'access-token',
    path: '/authentication'
  })
)

const users$ = api.service('/users')
const chats$ = api.service('/chats')
const players$ = api.service('/players')
const tables$ = api.service('/tables')
const results$ = api.service('/results')
const tourneys$ = api.service('/tourneys')
const teams$ = api.service('/teams')
/*
io.on('connection', (reason) => {
  // Show offline message
  console.log('connection', reason)
})

io.on('disconnect', (reason) => {
  // Show offline message
  console.log('disconnect', reason)
})

io.on('reconnect_attempt', (reason) => {
  console.log('reconnect', reason)
})

socket.on('ping', (reason) => {
  console.log('ping', reason)
})

socket.on('pong', (reason) => {
  console.log('pong', reason)
})
*/
/*
const login = async() => {
  try {
    return await api.reAuthenticate()
  }catch (err) {
    return await api.authenticate({
      strategy: 'local',
      email,
      password
    })
  }
}
*/
console.log('connect', host)
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
