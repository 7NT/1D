/*
export function someGetter (state) {
}
*/
export const myPlayer = state => {
  return state.players.find(player => player.id === state.user._id)
}

export const getPlayerById = state => id => {
  let p = state.players.find(p => p.id === id)
  if (!p) {
    p = state.users.find(user => user._id === id)
    // p.state = -1
  }
  return p
}

export const getTableById = state => id => {
  return state.tables.find(t => t.id === id)
}

export const getChatById = state => id => {
  return state.chats.find(c => c.to === id)
}

/*
export const myResults = state => {
  return state.results.find(result => result.players.includes(state.user._id))
}
*/
