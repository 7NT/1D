
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
      context.data.pairs = onState(context.app, state, pairs)
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

function onState (app: any, state: number, pairs: any[]) {
  const tables$ = app.service('tables')
  const players$ = app.service('players')

  const pairs1 = shuffle(pairs)
  const N = Math.floor(pairs1.length / 2)
  for (let i = 0; i < N; i++) {
    pairs1[i].state = state
    pairs1[N + i].state = state

  }
  return pairs1
}

function shuffle (array: any[]) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


export {
  created,
  onPairs
}
