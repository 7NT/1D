// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import { isPlayer, getMIX, vulN, N52Suit, N52Rank } from '../jb'
// import tablesHooks from '../services/tables/tables.hooks'

const state = (): Hook => {
  return async (context: HookContext) => {
    const { ready, bids, plays } = context.data
    // console.log('table', context)
    if (ready) {
      // console.log('ready0', context.data)
      context.data = await onReady(context)
    } else if (plays) {
      context.data = onPlay(context.data)
    } else if (bids) {
      context.data = onBid(context.data)
    }
    return Promise.resolve(context)
  }
}

async function onReady (context:any) {
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
  let _uIds = table.seats.filter((x: any) => x != null)
  let _played = await playedService.find({
    query: {
      $limit: 1,
      uId: { $nin: _uIds }
    }
  })

  let _board: { _id: any; bn: number; bt: any; vulN: any; players: any }
  try {
    _board = await boardService.get(_played.data[0].boardId)
  } catch (err) {
    const time = new Date().getTime();
    const bn = time % 128
    const cards = shuffle()
    _board = await boardService.create({ bn, cards, time })
  }

  _uIds.forEach((u: any) => {
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
  _board.players = table.seats //_uIds

  let _bid = {
    info: { bidN: 0, bidS: 0, by: 0, P: 0, X: 0, XX: 0 },
    data: [{ seat: dealer, bid: '?' }]
  }
  // let _bids = await bids$.create(_bid)
  table.state = 1
  table.board = _board
  table.bids = _bid
  table.turn = dealer
  table.ready = [1,2,3,4]
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
        NS: 0,
        EW: 0,
        Score_NS: 0,
        Score_EW: 0
      },
      data: []
    }
    _tdata.state = 2
    _tdata.turn = (_info.by % 4) + 1
  }
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
        turn = b.seat
        break
      case 'P':
      case 'Pass':
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
