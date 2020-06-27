// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
// import mongoose from 'mongoose';
import { jbIsPlayer } from '../jbPlayer'
import { jbMIX } from '../jbBoard'

const onPlayer = (): Hook => {
  return async (context: HookContext) => {
    const { seat } = context.data

    if (seat) {
      context.data = await playerSit(context)
    }
    return Promise.resolve(context)
  }
}

async function playerSit(context: any) {
  const { connection } = context.params
  if (connection) {
    const tables$ = context.app.service('tables')
    const { user } = connection
    const { seat } = context.data

    if (seat.tId0) {
      if (seat.tId0 !== seat.tId) {  //leave table
        const nick = user.nick
        playerPart(tables$, nick, seat)
        context.app.channel(`#${seat.tId0}`).leave(connection)
      }
    }

    if (seat.tId0 && !seat.tId) {  //go to lobby
      context.data.seat.tId = null
      context.data.seat.sId = 0
    } else {
      let t1 = await getTable(tables$, user, seat)
      context.data.seat.tId = t1.id
      console.log('c', t1.id)
      context.app.channel(t1.id).join(connection);
    }
  }
  return context.data
}

async function getTable(tables$: any, user: any, seat: any) {
  let t1: { _id: any, seats: any[]; ready: any[]; state: number; id: any }

  if (!seat.tId) {  //new table
    t1 = await newTable(tables$, user, seat)
  } else {
    const _id = seat.tId  // mongoose.Types.ObjectId(seat.tId)
    t1 = await tables$.get(_id)
    let action = 'sit'
    let seats = t1.seats
    let ready = t1.ready
    let players = 0
    const nick = user.nick
    t1.seats.forEach((p: any, i: number) => {
      if (i == seat.sId - 1 && p == null) {
        seats[i] = nick
        // ready[i] = sId
      } else if (p === nick) {
        seats[i] = null
        if (t1.state < 1) ready[i] = 0
      }
      if (seats[i] != null) players++
    })
    const tdata = { action, players, seats, ready }
    tables$.patch(_id, tdata)
  }
  return t1
}

async function newTable(tables$: any, user: any, seat: any) {
  const tdata = {
    id: '#' + user._id,
    name: '#' + user.nick,
    action: 'open',
    state: 0,
    turn: 0,
    bT: jbMIX(),
    players: 1,
    cc: ['SAYC', 'SAYC'],
    seats: [null, null, null, null],
    ready: [0, 0, 0, 0]
  }

  tdata.seats[seat.sId - 1] = user.nick
  return await tables$.create(tdata)
}

async function playerPart(tables$: any, nick: any, seat: any) {
  if (!seat.tId0) return

  const _id = seat.tId0  // mongoose.Types.ObjectId(seat.tId)
  let t1 = await tables$.get(_id)

  if (t1.players < 2) {   // free seat
    tables$.remove(_id)
  } else {
    let tdata = {
      action: 'sit',
      players: t1.players - 1,
      seats: t1.seats,
      ready: t1.ready
    }
    if (jbIsPlayer(seat.sId0)) {
      let p = tdata.seats[seat.sId0 - 1]
      if (p === nick) {
        tdata.seats[seat.sId0 - 1] = null
        if (t1.state < 1) tdata.ready[seat.sId0 - 1] = 0
      }
      let nicks = t1.seats.filter((x: any) => x != null)
      if (nicks.length < 1) {
        t1.state = 0
        t1.ready = [0, 0, 0, 0]
      }
    }
    tables$.patch(_id, tdata)
  }
}

const playerLogout = (): Hook => {
  return async (context: HookContext) => {
    const pId = context.id
    if (pId) {
      const users$ = context.app.service('users')
      const tables$ = context.app.service('tables')

      let player = await context.service.get(pId)
      if (player) {
        const { seat } = player
        if (seat.tId) {
          const _id = seat.tId  // mongoose.Types.ObjectId(seat.tId)
          let t1 = await tables$.get(_id)
          if (t1.players < 2) {
            tables$.remove(_id)
          } else {
            seat.tId0 = seat.tId
            seat.sId0 = seat.sId
            playerPart(tables$, player.nick, seat)
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
  playerLogout
}
