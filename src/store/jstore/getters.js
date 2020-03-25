/*
export function someGetter (state) {
}
*/
export const myPlayer = state => {
  return state.players.find(player => player.id === state.user._id)
}

export const myTable = state => {
  const t = state.tables.find(table => table.id === state.user.tId)
  return t
}

export const getPlayerById = state => id => {
  let p = state.players.find(player => player.id === id)
  if (!p) {
    p = state.users.find(user => user._id === id)
    // p.state = -1
  }
  return p
}

export const getTableById = state => id => {
  return state.tables.find(table => table._id === id)
}

export const getChats = state => id => {
  return state.chats.find(chat => chat.to === id)
}
