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
    const result = context.data
    if (result) {
      const bT = result.info.bT
      const results$ = context.app.service('results')

      let results = await results$.find({
        query: {
          $limit: 10,
          $select: ['result', 'score'],
        }
      })
      console.log(result, results)
      if (results.data.length > 0) {
        const boardIds = results.data.map((s: { _id: any }) => s._id)
        const rawscores = results.data.map((s: { score: number }) => s.score)
        console.log(boardIds, rawscores)
        let scoreMap: any
        switch (bT) {
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

        console.log('s', scoreMap)
        for (let [score, mix] of scoreMap) {
          const r = await results$.patch(null, {
            mix
          }, {
            query: {
              boardId: { $in: boardIds },
              score: score
            }
          })
          console.log('r', r)
        }
        context.data.updated = new Date().getTime()
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
    const i = Math.sign(diff) * IMP_table(Math.abs(diff))
    scoreMap.set(s, i)
  })

  // Get rid of douplicate values
  return scoreMap
}

function scoreX(scores: number[]) {
  const scoreMap = new Map()

  scores.forEach(s => {
    const diff = scores.map(d => {
      return Math.sign(s - d) * IMP_table(Math.abs(s - d))
    })
    const x = diff.reduce((a, b) => a + b, 0)
    scoreMap.set(s, x)
  })
  // Get rid of douplicate values
  return scoreMap
}

function IMP_table(s: number) {
  if (s < 20) return 0
  else if (s < 50) return 1
  else if (s < 90) return 2
  else if (s < 130) return 3
  else if (s < 170) return 4
  else if (s < 220) return 5
  else if (s < 270) return 6
  else if (s < 320) return 7
  else if (s < 370) return 8
  else if (s < 430) return 9
  else if (s < 500) return 10
  else if (s < 600) return 11
  else if (s < 750) return 12
  else if (s < 900) return 13
  else if (s < 1100) return 14
  else if (s < 1300) return 15
  else if (s < 1500) return 16
  else if (s < 1750) return 17
  else if (s < 2000) return 18
  else if (s < 2250) return 19
  else if (s < 2500) return 20
  else if (s < 3000) return 21
  else if (s < 3500) return 22
  else if (s < 4000) return 23
  else return 24
}

export {
  onFind,
  onResult
}
