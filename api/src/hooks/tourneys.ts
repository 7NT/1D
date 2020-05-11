
import { Hook, HookContext } from '@feathersjs/feathers'

const createdAt = (): Hook => {
  return async (context: HookContext) => {
    const { time, pairs } = context.data

    if (time) {
      const dt = new Date()
      dt.setMinutes(dt.getMinutes() + time);
      context.data.startAt = dt
    }
    return Promise.resolve(context)
  }
}

const pairUp = (): Hook => {
  return async (context: HookContext) => {
    const { pairs } = context.data

    if (pairs) {
      context.data.pairs = pairNo(pairs)
    }
    return Promise.resolve(context)
  }
}

function pairNo (pairs: any[]) {
  let n: number = 1
  pairs.forEach(p => {
    p.pairN = n
    n++
  })
  return pairs
}

export {
  createdAt,
  pairUp
}