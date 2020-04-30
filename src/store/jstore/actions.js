/*
export function someAction (context) {
}
*/
export const setUser = (context, payload) => {
  context.commit('setUser', payload)
}

export const addUser = (context, payload) => {
  context.commit('addUser', payload)
}

export const setPlayers = (context, payload) => {
  context.commit('setPlayers', payload)
}

export const setTables = (context, payload) => {
  context.commit('setTables', payload)
}

export const setPlayer = (context, payload) => {
  context.commit('setPlayer', payload)
}

export const setTable = (context, payload) => {
  context.commit('setTable', payload)
}

export const setChat = (context, payload) => {
  context.commit('setChat', payload)
}

export const setRoomId = (context, payload) => {
  context.commit('setRoomId', payload)
}
