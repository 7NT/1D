
import { Hook, HookContext } from '@feathersjs/feathers'

const created = (): Hook => {
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

const onPairs = (): Hook => {
  return async (context: HookContext) => {
    const { pairs, state } = context.data

    // console.log(context)
    if (state) {
      context.data.pairs = onState(state, pairs)
    } else if (pairs) {
      context.data.pairs = onPair(pairs)
    }
    return Promise.resolve(context)
  }
}

function onPair (pairs: any[]) {
  let n: number = 1
  let pairs2: any[] = []
  pairs.forEach(p => {
    if (p.state > -2 && (p.player || p.partner)) {  // state: -2 remove, -1 pause, 0: waiting, 1 playing
      p.pN = n
      n++
      pairs2.push(p)
    }
  })
  return pairs2
}

function onState(state: number, pairs: any[]) {
  const n = pairs.length
  const pairs1 = []


}

export {
  created,
  onPairs
}
