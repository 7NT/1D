// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import { isPlayer, getMIX, vulN, N52Suit, N52Rank } from '../jb'

const status = (): Hook => {
  return async (context: HookContext) => {
    const { sId } = context.data
    if (sId) {
      context.data = await beforeSit(context)
    }
    return Promise.resolve(context)
  }
}

async function beforeSit (context:any) {
  const { connection } = context.params
  if (connection) {
    const tableService = context.app.service('tables')
    const { user } = connection
    // const uId = user._id
    const { tId: tId1, sId: sId1, tId0, sId0 } = context.data
    // console.log('beforeSit', context.data, user)

    if (tId0 !== tId1) {  //leave table
      if (tId0) {
        leaveTable(tableService, user, tId0, sId0)
        context.app.channel(`#${tId0}`).leave(connection)
      }
    }

    let t1 = await getTable(tableService, user, tId1, sId1)
    context.data.tId = t1.id
    context.app.channel(`#${t1.id}`).join(connection);
    //return Promise.resolve(context)
  }
  return context.data
}

async function getTable (tservice$: any, user: any, tId: any, sId: number) {
  let table
  if (!tId) {  //new table
    table = await newTable(tservice$, user, getMIX(), sId)
  } else {
    table = await tservice$.get(tId)
    let seats = table.seats
    let ready = table.ready
    let players = 0
    table.seats.forEach((p: any, i: number) => {
      if (i == sId - 1 && p == null) {
        seats[i] = user._id
        // ready[i] = sId
      } else if (p == user._id) {
        seats[i] = null
        ready[i] = 0
      }
      if (seats[i] != null) players++
    })
    const tdata = { players, seats, ready }
    tservice$.patch(table.id, tdata)
  }
  return table
}

async function newTable (tservice$: any, user: any, mix: any, sId: number) {
  const tdata = {
    id: user._id,
    name: '#' + user.nick,
    state: 0,
    turn: 0,
    bt: mix,
    players: 1,
    seats: [null, null, null, null],
    ready: [0, 0, 0, 0]
  }
  tdata.seats[sId - 1] = user._id
  // tdata.ready[sId - 1] = sId
  return await tservice$.create(tdata)
}

async function leaveTable (tservice$: any, user: any, tId: any, sId: number) {
  let table = await tservice$.get(tId)
  // free seat
  if (table.players < 2) {
    tservice$.remove(table.id)
  } else {
    let tdata = {
      players: table.players - 1,
      seats: table.seats,
      ready: table.ready
    }
    if (isPlayer(sId)) {
      let p = tdata.seats[sId - 1]
      if (p) {
        if (p.pId === user._id) {
          tdata.seats[sId - 1] = null
          tdata.ready[sId - 1] = 0
        }
      }
    }
    tservice$.patch(table.id, tdata)
  }
}

const afterSit = (): Hook => {
  return async (context: HookContext) => {
    /*
    const { connection } = context.params
    if (connection) {
      // const userService = context.app.service('users')
      // const { user } = connection
      const uId = context.id

      let player
      if (uId) {
        player = context.service.store[uId]
      }
      // console.log('after', context.data, player)
    }
    */
    return Promise.resolve(context)
  }
}

const logout = (): Hook => {
  return async (context: HookContext) => {
    const uId = context.id
    if (uId) {
      const userService = context.app.service('users')
      const playerService = context.app.service('players')
      const tableService = context.app.service('tables')

      let player = await playerService.get(uId)
      if (player) {
        const { id: uId, tId, sId } = player

        if (tId) {
          let t = await tableService.get(tId)
          leaveTable(tableService, t, uId, sId)
        }
        const userData = { tId, sId, state: 0, logoutAt: new Date().getTime() }
        userService.patch(uId, userData)
      }
    }
    return Promise.resolve(context)
  }
}

export {
  status,
  logout
}
