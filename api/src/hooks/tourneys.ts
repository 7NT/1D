
import { Hook, HookContext } from '@feathersjs/feathers'

const createdAt = (): Hook => {
  return async (context: HookContext) => {
    const { minutes2 } = context.data

    if (minutes2) {
      const dt = new Date()
      dt.setMinutes(dt.getMinutes() + minutes2);
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
    if (p.state > -2 && (p.player || p.partner)) {
      p.pN = n
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
