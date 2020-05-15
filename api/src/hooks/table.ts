// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import { jbGetVulN, jbGetSuitN52, jbGetRankN52, jbGetSuitN4 } from '../jb'
import { jbGetScore } from '../jbScore'

const onTable = (): Hook => {
  return async (context: HookContext) => {
    const { ready, bids, plays, claim } = context.data
    if (ready) {
      context.data = await onReady(context)
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

async function onReady (context: any) {
  const { state, ready } = context.data
  switch (state) {
    case -1:
    case 0:
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

async function getBoard (context: any) {
  const tables$ = context.app.service('tables')
  const boards$ = context.app.service('boards')
  const played$ = context.app.service('played')

  let table = await tables$.get(context.id)
  let uIds = table.seats.filter((x: any) => x != null)
  let played = await played$.find({
    query: {
      $select: ['boardId'],
      bT: table.bT,
      uId: { $in: uIds }
    }
  })

  let board: any
  try {
    const boardIds = played.data.map((x: { boardId: any }) => x.boardId)
    let notplayed = await played$.find({
      query: {
        $limit: 1,
        $select: ['boardId'],
        bT: table.bT,
        boardId: { $nin: boardIds }
      }
    })
    const boardId = notplayed.data.map((x: { boardId: any }) => x.boardId)
    board = await boards$.get(boardId[0])
  } catch (err) {
    let bns: any = await boards$.find({
      query: {
        $limit: 1,
        $select: ['bN'],
        bT: table.bT,
        $sort: {
          bN: -1
        }
      }
    })
    let bN: number = bns.data.map((x: { bN: any }) => x.bN)[0]
    if (typeof bN === 'undefined') bN = 1
    else bN++
    const createdAt = new Date().getTime();
    const cards = shuffle()
    const bdata = {
      bN,
      bT: table.bT,
      bV: jbGetVulN(bN),
      played: 0,
      cards,
      createdAt
    }
    board = await boards$.create(bdata)
  }

  table.seats.forEach((u: any, index: number) => {
    if (u)
      played$.create({
        boardId: board._id,
        bT: table.bT,
        uId: u,
        sId: index + 1,
        playedAt: new Date().getTime()
      })
  })

  board.players = table.seats //download uIds
  let dealer = (board.bN - 1) % 4
  dealer++
  let bids = {
    info: { bidN: 0, bidS: 0, by: 0, P: 0, X: 0, XX: 0 },
    data: [{ sId: dealer, bid: '?' }]
  }

  table.state = 1
  table.board = board
  table.bids = bids
  table.turn = dealer
  table.ready = [1, 2, 3, 4]

  return table
}
/*
function getNextBN (bT: string) {
  var sequenceDocument = db.counters.findAndModify({
    query: { _id: bT },
    update: { $inc: { sequence_value: 1 } },
    new: true
  });
  return sequenceDocument.sequence_value;
}
*/
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

function onBid (tdata: any) {
  tdata = updateBid(tdata)
  let info = tdata.bids.info
  if (info.P > 3 || (info.P > 2 && info.by > 0)) {
    tdata.bids.data.pop()

    tdata.plays = {
      info: {
        trump: CDHSNT12345(info.bidS),
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
    } else {
      tdata.state = 2
      tdata.turn = (info.by % 4) + 1
    }
  }
  tdata.claim = null
  return tdata
}

function updateBid (tdata: any) {
  let suits = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]] // NS-EW suits
  let bidN = 0, bidS = 0, contract
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

function bidSuit (b: any) {
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

function CDHSNT12345 (n: number) {
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

function onPlay (tdata: any) {
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
  }
  return tdata
}

function onClaim (tdata: any) {
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

  return tdata
}

const onResult = (): Hook => {
  return async (context: HookContext) => {
    let { result } = context.data
    if (result) {
      const results$ = context.app.service('results')
      let t: any
      if (context.id) {
        t = context.service.store[context.id]
        // console.log('t1', t)
      }
      if (!t) {
        const tables$ = context.app.service('tables')
        t = await tables$.get(context.id)
        // console.log('t2', t)
      }
      // if (context.id) console.log('t', context.service.store[context.id], t)

      const rdata = {
        bV: t.board.bV,
        contract: t.bids.info,
        tricks: result.tricks,
      }
      const score = onScore(rdata)
      const sdata = {
        boardId: t.board._id,
        board: { bN: t.board.bN, bT: t.board.bT, bV: t.board.bV },
        players: t.seats,
        bids: t.bids,
        plays: t.plays,
        result: score.result,
        score: score.score,
        playedAt: new Date().getTime()
      }

      results$.create(sdata)
      // context.data.result = score
    }
    return Promise.resolve(context)
  }
}

function onScore (rdata: any) {
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

  rdata.result = result
  // rdata.scores = scores
  rdata.score = scores[0]   //NS score

  return rdata
}

export {
  onTable,
  onResult
}
