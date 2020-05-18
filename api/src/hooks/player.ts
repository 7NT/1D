// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import { jbIsPlayer, jbGetMIX } from '../jb'

const onPlayer = (): Hook => {
  return async (context: HookContext) => {
    const { seat } = context.data
    if (seat) {
      context.data = await beforeSit(context)
    }
    return Promise.resolve(context)
  }
}

async function beforeSit(context: any) {
  const { connection } = context.params
  if (connection) {
    const tables$ = context.app.service('tables')
    const { user } = connection
    const { seat } = context.data

    // if (typeof (seat.tId) == "undefined") seat.tId = null
    // if (typeof (seat.tId0) == "undefined") seat.tId0 = null
    if (seat.tId0 !== seat.tId) {  //leave table
      if (seat.tId0) {
        leaveTable(tables$, user._id, seat)
        context.app.channel(`#${seat.tId0}`).leave(connection)
      }
    }

    if (seat.tId === '#Lobby') {  //go to lobby
      context.data.seat.tId = null
      context.data.seat.sId = 0
    } else {
      let t1 = await getTable(tables$, user, seat)
      context.data.seat.tId = t1.id
      context.app.channel(`#${t1.id}`).join(connection);
    }
  }
  return context.data
}

async function getTable(tables$: any, user: any, seat: any) {
  let table: { seats: any[]; ready: any[]; state: number; id: any }
  if (!seat.tId) {  //new table
    table = await newTable(tables$, user, jbGetMIX(), seat)
  } else {
    table = await tables$.get(seat.tId)
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
    tables$.patch(table.id, tdata)
  }
  return table
}

async function newTable(tables$: any, user: any, mix: any, seat: any) {
  const tdata = {
    id: user._id,
    name: '#' + user.nick,
    state: 0,
    turn: 0,
    bT: mix,
    players: 1,
    cc: ['SAYC', 'SAYC'],
    seats: [null, null, null, null],
    ready: [0, 0, 0, 0]
  }
  tdata.seats[seat.sId - 1] = user._id
  // console.log('newt', tdata)

  return await tables$.create(tdata)
}

async function leaveTable(tables$: any, pId: any, seat: any) {
  let table = await tables$.get(seat.tId0)
  // free seat
  if (table.players < 2) {
    tables$.remove(table.id)
  } else {
    let tdata = {
      players: table.players - 1,
      seats: table.seats,
      ready: table.ready
    }
    if (jbIsPlayer(seat.sId0)) {
      let p = tdata.seats[seat.sId0 - 1]
      if (p) {
        if (p === pId) {
          tdata.seats[seat.sId0 - 1] = null
          if (table.state < 1) tdata.ready[seat.sId0 - 1] = 0
        }
        let uIds = table.seats.filter((x: any) => x != null)
        if (uIds.length === 0) {
          table.state = 0
          table.ready = [0, 0, 0, 0]
        }
      }
    }
    //console.log('closet', tdata)
    tables$.patch(table.id, tdata)
  }
}
const onLogout = (): Hook => {
  return async (context: HookContext) => {
    const pId = context.id
    if (pId) {
      const users$ = context.app.service('users')
      const players$ = context.app.service('players')
      const tables$ = context.app.service('tables')

      let player = await players$.get(pId)
      // console.log('logout', context.id, player)
      if (player) {
        const { seat } = player

        if (seat.tId) {
          let t = await tables$.get(seat.tId)
          // console.log('logout', t)
          if (t.players < 2) {
            tables$.remove(t.id)
          } else {
            seat.tId0 = seat.tId
            seat.sId0 = seat.sId
            leaveTable(tables$, pId, seat)
          }
        }
        const userData = { seat, state: 0, logoutAt: new Date().getTime() }
        users$.patch(pId, userData)
      }
    }
    return Promise.resolve(context)
  }
}

export {
  onPlayer,
  onLogout
}
