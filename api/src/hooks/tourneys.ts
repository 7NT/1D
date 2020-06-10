
import { Hook, HookContext } from '@feathersjs/feathers'
import mongoose from 'mongoose';
import { jbShuffleCards, jbGetVulN, jbGetSuitN52, jbGetRankN52 } from '../jb'

const onCreat = (): Hook => {
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

    if (state) {
      context.data = onT2State(context, state)
    } else if (pairs) {
      context.data.pairs = onPair(pairs)
    } else if (pstate) {
      context.data.pairs = onPState(context, pstate)
    }
    return Promise.resolve(context)
  }
}

function onPair(pairs: any[]) {
  let n: number = 1
  let pairs2: any[] = []
  pairs.forEach(p => {
    if (p.state > -2 && (p.player || p.partner)) {  // state: -2 remove, -1 pause, 0: waiting, 1 playing
      p.pN = n
      n++
      pairs2.push(p)
    }
  })
  return pairs2
}

async function onT2State(context: any, state: number) {
  state = 1
  let t2 = context.service.store[context.id]
  if (!t2) t2 = await context.service.get(context.id)
  if (state > 0) t2Boards(context.app, t2)

  const pairs = shufflePairs(t2.pairs)
  const N = Math.floor(pairs.length / 2)
  for (let i = 0; i < N; i++) {
    const p1 = pairs[i]
    const p2 = pairs[N + i]
    p1.state = state
    p2.state = state
    t2Table(context.app, t2, p1, p2)
  }

  t2.state = state
  return t2
}

async function t2Boards(app: any, t2: any) {
  const boards$ = app.service('boards')

  const N: number = t2.bR * (t2.bN + 1)
  for (let n: number = 1; n < N; n++) {
    const b2data = {
      bId: t2._id,
      bN: n,
      bT: t2.bT,
      played: 0,
      cards: jbShuffleCards()
    }
    await boards$.create(b2data)
  }
}

async function t2Table(app: any, t2: any, p1: any, p2: any) {
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
    seats: [p1.player.id, p2.partner.id, p1.partner.id, p2.player.id],
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
  t2Players(players$, t2Id, p1, p2)
}

function t2Players(players$: any, t2Id: any, p1: any, p2: any) {
  let seat = { tId: t2Id, sId: 1 }
  players$.patch(p1.player.id, { seat })

  seat = { tId: t2Id, sId: 2 }
  players$.patch(p2.partner.id, { seat })

  seat = { tId: t2Id, sId: 3 }
  players$.patch(p1.partner.id, { seat })

  seat = { tId: t2Id, sId: 4 }
  players$.patch(p2.player.id, { seat })

}

function shufflePairs(array: any[]) {
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

async function onPState(context: any, t2pairs: any) {
  // t2: { t2Id: t2._id, p1, p2, bN: t2.bN, bn: 0 }
  let t2 = context.service.store[context.id]
  if (!t2) t2 = await context.service.get(context.id)
  const pairs = t2.pairs.map((p:any) => p.state === 0)

  t2pairs.forEach((p: any) => {
    console.log(p)
    if (p.state === 0) {

    }
  })

  return
}

export {
  onCreat,
  onState
}
