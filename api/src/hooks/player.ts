// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'
import { isPlayer, getMIX, vulN, N52Suit, N52Rank } from '../jb'

const beforeSit = (): Hook => {
  return async (context: HookContext) => {
    const { connection } = context.params
    if (connection) {
      const tableService = context.app.service('tables')
      const { user } = connection
      const uId = user._id
      const { tId: tId1, sId: sId1, tId0, sId0 } = context.data
      console.log('beforeSit', context.data, user)

      if (tId0 && tId0 != tId1) {  //leave table
        let t0 = await tableService.get(tId0)
        if (t0) {
          leaveTable(tableService, t0, uId, sId0)
          context.app.channel(`#${t0.id}`).leave(connection)
        }
      }
      if (!tId1) {  //new table
        let t1 = await newTable (tableService, user.nick, getMIX(), uId, sId1)
        context.data.tId = t1.id
        context.app.channel(`#${t1.id}`).join(connection)
      } else {
        let t1
        try {
          //exist table
          t1 = await tableService.get(tId1)
          let _seats = t1.seats

          if (tId1 != tId0) {
            // tdata.players++
            context.app.channel(`#${t1.id}`).join(connection)
          }
          let n = 0
          t1.seats.forEach((u: any, i: number) => {
            if (i === sId1 - 1 && u == null) {
              _seats[i] = uId
            } else if (u == uId) {
              _seats[i] = null
            }
            if (_seats[i] != null) n++
          })

          t1.players = n
          t1.seats = _seats
          if (n > 0 && t1.state === 0 && isPlayer(sId1)) {
            t1 = await getBoard(t1, context.app)
          }
          tableService.patch(t1.id, t1)
          console.log('t1', t1)
        } catch (err) {
          newTable (tableService, user.nick, getMIX(), uId, sId1)
        }
      }
      return Promise.resolve(context)
    }
  }
}

async function newTable (service: any, name: any, mix: any, uId: any, sId: number) {
  const tdata = {
    id: uId,
    name: name,
    state: 0,
    turn: 0,
    bt: mix,
    players: 1,
    seats: [null, null, null, null]
  }
  tdata.seats[sId - 1] = uId
  return await service.create(tdata)
}

async function leaveTable(tableService: any, t0: any, uId: any, sId0: number) {
  try {
    // free seat
    if (t0.players < 2) {
      tableService.remove(t0.id)
    } else {
      let tdata = {
        players: t0.players - 1,
        seats: t0.seats
      }
      if (isPlayer(sId0)) {
        if (tdata.seats[sId0 - 1] === uId) tdata.seats[sId0 - 1] = null
      }
      tableService.patch(t0.id, tdata)
    }
  } catch (err) {}
}

const afterSit = (): Hook => {
  return async (context: HookContext) => {
    const { connection } = context.params
    if (connection) {
      // const userService = context.app.service('users')
      const { user } = connection
      const uId = context.id

      let player
      if (uId) {
        player = context.service.store[uId]
      }
      console.log('after', context.data, player)
    }
    return Promise.resolve(context)
  }
}

async function getBoard (table: any, app: any) {
  const boardService = app.service('boards')
  const playedService = app.service('played')

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

const logout = (): Hook => {
  return async (context: HookContext) => {
    const uId = context.id
    if (uId) {
      const userService = context.app.service('users')
      const playerService = context.app.service('players')
      const tableService = context.app.service('tables')

      console.log('remove', uId)
      let player = await playerService.get(uId)
      console.log('player', player)
      if (player) {
        const { id: uId, tId, sId } = player

        if (tId) {
          let t = await tableService.get(tId)
          leaveTable(tableService, t, uId, sId)
        }
        const userData = { tId, sId, state: 0, logoutAt: new Date().getTime()}
        userService.patch(uId, userData)
      }
    }
    return Promise.resolve(context)
  }
}

export {
  beforeSit,
  afterSit,
  logout
}
