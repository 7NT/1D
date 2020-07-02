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
      // if (player.id === state.jsMap.get('following')) state.jsMap.delete('following') // following exits
      if (player.id === state.jsPF) state.jsPF = null
    } else state.jsPlayers.splice(i, 1, player)
  } else {
    state.jsPlayers.push(player)
  }
}

export const addTable = (state, table) => {
  const i = state.jsTables.findIndex(t1 => t1.id === table.id)
  if (i >= 0) {
    if (table.state < 0) state.jsTables.splice(i, 1)
    else state.jsTables.splice(i, 1, table)
  } else if (table.state >= 0) {
    state.jsTables.splice(1, 0, table)
  }
}

export const addResult = (state, result) => {
  const i = state.jsResults.findIndex(r => r._id === result._id)
  if (i >= 0) state.jsResults.splice(i, 1, result)
  else state.jsResults.unshift(result)
}

export const updateResult = (state, result) => {
  const i = state.jsResults.findIndex(r => r._id === result._id)
  if (i >= 0) state.jsResults.splice(i, 1, result)
}

export const resetResults = (state, result) => {
  state.jsResults = []
}

export const addTourney = (state, tourney) => {
  const i = state.jsTourneys.findIndex(t => t._id === tourney._id)
  if (i >= 0) {
    if (tourney.state < 0) state.jsTourneys.splice(i, 1)
    else state.jsTourneys.splice(i, 1, tourney)
  } else if (tourney.state >= 0) {
    state.jsTourneys.unshift(tourney)
  }
}

export const setChat = (state, chat) => {
  const i = state.jsChats.findIndex(c => c.id === chat.id)
  if (i >= 0) return

  if (chat.to === `@${state.jsUser._id}`) {
    // if (!state.jsSet.has(chat.userId)) state.jsMap.add(chat.userId)
    if (state.jsPM.indexOf(chat.from.nick) < 0) state.jsPM.push(chat.from.nick)
  }
  state.jsChats.push(chat)
}
/*
export const setJsSet = (state, set) => {
  if (state.jsSet.has(set)) state.jsSet.delete(set)
  else state.jsSet.add(set)
}
*/
export const setJsMap = (state, map) => {
  switch (map.key) {
    case 't1': {
      state.jsT1 = map.value
      break
    }
    case 't2': {
      state.jsT2 = map.value
      break
    }
    case 't4': {
      state.jsT4 = map.value
      break
    }
    case 'pm': { // private message
      const i = state.jsPM.findIndex(p => p.id === map.value)
      if (i >= 0) {
        // state.jsPM.splice(i, 1)
      } else {
        state.jsPM.push(map.value)
      }
      break
    }
    case '-pm': { // private message
      const i = state.jsPM.findIndex(p => p.id === map.value)
      if (i >= 0) state.jsPM.splice(i, 1)
      break
    }
    case 'pf': { // player following
      state.jsPF = map.value
      break
    }
    default:
  }
}
