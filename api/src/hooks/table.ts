// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import { vulN, N52Suit, N52Rank } from '../jb'
import { getScore } from '../jbScore'

const onTable = (): Hook => {
  return async (context: HookContext) => {
    const { ready, bids, plays, claim } = context.data
    if (ready) {
      context.data = await onReady(context)
    } else if (claim) {
      if (claim.o1 > 0 && claim.o2 > 0) {
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
      bt: table.bt,
      uId: { $in: uIds }
    }
  })

  let board: { _id: any; bn: number; bt: any; vulN: any; players: any }
  try {
    const boardIds = played.data.map((x: { boardId: any }) => x.boardId)
    let notplayed = await played$.find({
      query: {
        $limit: 1,
        $select: ['boardId'],
        bt: table.bt,
        boardId: { $nin: boardIds }
      }
    })
    const boardId = notplayed.data.map((x: { boardId: any }) => x.boardId)
    // console.log(uIds, played, boardIds, notplayed, boardId)

    board = await boards$.get(boardId[0])
  } catch (err) {
    let bnx: any = await boards$.find({
      query: {
        $limit: 1,
        $select: ['bn'],
        bt: table.bt,
        $sort: {
          bn: -1
        }
      }
    })
    let bn: number = bnx.data.map((x: { bn: any }) => x.bn)[0]
    if (typeof bn === 'undefined') bn = 1
    else bn++
    const time = new Date().getTime();
    const cards = shuffle()
    board = await boards$.create({ bn, bt: table.bt, played: 0, cards, time })
  }

  table.seats.forEach((u: any, index: number) => {
    if (u)
      played$.create({
        boardId: board._id,
        bt: table.bt,
        uId: u,
        sId: index + 1,
        date: new Date().getTime()
      })
  })

  let dealer = (board.bn - 1) % 4
  dealer++

  board.bt = table.bt
  board.vulN = vulN(board.bn)
  board.players = table.seats //uIds

  let bids = {
    info: { bidN: 0, bidS: 0, by: 0, P: 0, X: 0, XX: 0 },
    data: [{ sId: dealer, bid: '?' }]
  }
  // let _bids = await bids$.create(_bid)
  table.state = 1
  table.board = board
  table.bids = bids
  table.turn = dealer
  table.ready = [1, 2, 3, 4]
  // return await tables$.patch(context.id, table)
  return table
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
        suit: N52Suit(c),
        rank: N52Rank(c)
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
        trump: info.contract,
        lead: null,
        winner: 0,
        tricks: [0, 0],
      },
      data: []
    }
    if (info.P > 3) {
      tdata.state = -1
      tdata.ready = [0, 0, 0, 0]
      tdata.turn = 0
      const result = {
        vul: tdata.board.vulN,
        contract: tdata.bids.info,
        tricks: [0, 0]
      }
      tdata.result = onScore(result)
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
      winner = last.sId
      break
    case 0:
    case 2:
    case 3:
      if (last.card.suit === lead.card.suit) {
        let v0 = lead.card.value // % 13
        let v1 = last.card.value // % 13
        if (v1 > v0) {
          lead = last
          winner = last.sId
        }
      } else if (trump.endsWith(last.card.suit)) {
        winner = last.sId
      }
      break
    default:
  }
  if (n4 === 0) {
    lead = null
    if (winner > 0) {
      last.winner = winner
      if ((winner % 2) === 1) tricks[0]++
      else tricks[1]++
    }
    turn = winner - 1
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
    tdata.state = -1
    tdata.ready = [0, 0, 0, 0]
    tdata.turn = 0
    const result = {
      vul: tdata.board.vulN,
      contract: tdata.bids.info,
      tricks: tdata.plays.tricks
    }
    tdata.result = onScore(result)
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
  tdata.state = -1
  tdata.ready = [0, 0, 0, 0]
  tdata.turn = 0
  const result = {
    vul: claim.vul,
    contract: claim.contract,
    tricks: claim.tricks
  }
  tdata.result = onScore(result)

  return tdata
}

function onScore (sdata: any) {
  // const contractN = 6 + info.contract.bidN
  let result = 0
  let scores = [0, 0]
  if (sdata.contract.by > 0) { //passed
    const by0 = (sdata.contract.by - 1) % 2
    const by1 = (by0 + 1) % 2
    result = sdata.tricks[by0] - 6 - sdata.contract.bidN
    let score = getScore(sdata, result)
    scores[by0] = score
    scores[by1] = -score
  }

  const rdata = {
    result,
    scores
  }
  return rdata
}

const onResult = (): Hook => {
  return async (context: HookContext) => {
    const { result } = context.data
    if (result) {
      const results$ = context.app.service('results')
      results$.create({ tId: context.id, result })
    }
    return Promise.resolve(context)
  }
}

export {
  onTable,
  onResult
}
