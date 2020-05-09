/*
export function someGetter (state) {}
*/
export const myPlayer = state => {
  // if (state.user) return state.players.get(state.user._id) else return null
  return state.players.find(p => p.id === state.user._id)
}

export const getPlayerById = state => id => {
  // return state.players.get(id)
  return state.players.find(p => p.id === id)
}

export const getTableById = state => id => {
  // return state.tables.get(id)
  return state.tables.find(t => t.id === id)
}

export const getTourneyById = state => id => {
  return state.tourneys.find(t => t.id === id)
}

export const getTeamById = state => id => {
  return state.teams.find(t => t.id === id)
}

export const getChatById = state => id => {
  return state.chats.find(c => c.to === id)
}
