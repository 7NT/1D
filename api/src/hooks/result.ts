// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers'

import { jbIMPs } from '../jbScore'

const onFind = (): Hook => {
  return async (context: HookContext) => {
    if (context.method === 'find') {
      const { user } = context.params
      if (user) {
        const played$ = context.app.service('played')
        let played = await played$.find({
          query: {
            $limit: 10,
            $select: ['bId'],
            uId: user._id
          }
        })
        if (played.data.length > 0) {
          const boardIds = played.data.map((x: { bId: any }) => x.bId)
          context.params.query = {
            bId: { $in: boardIds }
          }
          return Promise.resolve(context)
        }
      }
    }
    // throw new Error('no record');
    context.result = { data: [] }
  }
}

const onCreate = (): Hook => {
  return async (context: HookContext) => {
    const result = context.data
    if (result) {
      const results$ = context.service

      let results = await results$.find({
        query: {
          $select: ['_id', 'score'],
          // $sort: { score: -1 },
          'info.bT': result.info.bT,
          'info.bN': result.info.bN,
          'bId': result.bId
        },
        paginate: false
      })
      if (results.length > 0) {
        results.push({ _id: null, score: result.score })
        results.sort((a: { score: number }, b: { score: number }) => (a.score > b.score) ? 1 : -1)
        const boardIds = results.map((s: { _id: any }) => s._id)
        const rawscores = results.map((s: { score: number }) => s.score)
        let scoreMap: any
        switch (result.info.bT) {
          case 'MP': {
            scoreMap = scoreM(rawscores)
            break;
          }
          case 'IMP': {
            scoreMap = scoreI(rawscores)
            break;
          }
          case 'XIMP': {
            scoreMap = scoreX(rawscores)
            break;
          }
          default: return
        }

        results.forEach((r: any) => {
          const mix = scoreMap.get(r.score)
          if (!r._id) {
            context.data.mix = mix
          }else {
            results$.patch(r._id, { mix })
          }
        })
        context.data.updated = new Date().getTime()

        if (result.info.t2) {
          results = await results$.find({
            query: {
              $select: ['info.pairs', 'score'],
              'info.t2.t2Id': result.info.t2.t2Id
            },
            paginate: false
          })
          console.log(results)
          const pscores = []

          /*
          const tourney = context.app.service('tourneys').get(result.info.t2.t2Id)
          tourney.pairs.forEach((p:any) => {
            if (p.pN === result.info.t2.p1.pN || p.pN === result.info.t2.p2.pN) p.bN++
          })
          */
        }
      }
    }
    return Promise.resolve(context)
  }
}

function scoreM(scores: number[]) {
  const n = scores.length
  const sorted = scores.sort((a, b) => a - b)
  const scoreMap = new Map()

  for (let i = 0; i < n; i++) {
    const s = sorted[i]
    const j1 = sorted.indexOf(s)
    const j2 = sorted.lastIndexOf(s)
    const m1 = (j1) / (n - 1)
    const m2 = (j2) / (n - 1)
    const m = Math.round(((m1 + m2) / 2) * 100)
    //mp.push({ [s]: m })
    scoreMap.set(s, m)
  }
  // Get rid of douplicate values
  return scoreMap
}

function scoreI(scores: number[]) {
  const n = scores.length
  const sum: any = scores.reduce((a, b) => a + b, 0)
  let avg = sum / n
  if (n > 2) {
    const max = Math.max(...scores)
    const min = Math.min(...scores)
    avg = (sum - max - min) / (n - 2)
  }

  const scoreSet = new Set(scores)
  const scoreMap = new Map()

  scoreSet.forEach(s => {
    const diff = s - avg
    const i = Math.sign(diff) * jbIMPs(Math.abs(diff))
    scoreMap.set(s, i)
  })

  // Get rid of douplicate values
  return scoreMap
}

function scoreX(scores: number[]) {
  const scoreMap = new Map()

  scores.forEach(s => {
    const diff = scores.map(d => {
      return Math.sign(s - d) * jbIMPs(Math.abs(s - d))
    })
    const x = diff.reduce((a, b) => a + b, 0)
    scoreMap.set(s, x)
  })
  // Get rid of douplicate values
  return scoreMap
}

export {
  onFind,
  onCreate
}
