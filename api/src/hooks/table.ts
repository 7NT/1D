// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import { isPlayer, getMIX, vulN, N52Suit, N52Rank } from '../jb'

const state = (): Hook => {
  return async (context: HookContext) => {
    const { ready, bids, plays, claim } = context.data
    if (ready) {
      context.data = await onReady(context)
    } else if (claim) {
      if (claim.r1 > 0 && claim.r2 > 0) {
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
  const tableService = context.app.service('tables')
  const boardService = context.app.service('boards')
  const playedService = context.app.service('played')

  let table = await tableService.get(context.id)
  let uIds = table.seats.filter((x: any) => x != null)
  let _played = await playedService.find({
    query: {
      $limit: 1,
      uId: { $nin: uIds }
    }
  })

  let _board: { _id: any; bn: number; bt: any; vulN: any; players: any }
  try {
    _board = await boardService.get(_played.data[0].boardId)
  } catch (err) {
    const time = new Date().getTime();
    const bn = time % 128
    const cards = shuffle()
    _board = await boardService.create({ bn, played: 0, cards, time })
  }

  uIds.forEach((u: any) => {
    if (u)
      playedService.create({
        boardId: _board._id,
        uId: u,
        date: new Date().getTime()
      })
  })

  let dealer = (_board.bn - 1) % 4
  dealer++

  _board.bt = table.bt
  _board.vulN = vulN(_board.bn)
  _board.players = table.seats //uIds

  let _bid = {
    info: { bidN: 0, bidS: 0, by: 0, P: 0, X: 0, XX: 0 },
    data: [{ sId: dealer, bid: '?' }]
  }
  // let _bids = await bids$.create(_bid)
  table.state = 1
  table.board = _board
  table.bids = _bid
  table.turn = dealer
  table.ready = [1, 2, 3, 4]
  // return await tableService.patch(context.id, table)
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
  let _tdata = updateBid(tdata)
  let _info = _tdata.bids.info
  if (_info.P > 3 || (_info.P > 2 && _info.by > 0)) {
    _tdata.bids.data.pop()

    _tdata.plays = {
      info: {
        trump: _info.contract,
        lead: null,
        winner: 0,
        tricks: [0, 0],
      },
      data: []
    }
    if (_info.P > 3) {
      _tdata.state = -1
      _tdata.turn = 0
      _tdata = getScore(_tdata, 0)
    } else {
      _tdata.state = 2
      _tdata.turn = (_info.by % 4) + 1
    }
  }
  _tdata.claim = null
  return _tdata
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
      case 'P':
      case 'Pass':
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

async function onPlay (tdata: any) {
  let n = tdata.plays.data.length
  if (n < 1) return tdata

  let last = tdata.plays.data[n - 1]
  let winner = tdata.plays.info.winner
  let turn = last.sId
  let trump = tdata.plays.info.trump
  let lead = tdata.plays.info.lead
  let tricks = tdata.plays.info.tricks
  let scores = tdata.plays.info.score
  let n4 = n % 4

  switch (n4) {
    case 1:
      lead = last
      winner = last.sId
      break
    case 0:
    case 2:
    case 3:
      // console.log(last.card.suit, lead.card.suit)
      if (last.card.suit === lead.card.suit) {
        let v0 = lead.card.value // % 13
        let v1 = last.card.value // % 13
        // if (!v0) v0 = 13
        // if (!v1) v1 = 13
        if (v1 > v0) {
          lead = last
          winner = last.sId
        }
        // console.log(v0, v1, winner)
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
    tdata.turn = 0
    tdata = await onScore(tdata)
  }
  return tdata
}

async function onClaim (tdata: any) {
  let claim = tdata.claim
  let d = (claim.by - 1) % 2
  let o = (d + 1) % 2

  let tricks = claim.tricks // .slice(0)
  switch (claim.claim) {
    case 'Concede All':
      // claim.tricks[o] = 13 - claim.tricks[d]
      break
    case 'Claim Just Make':
      tricks[d] = 6 + parseInt(claim.contract)
      break
    case 'Claim All':
      tricks[d] = 13 - tricks[o]
      break
    default:
      return
  }
  tricks[o] = 13 - tricks[d]
  tdata.plays.info.tricks = tricks
  tdata.state = -1
  tdata.turn = 0
  tdata = await onScore(tdata)

  return tdata
}

async function onScore (tdata: any) {
  const contractN = 6 + parseInt(tdata.bids.info.contract)
  let result = 0
  let score = 0
  if (tdata.bids.info.by > 0) { //passed
    const by01 = (tdata.bids.info.by - 1) % 2
    const playedN = tdata.plays.info.tricks[by01]
    result = playedN - contractN
    score = getScore(tdata.bids.info, result)
  }

  const rData = {
    players: tdata.seats,
    board: tdata.board,
    bids: tdata.bids,
    plays: tdata.plays,
    time: new Date().getTime(),
    result,
    score
  }
  return tdata
}

function getScore (bid: any, result: number) {
  const v = V12(bid.vulN, bid.by)
  const x = bid.X % 2 === bid.by % 2
  const xx = bid.XX % 2 === bid.by % 2

  if (result < 0) return getScoreDown(bid, result, v, x, xx)
  else return getScorePlus(bid, result, v, x, xx)
}

function V12 (v: number, d: number) {
  switch (v) {
    case 0: return false
    case 3: return true
    case 1: return (d % 2) === 1
    case 2: return (d % 2) === 0
    default: return false
  }
}

function getScorePlus (bid: any, result: number, v: boolean, x: boolean, xx: boolean) {
  let base = contractScore(bid, x, xx)

  //game score
  if (base < 100) base += 50
  else base += v ? 500 : 300
  //slam
  base += (bid.bidN === 7) ? (v ? 1500 : 1000) : ((bid.bidN === 6) ? (v ? 750 : 500) : 0)

  //X
  base += xx ? 100 : (x ? 50 : 0)

  //overtricks
  base += overTricks(bid, result, v, x, xx)

  return base
}

function contractScore (bid: any, x: boolean, xx: boolean) {
  const n = bid.bidN * (xx ? 4 : (x ? 2 : 1))
  switch (bid.bidS) {
    case 5: return 40 + 30 * (n - 1)
    case 4:
    case 3:
      return 30 * n
    case 2:
    case 1:
      return 20 * n
    default: return 0
  }
}

function overTricks (bid: any, result: number, v: boolean, x: boolean, xx: boolean) {
  if (xx) {
    return (v ? 400 : 200) * (result - bid.bidN)
  } else if (x) {
    return (v ? 200 : 100) * (result - bid.bidN)
  } else {
    switch (bid.bidS) {
      case 5:
      case 4:
      case 3:
        return 30 * (result - bid.bidN)
      case 2:
      case 1:
        return 20 * (result - bid.bidN)
      default: return 0
    }
  }
  return 0
}

function gameScore (bid: any, v: boolean, x: boolean, xx: boolean) {

}

function getScoreDown (bid: any, result: number, v: boolean, x: boolean, xx: boolean) {
  if (XX || X) {
    return downScore(result, v, x, xx)
  } else {
    return result * 50 * (v ? 2 : 1)
  }
}

function downScore (n: number, v: boolean, x: boolean, xx: boolean) {
  switch (n) {
    case -1: {
      if (v) return 100 * (xx ? 4 : (x ? 2 : 1))
      else return 50 * (xx ? 4 : (x ? 2 : 1))
    }
    case -2:
    case -3: {
      if (v) return 100 * (xx ? 4 : (x ? 2 : 1)) + (-n - 2) * 150 * (xx ? 4 : (x ? 2 : 1))
      else return 50 * (xx ? 4 : (x ? 2 : 1)) + (-n - 2) * 100 * (xx ? 4 : (x ? 2 : 1))
    }
    default:
      if (v) return 100 * (xx ? 4 : (x ? 2 : 1)) + (-n - 2) * 150 * (xx ? 4 : (x ? 2 : 1))
      else return (-n - 2) * 150 * (xx ? 4 : (x ? 2 : 1))
  }
}

export {
  state
}
