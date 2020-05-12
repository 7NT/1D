
import { Hook, HookContext } from '@feathersjs/feathers'

const createdAt = (): Hook => {
  return async (context: HookContext) => {
    const { time } = context.data

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
    const { pairs, pair } = context.data

    if (pairs) {
      context.data.pairs = pairNo(pairs)
    }
    return Promise.resolve(context)
  }
}

function pairNo (pairs: any[]) {
  let n: number = 1
  let pairs2: any[] = []
  pairs.forEach(p => {
    if (p.player || p.partner) {
      p.pairN = n
      n++
      pairs2.push(p)
    }
  })
  return pairs2
}

export {
  createdAt,
  pairUp
}