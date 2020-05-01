import { getScore, getScoreDown, getScorePlus } from './jbScore'

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
