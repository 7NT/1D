// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import { isPlayer, getMIX, vulN, N52Suit, N52Rank } from '../jb'

const status = (): Hook => {
  return async (context: HookContext) => {
    const { seat } = context.data
    if (seat) {
      context.data = await beforeSit(context)
    }
    return Promise.resolve(context)
  }
}

async function beforeSit (context: any) {
  const { connection } = context.params
  // console.log('beforeSit', context.params, connection)
  if (connection) {
    const tableService = context.app.service('tables')
    const { user } = connection
    // const uId = user._id
    const { seat } = context.data
    // console.log('beforeSit', context.data, user)

    if (seat.tId0 !== seat.tId) {  //leave table
      if (seat.tId0) {
        leaveTable(tableService, user._id, seat)
        context.app.channel(`#${seat.tId0}`).leave(connection)
      }
    }

    let t1 = await getTable(tableService, user, seat)
    context.data.seat.tId = t1.id
    context.app.channel(`#${t1.id}`).join(connection);
    //return Promise.resolve(context)
  }
  return context.data
}

async function getTable (tservice$: any, user: any, seat: any) {
  let table: { seats: any[]; ready: any[]; state: number; id: any }
  if (!seat.tId) {  //new table
    table = await newTable(tservice$, user, getMIX(), seat)
  } else {
    table = await tservice$.get(seat.tId)
    let seats = table.seats
    let ready = table.ready
    let players = 0
    table.seats.forEach((p: any, i: number) => {
      if (i == seat.sId - 1 && p == null) {
        seats[i] = user._id
        // ready[i] = sId
      } else if (p == user._id) {
        seats[i] = null
        if (table.state < 1) ready[i] = 0
      }
      if (seats[i] != null) players++
    })
    const tdata = { players, seats, ready }
    tservice$.patch(table.id, tdata)
  }
  return table
}

async function newTable (tservice$: any, user: any, mix: any, seat: any) {
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
  tdata.seats[seat.sId - 1] = user._id
  // tdata.ready[sId - 1] = sId
  return await tservice$.create(tdata)
}

async function leaveTable (tservice$: any, pId: any, seat: any) {
  let table = await tservice$.get(seat.tId0)
  // free seat
  if (table.players < 2) {
    tservice$.remove(table.id)
  } else {
    let tdata = {
      players: table.players - 1,
      seats: table.seats,
      ready: table.ready
    }
    if (isPlayer(seat.sId0)) {
      let p = tdata.seats[seat.sId0 - 1]
      if (p) {
        if (p === pId) {
          tdata.seats[seat.sId0 - 1] = null
          if (table.state < 1) tdata.ready[seat.sId0 - 1] = 0
        }
      }
    }
    tservice$.patch(table.id, tdata)
  }
}
/*
const afterSit = (): Hook => {
  return async (context: HookContext) => {
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
    return Promise.resolve(context)
  }
}
*/
const logout = (): Hook => {
  return async (context: HookContext) => {
    const pId = context.id
    if (pId) {
      const userService = context.app.service('users')
      const playerService = context.app.service('players')
      const tableService = context.app.service('tables')

      let player = await playerService.get(pId)
      // console.log('logout', context.id, player)
      if (player) {
        const { seat } = player

        if (seat.tId) {
          let t = await tableService.get(seat.tId)
          // console.log('logout', t)
          if (t.players < 2) {
            tableService.remove(t.id)
          } else {
            seat.tId0 = seat.tId
            seat.sId0 = seat.sId
            leaveTable(tableService, pId, seat)
          }
        }
        const userData = { seat, state: 0, logoutAt: new Date().getTime() }
        userService.patch(pId, userData)
      }
    }
    return Promise.resolve(context)
  }
}

export {
  status,
  logout
}
