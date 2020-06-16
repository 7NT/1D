/*
export function someMutation (state) {}
*/
export const setMyUser = (state, user) => {
  if (user && !user.id) user.id = user._id
  state.myUser = user
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
    if (player.state < 0) {
      state.players.splice(i, 1)
      if (player.id === state.jbP1) state.jbP1 = null // following exits
    } else state.players.splice(i, 1, player)
  } else {
    state.players.push(player)
  }
}

export const addTable = (state, table) => {
  // if (table.state < 0) state.tables.delete(table.id) else state.tables.set(table.id, table)
  const i = state.tables.findIndex(t => t._id === table._id)
  if (i >= 0) {
    if (table.state < 0) state.tables.splice(i, 1)
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

export const addTourney = (state, tourney) => {
  // if (table.state < 0) state.tables.delete(table.id) else state.tables.set(table.id, table)
  const i = state.tourneys.findIndex(t => t._id === tourney._id)
  if (i >= 0) {
    if (tourney.state < 0) state.tourneys.splice(i, 1)
    else state.tourneys.splice(i, 1, tourney)
  } else if (tourney.state >= 0) {
    state.tourneys.splice(1, 0, tourney)
  }
}

export const setChat = (state, chat) => {
  if (chat.to === `@${state.myUser._id}`) {
    if (state.jbP0.indexOf(chat.userId) < 0) state.jbP0.push(chat.userId)
  }
  state.chats.push(chat)
}

export const setT04 = (state, t04) => {
  switch (t04.id) {
    case 0: { // remove
      const i = state.jbP0.findIndex(p => p === t04.p0)
      if (i >= 0) state.jbP0.splice(i, 1)
      break
    }
    case 1: {
      state.jbT1 = t04.t1
      break
    }
    case 2: {
      state.jbT2 = t04.t2
      break
    }
    case 3: {
      state.jbP1 = t04.p1 // following
      console.log(state.jbP1)
      break
    }
    case 4: {
      state.jbT4 = t04.t4
      break
    }
    default:
  }
}
