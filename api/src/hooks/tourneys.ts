
import { Hook, HookContext } from '@feathersjs/feathers'

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
      context.data.pairs = onState(context, state, t2)
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
  const tables$ = app.service('tables')

  if (state === 1) t2Boards(app, t2)

  const pairs = shufflePair(t2.pairs)
  const N = Math.floor(pairs.length / 2)
  for (let i = 0; i < N; i++) {
    pairs[i].state = state
    pairs[N + i].state = state
    t2Table(tables$, t2, pairs[i], pairs[N + i])
  }

  t2.state = state
  return t2
}

async function t2Table(tables$: any, t2: any, p1: any, p2: any) {
  // console.log(t2)
  const name = `#@${t2.td}_${t2.bT}:${t2.bR}x${t2.bN}:${p1.pN}_${p2.pN}`
  const tdata = {
    id: name,
    name,
    action: 'open',
    state: 0,
    turn: 0,
    bT: t2.bT,
    players: 4,
    cc: ['SAYC', 'SAYC'],
    seats: [p1.player.nick, p2.partner.nick, p1.partner.nick, p2.player.nick],
    ready: [1, 2, 3, 4]
  }

  return await tables$.create(tdata)
}

async function t2Boards(app: any, t2: any) {
  const boards$ = app.service('boards')

  let board: any
  const N: number = t2.bR * (t2.bN + 1)

  for (let n: number = 1; n < N; n++) {
    const bdata = {
      t2Id: t2._id,
      bN: n,
      bT: t2.bT,
      played: 0,
      cards: shuffle()
    }
    board = await boards$.create(bdata)
  }
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
