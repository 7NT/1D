/*
export function someAction (context) {
}
*/
export const setMyUser = (context, payload) => {
  context.commit('setMyUser', payload)
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

export const addTourney = (context, payload) => {
  context.commit('addTourney', payload)
}

export const setChat = (context, payload) => {
  context.commit('setChat', payload)
}

export const setT04 = (context, payload) => {
  context.commit('setT04', payload)
}
