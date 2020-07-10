// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import moment from 'moment'
// import mongoose from 'mongoose';
import { jbShuffleCards, jbVulN } from '../jbBoard'
import { jbGetScore } from '../jbScore'
import { t2Match, t2Table } from './tourneys'

const onTable = (): Hook => {
  return async (context: HookContext) => {
    const { ready, bids, plays, claim } = context.data

    if (ready) {
      context.data = await onReady(context)
      // const { connection } = context.params
      // const tId: any = context.id
      // if (tId && connection) context.app.channel(tId).join(connection)
    } else if (claim) {
      if (!claim) {
        context.data.alert = 'Claim is declined'
      } else if ((claim.o1 > 0 && claim.o2 > 0) || claim.claim === 'Concede All') {
        context.data = onClaim(context.data)
      }
    } else if (plays) {
      context.data = onPlay(context.data)
    } else if (bids) {
      context.data = onBid(context.data)
    }
    return Promise.resolve(context)
  }
}

async function onReady(context: any) {
  const { state, ready } = context.data
  switch (state) {
    case 0:
    case 3:
      {
        let sum = ready.reduce((acc: number, val: number) => {
          return acc + val
        })
        // if (sum === 10) await getBoard(context)
        if (sum > 0) return await getBoard(context)
      }
    default: return context.data
  }
}

async function getBoard(context: any) {
  const id = context.id

  if (id.startsWith('#@')) {
    let t1 = await context.service.get(context.id)
    if (t1.t2.bn < t1.t2.bN) return t2Board(context, t1.t2)
    else {
      // console.log(id, t1)
      await t2Pairs(context.app, t1.t2)
      t1.alert = 'Waiting...'
      t1.state = 0
      return t1
    }
  } else if (id.startsWith('##')) return t4Board(context)
  else if (id.startsWith('#')) return t1Board(context)
}

async function t1Board(context: any) {
  const boards$ = context.app.service('boards')
  const played$ = context.app.service('played')

  let t1 = await context.service.get(context.id)
  let nicks = t1.seats.filter((u: string) => u != null)
  let played_data = await played$.find({
    query: {
      $select: ['bId'],
      nick: { $in: nicks }
    }
  })

  const played_bIds = played_data.data.map((x: { bId: any }) => x.bId) // mongoose.Types.ObjectId(x.bId))
  let notPlayed_data = await boards$.find({
    query: {
      $limit: 1,
      $select: ['_id'],
      bT: t1.bT,
      _id: { $nin: played_bIds }
    }
  })
  const notPlayed_bIds = notPlayed_data.data.map((x: { _id: any }) => x._id)
  let board: any
  if (notPlayed_bIds.length > 0) board = await boards$.get(notPlayed_bIds[0])
  else {
    let bN_data: any = await boards$.find({
      query: {
        $limit: 1,
        $select: ['bN'],
        bT: t1.bT,
        $sort: { bN: -1 }
      }
    })
    let bNs: any = bN_data.data.map((x: { bN: number }) => x.bN)
    let bN = 0
    if (bNs.length > 0) bN = bNs[0]
    bN++

    const dt = new Date()
    const yyww = moment(dt).format('YY-WW')
    const bdata = {
      bId: yyww,
      bN,
      bT: t1.bT,
      played: 0,
      data: jbShuffleCards()
    }

    board = await boards$.create(bdata)
  }

  t1.seats.forEach((nick: any, index: number) => {
    if (nick) {
      const playedb = {
        bId: board._id,
        bT: board.bT,
        bN: board.bN,
        nick: nick,
        sId: index + 1
      }
      played$.create(playedb)
    }
  })

  board.players = t1.seats //download nicks
  let dealer = (board.bN - 1) % 4
  dealer++
  let bids = {
    info: { bidN: 0, bidS: 0, by: 0, P: 0, X: 0, XX: 0 },
    data: [{ sId: dealer, bid: '?' }]
  }

  t1.state = 1
  t1.board = board
  t1.bids = bids
  t1.turn = dealer
  t1.ready = [1, 2, 3, 4]

  return t1
}

async function t2Board(context: any, t2: any) {
  const played$ = context.app.service('played')
  const boards$ = context.app.service('boards')

  let played = await played$.find({
    query: {
      $select: ['bN'],
      bId: t2.t2Id,
      sId: { $in: [t2.p1.pN, t2.p2.pN] }
    }
  })

  const played_bIds = played.data.map((x: { bN: number }) => x.bN)
  let notPlayed = await boards$.find({
    query: {
      $select: ['_id'],
      bId: t2.t2Id,
      bN: { $nin: played_bIds }
    }
  })

  const notPlayed_bIds = notPlayed.data.map((x: { _id: any }) => x._id)
  const b1Id = notPlayed_bIds[Math.floor(Math.random() * notPlayed_bIds.length)]
  const board = await boards$.get(b1Id)

  let playedb = {
    bId: t2.t2Id,
    bN: board.bN,
    sId: t2.p1.pN
  }
  played$.create(playedb)
  playedb = {
    bId: t2.t2Id,
    bN: board.bN,
    sId: t2.p2.pN
  }
  played$.create(playedb)

  let dealer = (board.bN - 1) % 4
  dealer++
  let bids = {
    info: { bidN: 0, bidS: 0, by: 0, P: 0, X: 0, XX: 0 },
    data: [{ sId: dealer, bid: '?' }]
  }
  t2.bn++

  return {
    state: 1,
    board,
    bids,
    turn: dealer,
    ready: [1, 2, 3, 4],
    t2
  }
}

async function t4Board(app: any) {
  return null
}

async function t2Pairs(app:any, t1: any) {
  const tourneys$ = app.service("tourneys")
  const t2 = await tourneys$.get(t1.t2Id)
  const pairs = t2.pairs

  const Boards = t2.bN * t2.bR
  const pair12 = [t1.p1, t1.p2]
  const pairs1: any = []
  pair12.forEach ((p12: any) => {
    if (p12.boards >= Boards) {
      p12.state = -1  //closed
      pairs1.push(p12)
    } else {
      const pairs0 = pairs.filter((p: any) => p.state === 1 && !p12.played.includes(p.pN)).sort((a: { update: number }, b: { update: number }) => b.update - a.update)
      // console.log('p0', pairs0)
      if (pairs0.length > 0) {
        const match12 = t2Match(app, t2, pairs0[0], p12)
        // console.log('m12', match12)
        pairs1.push(match12)
      } else {
        p12.state = 1
        p12.update = new Date().getTime()
        pairs1.push(p12)
      }
    }
    // console.log(p12, pairs1)
  })
  tourneys$.patch(t1.t2Id, { pairs })
}

function onBid(tdata: any) {
  tdata = updateBid(tdata)
  let info = tdata.bids.info
  if (info.P > 3 || (info.P > 2 && info.by > 0)) {
    tdata.bids.data.pop()

    tdata.plays = {
      info: {
        trump: C1D2H3S4NT5(info.bidS),
        lead: null,
        winner: null,
        tricks: [0, 0],
      },
      data: []
    }
    if (info.P > 3) {
      tdata.state = 3 //review
      tdata.ready = [0, 0, 0, 0]
      tdata.turn = 0
      const result = {
        tricks: [0, 0]
      }
      tdata.result = result // onScore(result)
      tdata.score = 0
    } else {
      // tdata.board.cards = resortCards(tdata.board.cards)
      tdata.state = 2
      tdata.turn = (info.by % 4) + 1
    }
  }
  tdata.claim = null
  return tdata
}

function updateBid(tdata: any) {
  let suits = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]] // NS-EW suits
  let bidN = 0, bidS = 0, contract = 'passed'
  let by = 0, P = 0, X = 0, XX = 0, turn = 0

  let bids = tdata.bids
  bids.data.forEach((b: any) => {
    switch (b.bid) {
      case '?':
        turn = b.sId
        break
      case 'p':
      case 'pass':
        P++
        break
      case 'X':
        X = b.sId
        P = 0
        XX = 0
        break
      case 'XX':
        XX = b.sId
        P = 0
        X = 0
        break
      default:
        let _bN = parseInt(b.bid)
        let _bS = bidSuit(b.bid)
        if (_bN >= bidN && _bN < 8 && _bS > 0 && _bS < 6) {
          bidN = _bN
          bidS = _bS
          P = 0
          X = 0
          XX = 0
          let ne = (b.sId - 1) % 2
          _bS--
          if (suits[ne][_bS] === 0) suits[ne][_bS] = b.sId
          by = suits[ne][_bS]
          contract = b.bid
          if (XX) contract == 'XX'
          else if (X) contract == 'X'
        }
    }
  })

  let info = {
    bidN,
    bidS,
    contract,
    by,
    P,
    X,
    XX
  }
  tdata.bids.info = info
  tdata.turn = turn
  return tdata
}

function bidSuit(b: any) {
  let s = b.substring(1).trim()
  switch (s) {
    case '♣':
    case 'C': return 1
    case '♦':
    case 'D': return 2
    case '♥':
    case 'H': return 3
    case '♠':
    case 'S': return 4
    case 'NT': return 5
    default: return 0
  }
}

function C1D2H3S4NT5(n: number) {
  const suits = ['C', 'D', 'H', 'S', 'NT']
  switch (n) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      return suits[n - 1]
    default:
      return ''
  }
}

function onPlay(tdata: any) {
  let n = tdata.plays.data.length
  if (n < 1) return tdata

  let last = tdata.plays.data[n - 1]
  let winner = tdata.plays.info.winner
  let turn = last.sId
  let trump = tdata.plays.info.trump
  let lead = tdata.plays.info.lead
  let tricks = tdata.plays.info.tricks
  let scores = tdata.plays.info.scores
  let n4 = n % 4

  switch (n4) {
    case 1:
      lead = last
      winner = last
      break
    case 0:
    case 2:
    case 3:
      if (last.card.suit === winner.card.suit) {
        if (last.card.value > winner.card.value) winner = last
      } else if (last.card.suit === trump) {
        winner = last
      }
      break
    default:
  }
  if (n4 === 0) {
    lead = null
    if (winner.sId > 0) {
      last.winner = winner.sId
      if ((winner.sId % 2) === 1) tricks[0]++
      else tricks[1]++
    }
    turn = winner.sId - 1
  }

  tdata.plays.info = {
    trump,
    lead,
    winner,
    tricks,
    scores
  }
  tdata.turn = (turn % 4) + 1
  tdata.claim = null
  if (tricks[0] + tricks[1] === 13) {
    tdata.state = 3
    tdata.ready = [0, 0, 0, 0]
    tdata.turn = 0
    const result = { tricks }
    tdata.result = result //onScore(result)
    tdata.score = 0
  }
  return tdata
}

function onClaim(tdata: any) {
  let claim = tdata.claim
  let d = (claim.declarer - 1) % 2
  let o = (d + 1) % 2

  let tricks = claim.tricks // .slice(0)
  switch (claim.claim) {
    case 'Concede All':
      // claim.tricks[o] = 13 - claim.tricks[d]
      break
    case 'Claim Just Make':
      tricks[d] = 6 + claim.contract.bidN
      break
    case 'Claim All':
      tricks[d] = 13 - tricks[o]
      break
    default:
      return
  }
  tricks[o] = 13 - tricks[d]
  // tdata.claim.tricks = tricks
  tdata.state = 3
  tdata.ready = [0, 0, 0, 0]
  tdata.turn = 0
  const result = { tricks: claim.tricks }
  tdata.result = result // onScore(result)
  tdata.score = 0
  return tdata
}

const onState = (): Hook => {
  return async (context: HookContext) => {
    let { state } = context.data

    switch (state) {
      case 3: //review
        {
          onResult(context)
          break;
        }
      default:
    }
  }
}

async function onResult(context: any) {
  let { result } = context.data
  if (result && context.id) {
    const results$ = context.app.service('results')
    // const t1 = await context.service.get(context.id)
    const t1 = context.result

    const score = onScore(t1)
    const sdata = {
      tId: t1.id,
      bId: t1.board._id + '',
      info: {
        bN: t1.board.bN,
        bT: t1.board.bT,
        bV: jbVulN(t1.board.bN),
        contract: getContract(t1.bids.info),
        by: t1.bids.info.by,
        lead: getLead(t1.plays),
        cc: t1.cc,
        t2: t1.t2 ? t1.t2.t2Id : null,
        pairs: t1.t2 ? [t1.t2.p1.pN, t1.t2.p2.pN] : null
      },
      players: t1.seats,
      bids: JSON.stringify(t1.bids),
      plays: JSON.stringify(t1.plays),
      result: score.result,
      score: score.score,
      mix: t1.board.bT === 'MP' ? 50 : 0,
      played: new Date().getTime()
    }
    context.result.score = score
    await results$.create(sdata)
  }
}

function getContract(info: any) {
  if (info.by === 0) return 'Passed hand'
  else {
    let c = info.contract
    if (info.XX) c += 'XX'
    else if (info.X) c += 'X'
    return c
  }
}

function getLead(plays: any) {
  try {
    const card = plays.data[0].card
    return card.suit + card.rank
  } catch (err) {}
  return null
}

function onScore(tdata: any) {
  const rdata = {
    bV: jbVulN(tdata.board.bN),
    contract: tdata.bids.info,
    tricks: tdata.result.tricks,
    result: 0,
    score: 0
  }

  let result = 0
  let scores = [0, 0]
  if (rdata.contract.by > 0) { //passed
    const by0 = (rdata.contract.by - 1) % 2
    const by1 = (by0 + 1) % 2
    result = rdata.tricks[by0] - 6 - rdata.contract.bidN
    let score = jbGetScore(rdata, result)
    scores[by0] = score
    scores[by1] = -score
  }

  // rdata.scores = scores
  // score = scores[0]   //NS score
  return { result, score: scores[0] }
}

export {
  onTable,
  onState
}
