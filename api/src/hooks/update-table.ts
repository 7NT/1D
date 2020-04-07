// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import { isPlayer, getMIX, vulN, N52Suit, N52Rank } from '../jb'

const state = (): Hook => {
  return async (context: HookContext) => {
    const { board, bids, plays } = context.data
    if (plays) {
      context.data = playsUpdate(context.data)
    } else if (bids) {
      context.data = bidsUpdate(context.data)
    }
    return Promise.resolve(context)
  }
}

function bidsUpdate(tdata:any) {
  // console.log('b', tdata)
  let _bid = bidUpdate(tdata.bids)
  if (_bid.info.P > 3 || (_bid.info.P > 2 && _bid.info.by > 0)) {
    _bid.data.pop()

    tdata.plays = {
      info: {
        trump: _bid.info.contract,
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
    tdata.turn = (_bid.info.by % 4) + 1
  }
  tdata.bids = _bid
  return tdata
}

function bidUpdate(bid:any) {
  let suits = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]] // NS-EW suits
  let bidN = 0, bidS = 0, contract
  let by = 0, P = 0, X = 0, XX = 0

  bid.data.forEach((b:any) => {
    switch (b.bid) {
    case '?':
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

  bid.info.bidN = bidN
  bid.info.bidS = bidS
  bid.info.contract = contract
  bid.info.by = by
  bid.info.P = P
  bid.info.X = X
  bid.info.XX = XX
  // bid.turn = turn
  return bid
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
  let n = tdata.play.data.length
  let last = tdata.play.data[n - 1]
  let winner = tdata.play.info.winner
  let turn = last.sId
  let trump = tdata.play.info.trump
  let lead = tdata.play.info.lead
  let NS = tdata.play.info.NS
  let EW = tdata.play.info.EW
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
