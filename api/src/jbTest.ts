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

const scores: number[] = [5, 7, 2, 9, 4, 3, 2]
const mp: number[] = scoreMP(scores)
const max = Math.max(...mp)
const min = Math.min(...mp)
console.log(scores, mp, Math.max(...mp), Math.min(...mp))
const mprank = mp.map(s => {
  console.log(s, max, min, (s - min) / (max - min))
  //(s-min)/(max-min)
})
console.log(mprank)
function scoreMP(scores: number[]) {
  const max = Math.max(...scores)
  const min = Math.min(...scores)
  // Create a temporary array to keep metadata regarding each entry of the original array
  const tmpArr = scores.map((v: number) => ({
    value: v,
    rank: (v - min) / (max - min),
  }));

  // Get rid of douplicate values
  const unique = new Set(scores);

  // Loops through the set
  for (let a of unique) {
    for (let b of tmpArr) {
      // increment the order of an element if a larger element is pressent
      if (b.value < a) {
        b.rank += 1;
      }
    }
  }

  // Strip out the unnecessary metadata
  return tmpArr.map((v: { rank: any }) => v.rank);
}
