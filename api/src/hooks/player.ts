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

    if (seat.tId0 !== seat.tId) {  //leave table
      if (seat.tId0) {
        leaveTable(tables$, user._id, seat)
        context.app.channel(`#${seat.tId0}`).leave(connection)
      }
    }

    if (seat.tId === '#Lobby') {  //go to lobby
      context.data.seat.tId = '#Lobby'
      context.data.seat.sId = 0
    } else {
      let t1 = await getTable(tables$, user, seat)
      context.data.seat.tId = t1.id
      context.app.channel(t1.id).join(connection);
    }
  }
  return context.data
}

async function getTable(tables$: any, user: any, seat: any) {
  let t1: { seats: any[]; ready: any[]; state: number; id: any }
  if (!seat.tId) {  //new table
    t1 = await newTable(tables$, user, jbGetMIX(), seat)
  } else {
    t1 = await tables$.get(seat.tId)
    let action = 'sit'
    let seats = t1.seats
    let ready = t1.ready
    let players = 0
    t1.seats.forEach((p: any, i: number) => {
      if (i == seat.sId - 1 && p == null) {
        seats[i] = user._id
        // ready[i] = sId
      } else if (p == user._id) {
        seats[i] = null
        if (t1.state < 1) ready[i] = 0
      }
      if (seats[i] != null) players++
    })
    const tdata = { action, players, seats, ready }
    tables$.patch(t1.id, tdata)
  }
  return t1
}

async function newTable(tables$: any, user: any, mix: any, seat: any) {
  const tdata = {
    id: '#' + user._id,
    name: '#' + user.nick,
    action: 'open',
    state: 0,
    turn: 0,
    bT: mix,
    players: 1,
    cc: ['SAYC', 'SAYC'],
    seats: [null, null, null, null],
    ready: [0, 0, 0, 0]
  }
  tdata.seats[seat.sId - 1] = user._id

  return await tables$.create(tdata)
}

async function leaveTable(tables$: any, pId: any, seat: any) {
  if (seat.tId0 === '#Lobby') return

  let t1 = await tables$.get(seat.tId0)
  // free seat
  if (t1.players < 2) {
    tables$.remove(t1.id)
  } else {
    let tdata = {
      action: 'sit',
      players: t1.players - 1,
      seats: t1.seats,
      ready: t1.ready
    }
    if (jbIsPlayer(seat.sId0)) {
      let p = tdata.seats[seat.sId0 - 1]
      if (p == pId) {
        tdata.seats[seat.sId0 - 1] = null
        if (t1.state < 1) tdata.ready[seat.sId0 - 1] = 0
      }
      let uIds = t1.seats.filter((x: any) => x != null)
      if (uIds.length < 1) {
        t1.state = 0
        t1.ready = [0, 0, 0, 0]
      }
    }
    tables$.patch(t1.id, tdata)
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
      if (player) {
        const { seat } = player

        if (seat.tId !== '#Lobby') {
          let t1 = await tables$.get(seat.tId)
          if (t1.players < 2) {
            tables$.remove(t1.id)
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
