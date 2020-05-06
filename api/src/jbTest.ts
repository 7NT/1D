import { getScore, getScoreDown, getScorePlus } from './jbScore'
//ts-node jbTest
/*
const bid = []
const v = true
const x = false
const xx = true
for (let n = 1; n < 8; n++) {
  for (let s = 1; s < 6; s++) {
    bid.push({ bidN: n, bidS: s, })
  }
}
//console.log(bid)
for (let b = 0; b < bid.length; b++) {
  for (let r = 0; r < 7; r++) {
    const s = getScorePlus(bid[b], r, v, x, xx)
    if (s > 0) console.log(bid[b], v, x, xx, r, s)
  }
}
*/

const scores: number[] = [
  420,
  400,
  400,
  170,
  -50
]
const max = Math.max(...scores)
const min = Math.min(...scores)
console.log(min, max, scores)

const scoreMap = scoreX(scores)
console.log(scoreMap)

for (let [key, value] of scoreMap) {
  console.log(key + ' = ' + value)
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
    const m = (m1 + m2) / 2
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
