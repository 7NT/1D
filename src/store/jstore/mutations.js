/*
export function someMutation (state) {}
*/
export const setUser = (state, user) => {
  state.user = user
}

export const setPlayers = (state, players) => {
  // players.forEach(p => { state.players.set(p.id, p) })
  state.players = players
}

export const setTables = (state, tables) => {
  state.tables = tables
  const lobby = {
    id: null,
    name: '#Lobby',
    info: 'Welcome',
    players: 0,
    seats: [null, null, null, null]
  }
  state.tables.unshift(lobby)
  /*
  state.tables.set('#Lobby', lobby)
  tables.forEach(t => {
    state.tables.set(t.id, t)
  })
  */
}

export const setResults = (state, results) => {
  // results.forEachr(r => { state.results.set(r._id, r) })
  state.resuts = results
}

export const setTourneys = (state, tourneys) => {
  state.tourneys = tourneys
}

export const setTeams = (state, teams) => {
  state.teams = teams
}

export const addPlayer = (state, player) => {
  // if (player.state < 0) state.players.delete(player.id) else state.players.set(player.id, player)
  const i = state.players.findIndex(p => p.id === player.id)
  if (i >= 0) {
    if (player.state < 0) state.players.splice(i, 1)
    else state.players.splice(i, 1, player)
  } else {
    state.players.push(player)
  }
}

export const addTable = (state, table) => {
  // if (table.state < 0) state.tables.delete(table.id) else state.tables.set(table.id, table)
  const i = state.tables.findIndex(t => t.id === table.id)
  if (i >= 0) {
    if (table.state < -1) state.tables.splice(i, 1)
    else state.tables.splice(i, 1, table)
  } else if (table.state >= 0) {
    state.tables.splice(1, 0, table)
  }
}

export const addResult = (state, result) => {
  // state.results.set(result._id, result)
  const i = state.results.findIndex(r => r._id === result._id)
  if (i >= 0) {
    state.results.splice(i, 1, result)
  } else {
    state.results.splice(1, 0, result)
  }
}

export const setChat = (state, chat) => {
  state.chats.push(chat)
}

export const setRoomId = (state, roomId) => {
  state.roomId = roomId
}
