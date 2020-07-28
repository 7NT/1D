export const setJsUser = (context, payload) => {
  context.commit('setJsUser', payload)
}

export const setPlayers = (context, payload) => {
  context.commit('setPlayers', payload)
}

export const setTables = (context, payload) => {
  context.commit('setTables', payload)
}

export const setResults = (context, payload) => {
  context.commit('setResults', payload)
}

export const setTourneys = (context, payload) => {
  context.commit('setTourneys', payload)
}

export const setTeams = (context, payload) => {
  context.commit('setTeams', payload)
}

export const addPlayer = (context, payload) => {
  context.commit('addPlayer', payload)
}

export const addTable = (context, payload) => {
  context.commit('addTable', payload)
}

export const addResult = (context, payload) => {
  context.commit('addResult', payload)
}

export const updateResult = (context, payload) => {
  context.commit('updateResult', payload)
}

export const resetResults = (context, payload) => {
  context.commit('resetResults', payload)
}

export const addTourney = (context, payload) => {
  context.commit('addTourney', payload)
}

export const addChat = (context, payload) => {
  context.commit('addChat', payload)
}
/*
export const setJsSet = (context, payload) => {
  context.commit('setJsSet', payload)
}
*/
export const setJsMap = (context, payload) => {
  context.commit('setJsMap', payload)
}
