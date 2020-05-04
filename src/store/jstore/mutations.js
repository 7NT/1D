/*
export function someMutation (state) {
}
*/
export const setUser = (state, payload) => {
  state.user = payload
}

export const setPlayers = (state, payload) => {
  state.players = payload
}

export const setTables = (state, payload) => {
  state.tables = payload
  const newTable = {
    id: null,
    name: '#Lobby',
    info: 'Welcome',
    players: 0,
    seats: [null, null, null, null]
  }
  state.tables.unshift(newTable)
}

export const addPlayer = (state, payload) => {
  const i = state.players.findIndex(p => p.id === payload.id)
  if (i >= 0) {
    if (payload.state < 0) state.players.splice(i, 1)
    else state.players.splice(i, 1, payload)
  } else {
    state.players.push(payload)
  }
}

export const addTable = (state, payload) => {
  const i = state.tables.findIndex(t => t.id === payload.id)
  if (i >= 0) {
    if (payload.state < -1) state.tables.splice(i, 1)
    else state.tables.splice(i, 1, payload)
  } else if (payload.state >= 0) {
    state.tables.splice(1, 0, payload)
  }
}

export const setResults = (state, payload) => {
  state.results = payload
}

export const addResult = (state, payload) => {
  // state.results.push(payload)
  const i = state.results.findIndex(r => r._id === payload._id)
  if (i >= 0) {
    state.results.splice(i, 1, payload)
  } else {
    state.results.splice(1, 0, payload)
  }
  console.log(state.results)
}

export const setChat = (state, payload) => {
  state.chats.push(payload)
}

export const setRoomId = (state, payload) => {
  state.roomId = payload
}
