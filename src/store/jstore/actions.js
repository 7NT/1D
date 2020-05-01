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

export const addPlayer = (context, payload) => {
  context.commit('addPlayer', payload)
}

export const addTable = (context, payload) => {
  context.commit('addTable', payload)
}

export const setResults = (context, payload) => {
  context.commit('setResults', payload)
}

export const addResult = (context, payload) => {
  context.commit('addResult', payload)
}

export const setChat = (context, payload) => {
  context.commit('setChat', payload)
}

export const setRoomId = (context, payload) => {
  context.commit('setRoomId', payload)
}
