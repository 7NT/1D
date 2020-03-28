// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import { isPlayer, getMIX, vulN, N52Suit, N52Rank } from '../jb'


const sitBefore = (): Hook => {
  return async (context: HookContext) => {
    // const id = context.id
    const { tId: tId1, sId: sId1 } = context.data

    const { connection } = context.params
    if (connection) {
      const tableService = context.app.service('tables')
      const user = connection.user
      const { _id: uId, tId: tId0, sId: sId0 } = user

      if (tId0 && tId0 != tId1) {  //leave table
        try {
          let _table0 = await tableService.get(tId0)
          // free seat
          if (_table0.players < 2) {
            tableService.remove(tId0)
          } else {
            let tdata = {
              players: _table0.players - 1,
              seats: _table0.seats
            }
            if (isPlayer(sId0)) {
              if (tdata.seats[sId0 - 1] === uId) tdata.seats[sId0 - 1] = null
            }
            tableService.patch(tId0, tdata)
          }
          context.app.channel(`#${_table0.id}`).leave(connection)
        } catch (err) { }
      }
      if (!tId1) {  //new table
        const newTable = {
          id: uId,
          name: user.nick,
          state: 0,
          turn: 0,
          bt: getMIX(),
          players: 1,
          seats: [null, null, null, null]
        }
        newTable.seats[sId1 - 1] = uId
        let _table1 = await tableService.create(newTable)
        context.data.tId = _table1.id
        context.app.channel(`#${_table1.id}`).join(connection)
      } else {  //exist table
        let _table1 = await tableService.get(tId1)
        let _seats = _table1.seats

        if (tId1 != tId0) {
          // tdata.players++
          context.app.channel(`#${_table1.id}`).join(connection)
        }
        let n = 0
        _table1.seats.forEach((u: any, i: number) => {
          if (i === sId1 - 1 && u == null) {
            _seats[i] = uId
          } else if (u == uId) {
            _seats[i] = null
          }
          if (_seats[i] != null) n++
        })

        _table1.players = n
        _table1.seats = _seats
        if (n > 0 && _table1.state === 0 && isPlayer(sId1)) {
          let _board = await getBoard(_table1, context.app)
          _table1 = _board
          console.log(_table1)
        }
        tableService.patch(_table1.id, _table1)
      }
      return Promise.resolve(context)
    }
  }
}

async function getBoard (table: any, app: any) {
  const boardService = app.service("boards")
  const playedService = app.service("played")

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
    _board = await boardService.create({ bn: 0, cards: shuffle() })
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
    data: [{ seat: dealer, bid: "?" }]
  }
  // let _bids = await bids$.create(_bid)
  table.state = 1
  table.board = _board
  table.bid = _bid
  table.turn = dealer

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

const sitAfter = (): Hook => {
  return async (context: HookContext) => {
    const { tId, sId } = context.data
    const { connection } = context.params
    if (connection) {
      const userService = context.app.service('users')
      const user = connection.user

      let userData = { tId, sId }
      userService.patch(user._id, userData)
    }
    return Promise.resolve(context)
  }
}

const sitReset = (): Hook => {
  return async (context: HookContext) => {
    const { tId, sId } = context.data
    const { connection } = context.params
    if (connection) {
      const userService = context.app.service('users')
      const user = connection.user

      let userData = { tId, sId }
      userService.patch(user._id, userData)
    }
    return Promise.resolve(context)
  }
}

export {
  sitBefore,
  sitAfter,
  sitReset
}
