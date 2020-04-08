// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import { isPlayer, getMIX, vulN, N52Suit, N52Rank } from '../jb'

const state = (): Hook => {
  return async (context: HookContext) => {
    const { board, bids, plays } = context.data
    // console.log(context)
    if (board) {
      // skip
    } else if (plays) {
      context.data = playsUpdate(context.data)
    } else if (bids) {
      context.data = bidsUpdate(context.data)
    }
    return Promise.resolve(context)
  }
}

function bidsUpdate(tdata:any) {
  tdata = bidUpdate(tdata)
  let bids = tdata.bids
  if (bids.info.P > 3 || (bids.info.P > 2 && bids.info.by > 0)) {
    bids.data.pop()

    tdata.plays = {
      info: {
        trump: bids.info.contract,
        lead: null,
        winner: 0,
        NS: 0,
        EW: 0,
        Score_NS: 0,
        Score_EW: 0
      },
      data: []
    }
    tdata.state = 2
    tdata.turn = (bids.info.by % 4) + 1
  }
  // tdata.bids = _bids
  return tdata
}

function bidUpdate(tdata:any) {
  let suits = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]] // NS-EW suits
  let bidN = 0, bidS = 0, contract
  let by = 0, P = 0, X = 0, XX = 0, turn = 0

  let bids = tdata.bids
  bids.data.forEach((b:any) => {
    switch (b.bid) {
    case '?':
      turn = b.seat
      break
    case 'P':
      P++
      break
    case 'X':
      X = b.seat
      P = 0
      XX = 0
      break
    case 'XX':
      XX = b.seat
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
        let ne = (b.seat - 1) % 2
        _bS--
        if (suits[ne][_bS] === 0) suits[ne][_bS] = b.seat
        by = suits[ne][_bS]
        contract = b.bid
        if (XX) contract =='XX'
        else if (X) contract =='X'
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

function bidSuit(b:any) {
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

function playsUpdate(tdata:any) {
  let n = tdata.plays.data.length
  if (n < 1) return tdata

  let last = tdata.plays.data[n - 1]
  let winner = tdata.plays.info.winner
  let turn = last.sId
  let trump = tdata.plays.info.trump
  let lead = tdata.plays.info.lead
  let NS = tdata.plays.info.NS
  let EW = tdata.plays.info.EW
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
      let v0 = lead.card.value % 13
      let v1 = last.card.value % 13
      if (!v0) v0 = 13
      if (!v1) v1 = 13
      if (v1 > v0) winner = last.sId
    } else if (trump.endsWith(last.card.suit)) {
      winner = last.sId
    }
    break
  default:
  }
  if (n4 === 0) {
    lead = null
    if (winner > 0) {
      if (winner % 2) EW++
      else NS++
    }
    turn = winner - 1
  }

  tdata.plays.info = {
    trump,
    lead,
    winner,
    NS,
    EW,
    Score_NS: 0,
    Score_EW: 0
  }
  tdata.turn = (turn % 4) + 1
  if (NS + EW === 13) tdata.state = 3
  return tdata
}

export {
  state
}
