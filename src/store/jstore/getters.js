/*
export function someGetter (state) {}
*/
export const myPlayer = state => {
  const p = state.players.find(p => p.id === state.myUser._id)
  if (p) return p
  else return state.myUser
}

export const getPlayerById = state => id => {
  return state.players.find(p => p.id === id)
}

export const getPlayerByNick = state => nick => {
  return state.players.find(p => p.nick === nick)
}

export const getTableById = state => id => {
  return state.tables.find(t => t._id === id)
}

export const getResultById = state => tId => {
  return state.results.find(t => t.tId === tId)
}

export const getT2ById = state => id => {
  return state.tourneys.find(t => t._id === id)
}

export const getT2ByTD = state => td => {
  return state.tourneys.find(t => t.td === td)
}

export const getTeamById = state => id => {
  return state.teams.find(t => t.id === id)
}

export const getChatById = state => id => {
  return state.chats.find(c => c.to === id)
}
