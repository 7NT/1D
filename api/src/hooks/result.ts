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
      const results = await results$.find({
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
          } else {
            results$.patch(r._id, { mix })
          }
        })
        context.data.updated = new Date().getTime()
      }

      if (result.info.pairs) {  // tourney
        const presults = await results$.find({
          query: {
            $select: ['info.pairs', 'mix'],
            'tId': result.tId
          },
          paginate: false
        })

        const pscores: any[] = []
        const score2 = result.info.bT === 'MP' ? 100 : 0
        presults.forEach((p: any) => {
          pscores.push({ pair: p.info.pairs[0], score: p.mix })
          pscores.push({ pair: p.info.pairs[1], score: score2 - p.mix })
        })

        // const pairs = [...new Set(pscores.map(p => p.pair))]
        const tourneys$ = context.app.service("tourneys")
        const t2 = await tourneys$.get(result.tId)
        let t2pairs0 = t2.pairs.map((p: any) => p.state === 0).sort((a: { update: number }, b: { update: number }) => a.update - b.update)  // waiting pairs
        const t2pair1 = t2.pairs.filter((p: any) => p.pN === result.info.pairs[0])[0]
        const t2pair2 = t2.pairs.filter((p: any) => p.pN === result.info.pairs[1])[0]

        console.log(t2pairs0, t2pair1, t2pair2)
        const Boards = t2.bN * t2.bR
        const pairUp = []
        t2.pairs.forEach((p: any) => {
          const scores = pscores.filter(p0 => p0.pair === p.pN).map(p1 => p1.score)
          p.boards = scores.length
          if (scores.length > 0) {
            p.score = scores.reduce((a, b) => a + b, 0) / scores.length
            if (p.boards >= Boards) p.state = -1 // closed
            else if (p.boards % t2.bN === 0) {
              if (p.pN === t2pair1.pN || p.pN === t2pair2.pN) {
                const t2pairs3 = t2pairs0.filter((p3: any) => !p.played.includes(p3.pN))
                if (t2pairs3.length > 0) {
                  const p3 = t2pairs3.pop()
                  t2pairs0 = t2pairs0.filter((p0: any) => p0.pN !== p3.pN)
                  pairUp.push({p1: p3.pN, p2: p.pN})
                  console.log(t2pairs3, p3, t2pairs0, pairUp)
                } else {
                  p.state = 0
                  p.update = new Date().getTime()
                }
              }
            }
          }
        })

        tourneys$.patch(result.tId, { action: 'update', state: t2.state, pairs: t2.pairs })
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
