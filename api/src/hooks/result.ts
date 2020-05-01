// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'

const onResult = (): Hook => {
  return async (context: HookContext) => {
    const { tId, result } = context.data
    if (result) {
      const tables$ = context.app.service('tables')
      const table = await tables$.get(tId)
      context.data.players = table.seats
      context.data.board = table.board
      context.data.bids = table.bids
      context.data.plays = table.plays
    }
    return Promise.resolve(context)
  }
}

export {
  onResult
}
