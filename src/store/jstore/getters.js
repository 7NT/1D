export const jsPlayer = state => {
  const p = state.jsPlayers.find(p => p.id === state.jsUser._id)
  if (p) return p
  else return state.jsUser
}

export const jsPlayerById = state => id => {
  return state.jsPlayers.find(p => p.id === id)
}

export const jsPlayerByNick = state => nick => {
  return state.jsPlayers.find(p => p.nick === nick)
}

export const jsTableById = state => id => {
  return state.jsTables.find(t => t.id === id)
}

export const jsTourneyById = state => id => {
  return state.jsTourneys.find(t => t._id === id)
}

export const jsTourneyByTD = state => td => {
  return state.jsTourneys.find(t => t.td === td)
}

export const jsTeamById = state => id => {
  return state.jsTeams.find(t => t.id === id)
}

export const jsResultById = state => tId => {
  return state.jsResults.find(t => t.tId === tId)
}

export const jsChatById = state => id => {
  return state.jsChats.find(c => c.to === id)
}
