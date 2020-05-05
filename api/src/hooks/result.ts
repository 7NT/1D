// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'

const onFind = (): Hook => {
  return async (context: HookContext) => {
    if (context.method === 'find') {
      const { user } = context.params
      if (user) {
        const played$ = context.app.service('played')
        let played = await played$.find({
          query: {
            $limit: 10,
            $select: ['boardId'],
            uId: user._id
          }
        })
        if (played.data.length > 0) {
          const boardIds = played.data.map((x: { boardId: any }) => x.boardId)
          context.params.query = {
            boardId: { $in: boardIds }
          }
          return Promise.resolve(context)
        }
      }
    }
    // throw new Error('no record');
    context.result = { data: [] }
  }
}

/*
const onResult = (): Hook => {
  return async (context: HookContext) => {
    const { tId, result } = context.data
    if (result) {
      const tables$ = context.app.service('tables')
      const table = await tables$.get(tId)
      context.data.boardId = table.board._id
      context.data.players = table.seats
      context.data.board = table.board
      context.data.bids = table.bids
      context.data.plays = table.plays
      context.data.playedAt = new Date().getTime()
    }
    return Promise.resolve(context)
  }
}
*/

export {
  onFind
  // onResult
}
