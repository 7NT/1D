// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import admin from 'firebase-admin'

// import mongoose from 'mongoose';
import { jbIsPlayer } from '../jbPlayer'
import { jbMIX } from '../jbBoard'

const onSit = (): Hook => {
  return async (context: HookContext) => {
    const { seat } = context.data
    if (seat) context.data = await playerSit(context, seat)
    return Promise.resolve(context)
  }
}

async function playerSit (context: any, seat: any) {
  const { connection, user } = context.params

  if (connection) {
    // console.log('sit', seat)
    if (seat.tId0) {
      if (seat.tId0 !== seat.tId) {  //leave table
        playerPart(context.app, user.nick, seat)
        context.app.channel(seat.tId0).leave(connection)
      }
    }

    if (seat.action === 'part') {  //go to lobby
      context.data.seat.tId = null
      context.data.seat.sId = 0
    } else {
      let t1 = await tableJoin(context.app, user, seat)
      context.data.seat.tId = t1.id
      context.app.channel(t1.id).join(connection)
    }
  }
  return context.data
}

async function tableJoin (app: any, user: any, seat: any) {
  const tables$ = app.service('tables')

  let t1: { _id: any, seats: any[]; ready: any[]; state: number; id: any }
  if (!seat.tId) {  //new table
    t1 = await newTable(tables$, user, seat)
  } else {
    const tId = seat.tId  // mongoose.Types.ObjectId(seat.tId)
    t1 = await tables$.get(tId)

    let seats = t1.seats
    let ready = t1.ready
    let players = 0
    const nick = user.nick
    t1.seats.forEach((p: any, i: number) => {
      if (i == seat.sId - 1 && p == null) {
        seats[i] = nick
        // ready[i] = sId
      } else if (p === nick) {
        if (!tId.startsWith('#@')) seats[i] = null
        if (t1.state < 1) ready[i] = 0
      }
      if (seats[i] != null) players++
    })
    const tdata = { players, seats, ready }
    tables$.patch(tId, tdata)
  }
  return t1
}

async function newTable (tables$: any, user: any, seat: any) {
  const sayc = {
    title: 'SAYC',
    link: 'https://bridgewinners.com/convention-card/print/modern-standard-american-2/4563'
  }

  const tdata = {
    id: '#' + user._id,
    name: '#' + user.nick,
    action: 'new',
    state: 0,
    turn: 0,
    bT: jbMIX(),
    players: 1,
    cc: [sayc, sayc],
    seats: [null, null, null, null],
    ready: [0, 0, 0, 0]
  }

  tdata.seats[seat.sId - 1] = user.nick

  let message = {
    data: {
      table: tdata.name,
      status: 'Open'
    },
    topic: 'Table'
  }
  onMessaging(message)

  return await tables$.create(tdata)
}

async function playerPart (app: any, nick: any, seat: any) {
  const tId0 = seat.tId0  // mongoose.Types.ObjectId(seat.tId)
  if (!tId0) return
  const tables$ = app.service('tables')

  try {
    let t0 = await tables$.get(tId0)

    if (t0.players < 2) {   // free seat
      tables$.remove(tId0)
    } else {
      let tdata = {
        players: t0.players - 1,
        seats: t0.seats,
        ready: t0.ready
      }
      if (jbIsPlayer(seat.sId0)) {
        let p = tdata.seats[seat.sId0 - 1]
        if (p === nick) {
          tdata.seats[seat.sId0 - 1] = null
          if (t0.state < 1) tdata.ready[seat.sId0 - 1] = 0
        }
        let nicks = t0.seats.filter((x: any) => x != null)
        if (nicks.length < 1) {
          t0.state = 0
          t0.ready = [0, 0, 0, 0]
        }
      }
      tables$.patch(tId0, tdata)
    }
  } catch (err) {
    // console.log('part', err)
    // throw new Error('Table Notfound')
  }
}

const onLogout = (): Hook => {
  return async (context: HookContext) => {
    const pId = context.id
    // console.log('logout', context)
    if (pId) {
      try {
        let player = await context.service.get(pId)
        if (player) {
          const users$ = context.app.service('users')
          const { seat } = player
          seat.tId0 = seat.tId
          seat.sId0 = seat.sId

          playerPart(context.app, player.nick, seat)
          const userData = { seat, state: 0, logoutAt: new Date().getTime() }
          users$.patch(pId, userData) // save for relogin
        }
      } catch (error) {
        // console.log('logout', error)
        throw new Error('Player Notfound')
      }
    }
    return Promise.resolve(context)
  }
}

function onMessaging (message: any) {
  // Send a message to devices subscribed to the provided topic.
  admin.messaging().send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response)
    })
    .catch((error) => {
      console.log('Error sending message:', error)
    })
}

export {
  onSit,
  onLogout
}
