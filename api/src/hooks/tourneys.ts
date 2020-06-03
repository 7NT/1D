
import { Hook, HookContext } from '@feathersjs/feathers'
import mongoose from 'mongoose';

const created = (): Hook => {
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

const onPairs = (): Hook => {
  return async (context: HookContext) => {
    const { pairs, state, t2 } = context.data

    if (state) {
      console.log(context.data)
      context.data = onState(context, state, t2)
    } else if (pairs) {
      context.data.pairs = onPair(pairs)
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

function onState(app: any, state: number, t2: any) {
  if (state === 1) t2Boards(app, t2)

  const pairs = shufflePair(t2.pairs)
  const N = Math.floor(pairs.length / 2)
  for (let i = 0; i < N; i++) {
    const p1 = pairs[i]
    const p2 = pairs[N + i]
    p1.state = state
    p2.state = state
    t2Table(app, t2, p1, p2)
  }

  t2.state = state
  return t2
}

async function t2Boards(app: any, t2: any) {
  const boards$ = app.service('boards')

  const N: number = t2.bR * (t2.bN + 1)
  for (let n: number = 1; n < N; n++) {
    const b2data = {
      t2Id: t2._id,
      bN: n,
      bT: t2.bT,
      played: 0,
      cards: shuffle()
    }
    console.log(b2data)
    await boards$.create(b2data)
  }
}

async function t2Board(app: any, t2: any, p1: any, p2: any) {
  const played$ = app.service('played')
  const boards$ = app.service('boards')

  let played = await played$.find({
    query: {
      $select: ['bN'],
      t2Id: t2.id,
      bT: t2.bT,
      pId: { $in: [p1.pN, p2.pN] }
    }
  })

  const played_bIds = played.data.map((x: { bN: number }) => mongoose.Types.ObjectId(x.bN))
  let notPlayed = await boards$.find({
    query: {
      $select: ['_id'],
      t2Id: t2.id,
      bT: t2.bT,
      bN: { $nin: played_bIds }
    }
  })

  const notPlayed_bIds = notPlayed.data.map((x: { _id: any }) => x._id)
  const b2Id = notPlayed_bIds[Math.floor(Math.random() * notPlayed_bIds.length)];
  const board = await boards$.get(b2Id)

  let playedb = {
    t2Id: t2.id,
    bN: board.bN,
    bT: board.bT,
    pId: p1.pN
  }
  played$.create(playedb)
  playedb = {
    t2Id: t2.id,
    bN: board.bN,
    bT: board.bT,
    pId: p2.pN
  }
  played$.create(playedb)

  return board
}

async function t2Table(app: any, t2: any, p1: any, p2: any) {
  const tables$ = app.service('tables')
  const players$ = app.service('players')

  const board = await t2Board(app, t2, p1, p2)
  let dealer = (board.bN - 1) % 4
  dealer++
  let bids = {
    info: { bidN: 0, bidS: 0, by: 0, P: 0, X: 0, XX: 0 },
    data: [{ sId: dealer, bid: '?' }]
  }

  const name = `#@${t2.td}_${t2.bT}:${t2.bR}x${t2.bN}:${p1.pN}_${p2.pN}`
  const tdata = {
    id: name,
    name,
    action: 'bid',
    board,
    bids,
    state: 1,
    turn: dealer,
    bT: t2.bT,
    players: 4,
    cc: [p1.cc, p2.cc],
    seats: [p1.player.nick, p2.partner.nick, p1.partner.nick, p2.player.nick],
    ready: [1, 2, 3, 4]
  }

  await tables$.create(tdata)
  t2Players(players$, p1, p2)

}

function t2Players(players$: any, p1: any, p2: any) {
  let seat = { tId: name, sId: 1 }
  players$.pitch(p1.player.id, { seat })

  seat = { tId: name, sId: 2 }
  players$.pitch(p2.partner.id, { seat })

  seat = { tId: name, sId: 3 }
  players$.pitch(p1.partner.id, { seat })

  seat = { tId: name, sId: 4 }
  players$.pitch(p2.player.id, { seat })

}

const shuffle = function () {
  /**
   * Shuffles array in place. ES6 version
   * @param {Array} n items An array containing the items.
   */
  let n = [...Array(52).keys()]  //.map(x => x + 1)
  for (let i = n.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [n[i], n[j]] = [n[j], n[i]]
  }

  let sort4 = []
  // for (let h in [0, 1, 2, 3]) {
  for (let h = 0; h < 4; h++) {
    const h1 = h * 13
    sort4.push(n.slice(h1, h1 + 13).sort((a, b) => b - a))
  }

  let card4: any = [[], [], [], []]
  for (let h in [0, 1, 2, 3]) {
    for (let i = 0; i < 13; i++) {
      let c = sort4[h][i] + 1
      let card = {
        value: c,
        suit: jbGetSuitN52(c),
        rank: jbGetRankN52(c)
      }
      card4[h].push(card)
    }
  }

  return card4
}

function shufflePair(array: any[]) {
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

export {
  created,
  onPairs
}
