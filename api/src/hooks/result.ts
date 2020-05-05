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

const onResult = (): Hook => {
  return async (context: HookContext) => {
    const { result } = context.data
    if (result) {
      const results$ = context.app.service('results')
      const results = await results$.find({
        query: {
          $select: ['_id', 'scores'],
          boardId: result.boardId
        }
      })
      const bt = result.board.bt
      switch (bt) {
        case 'MP': {
          scoreMP(results)
          break;
        }
        case 'IMP': {
          scoreIMP(results)
          break;
        }
        case 'XIMP': {
          scoreXIMP(results)
          break;
        }
        default: return
      }
      context.data.updatedAt = new Date().getTime()
    }
    return Promise.resolve(context)
  }
}

function scoreMP(scores: number[]) {
  // Create a temporary array to keep metadata regarding each entry of the original array
  const tmpArr = scores.map((v: number) => ({
    value: v,
    rank: 1,
  }));

  // Get rid of douplicate values
  const unique = new Set(scores);

  // Loops through the set
  for (let a of unique) {
    for (let b of tmpArr) {
      // increment the order of an element if a larger element is pressent
      if (b.value < a) {
        b.rank += 1;
      }
    }
  }

  // Strip out the unnecessary metadata
  return tmpArr.map((v: { rank: any }) => v.rank);
}

export {
  onFind
  // onResult
}
