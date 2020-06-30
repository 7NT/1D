
import { Hook, HookContext } from '@feathersjs/feathers'
// import mongoose from 'mongoose';
import { jbShuffleCards, jbVulN, jbSuitN52, jbRankN52 } from '../jbBoard'

const onCreate = (): Hook => {
  return async (context: HookContext) => {
    const { minutes2 } = context.data

    if (minutes2) {
      const dt = new Date()
      dt.setMinutes(dt.getMinutes() + minutes2);
      context.data.startAt = dt
    }
    return Promise.resolve(context)
  }
}

const onState = (): Hook => {
  return async (context: HookContext) => {
    const { pairs, state, pstate } = context.data
    if (pairs) {
      context.data.pairs = onT2Pairs(state, pairs)
    } else if (pstate) {
      context.data.pairs = await onP2State(context, pstate)
    } else if (state >= 0) {
      context.data = await onT2State(context, state)
    }
    return Promise.resolve(context)
  }
}

function onT2Pairs (state: number, pairs: any[]) {
  switch (state) {
    case 0:
    case 1: {
      let n: number = 1
      let pairs2: any[] = []
      pairs.forEach(p => {
        if (p.state > -2) {
          if (state === 0 || (p.player && p.partner)) {
            p.pN = n
            p.boards = 0
            n++
            pairs2.push(p)
          }
        }
      })
      return pairs2
    }
    default: return pairs
  }
}

async function onT2State (context: any, state: number) {
  let t2 = await context.service.get(context.id)
  switch (state) {
    case 0: // waiting
    case 1: { // ready
      const pairs = onT2Pairs(state, t2.pairs)
      pairs.forEach((p: any) => {
        p.state = state
        p.score = t2.bT === 'MP' ? 50 : 0
        p.update = new Date().getTime()
        p.played = []
        console.log(state, p)
      })
      t2.pairs = pairs
      t2.state = state
      return t2
    }
    case 2: { // play
      t2Boards(context.app, t2)
      const pairs = shufflePairs(t2.pairs)
      const N = Math.floor(pairs.length / 2)
      for (let i = 0; i < N; i++) {
        const p1 = pairs[i]
        const p2 = pairs[N + i]
        p1.state = state
        p2.state = state
        p1.played.push(p2.pN)
        p2.played.push(p1.pN)
        p1.update = new Date().getTime()
        p2.update = new Date().getTime()
        t2Table(context.app, t2, p1, p2)
      }

      t2.pairs = pairs
      t2.state = state
      console.log(t2)
      return t2
    }
    case -1:  // close
    default: return t2
  }
}

async function t2Boards (app: any, t2: any) {
  const boards$ = app.service('boards')

  const N: number = t2.bR * (t2.bN + 1)
  for (let n: number = 1; n < N; n++) {
    const b2data = {
      bId: t2._id,
      bN: n,
      bT: t2.bT,
      played: 0,
      data: jbShuffleCards()
    }
    await boards$.create(b2data)
  }
}

async function t2Table (app: any, t2: any, p1: any, p2: any) {
  const tables$ = app.service('tables')
  const players$ = app.service('players')

  const t2Id = `#@${t2._id}:${p1.pN}-${p2.pN}`
  const name = `#@${t2.td} ${t2.bT}:${t2.bR}x${t2.bN}:${p1.pN}-${p2.pN}`
  const tdata = {
    id: t2Id,
    name,
    action: 'bid',
    state: 0,
    turn: 0,
    bT: t2.bT,
    players: 4,
    cc: [p1.cc, p2.cc],
    seats: [p1.player, p2.partner, p1.partner, p2.player],
    ready: [0, 0, 0, 0],
    t2: {
      t2Id: t2._id,
      p1,
      p2,
      bN: t2.bN,
      bn: 0
    }
  }
  await tables$.create(tdata)
  // t2Players(players$, t2.td, t2Id, p1, p2)
  players$({ multi: ['patch'] })
  await players$.patch(null, { seat: { td: t2.td, tId: t2Id, sId: 1 } }, { query: { nick: p1.player } })
  await players$.patch(null, { seat: { td: t2.td, tId: t2Id, sId: 2 } }, { query: { nick: p2.partner } })
  await players$.patch(null, { seat: { td: t2.td, tId: t2Id, sId: 3 } }, { query: { nick: p1.partner } })
  await players$.patch(null, { seat: { td: t2.td, tId: t2Id, sId: 4 } }, { query: { nick: p2.player } })

}

function shufflePairs (array: any[]) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

async function onP2State (context: any, p2: any) {
  const results$ = context.app.service("results")

  console.log(p2)
  /*
  let results = await results$.find({
    query: {
      $select: ['mix'],
      bT: table.bT,
      uId: { $in: uIds }
    }
  })
  */
  // return
}

async function onP2PairUp (context: any, p2: any) {
  // t2: { t2Id: t2._id, p1, p2, bN: t2.bN, bn: 0 }
  let t2 = await context.service.get(context.id)
  const pairs = t2.pairs.map((p: any) => p.state === 0)
  return null
}

export {
  onCreate,
  onState
}
