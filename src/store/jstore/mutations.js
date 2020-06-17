export const setJsUser = (state, user) => {
  state.jsUser = user
}

export const setPlayers = (state, players) => {
  state.jsPlayers = players
}

export const setTables = (state, tables) => {
  state.jsTables = tables
  const lobby = {
    id: null,
    name: '#Lobby',
    info: 'Welcome',
    players: 0,
    seats: [null, null, null, null]
  }
  state.jsTables.unshift(lobby)
}

export const setResults = (state, results) => {
  state.jsResuts = results
}

export const setTourneys = (state, tourneys) => {
  state.jsTourneys = tourneys
}

export const setTeams = (state, teams) => {
  state.jsTeams = teams
}

export const addPlayer = (state, player) => {
  const i = state.jsPlayers.findIndex(p => p.id === player.id)
  if (i >= 0) {
    if (player.state < 0) {
      state.jsPlayers.splice(i, 1)
      if (player.id === state.jsMap.get('following')) state.jsMap.delete('following') // following exits
    } else state.jsPlayers.splice(i, 1, player)
  } else {
    state.jsPlayers.push(player)
  }
}

export const addTable = (state, table) => {
  const i = state.jsTables.findIndex(t1 => t1._id === table._id)
  if (i >= 0) {
    if (table.state < 0) state.jsTables.splice(i, 1)
    else state.jsTables.splice(i, 1, table)
  } else if (table.state >= 0) {
    state.jsTables.splice(1, 0, table)
  }
}

export const addResult = (state, result) => {
  const i = state.jsResults.findIndex(r => r._id === result._id)
  if (i >= 0) {
    state.jsResults.splice(i, 1, result)
  } else {
    state.jsResults.splice(1, 0, result)
  }
}

export const addTourney = (state, tourney) => {
  const i = state.jsTourneys.findIndex(t => t._id === tourney._id)
  if (i >= 0) {
    if (tourney.state < 0) state.jsTourneys.splice(i, 1)
    else state.jsTourneys.splice(i, 1, tourney)
  } else if (tourney.state >= 0) {
    state.jsTourneys.splice(1, 0, tourney)
  }
}

export const setChat = (state, chat) => {
  if (chat.to === state.jsUser._id) {
    if (!state.jsSet.has(chat.userId)) state.jsMap.add(chat.userId)
  }
  state.jsChats.push(chat)
}

export const setJsSet = (state, set) => {
  state.jbSet.add(set)
}

export const setJsMap = (state, map) => {
  state.jsMap.set(map.id, map.value)
}
