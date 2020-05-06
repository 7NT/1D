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

const scores: number[] = [5, 7, 2, 9, 4, 3, 2, 9]
const max = Math.max(...scores)
const min = Math.min(...scores)
console.log(min, max, scores)

scoreMP2(scores)

function scoreMP (scores: number[]) {
  const max = Math.max(...scores)
  const min = Math.min(...scores)
  // Create a temporary array to keep metadata regarding each entry of the original array
  const rank = scores.map((v: number) => ({
    value: v,
    rank: (v - min) / (max - min),
  }));
  console.log(min, max, rank)
  return rank
}

function scoreMP2 (scores: number[]) {
  const n = scores.length
  const sorted = scores.sort()
  console.log(n, sorted)

  for (let i = 0; i < n; i++) {
    const v = sorted[i]
    const j1 = sorted.indexOf(v)
    const j2 = sorted.lastIndexOf(v)
    const r = j2 / (n - 1)
    console.log(i, v, j1, j2, r)
  }
  return sorted
}
