const getScore = function (bid: any, result: number) {
  const v = V12(bid.vulN, bid.by)
  const xx = bid.XX > 0
  const x = !xx && bid.X > 0

  if (result < 0) return getScoreDown(bid, result, v, x, xx)
  else return getScorePlus(bid, result, v, x, xx)
}

function V12(v: number, d: number) {
  switch (v) {
    case 0: return false
    case 3: return true
    case 1: return (d % 2) === 1
    case 2: return (d % 2) === 0
    default: return false
  }
}

const getScorePlus = function (bid: any, result: number, v: boolean, x: boolean, xx: boolean) {

  let base = 0
  if (result < (8 - bid.bidN)) {
    base = contractScore(bid, x, xx) * (xx ? 4 : (x ? 2 : 1))

    //game score
    if (base < 100) base += 50
    else base += v ? 500 : 300
    //slam
    if (bid.bidN > 5) base += (bid.bidN === 7) ? (v ? 1500 : 1000) : (v ? 750 : 500)

    //X
    base += xx ? 100 : (x ? 50 : 0)

    //overtricks
    if (result > 0) base += overTricks(bid, result, v, x, xx)
  }

  return base
}

function contractScore(bid: any, x: boolean, xx: boolean) {
  const n = bid.bidN
  switch (bid.bidS) {
    case 5: return 40 + 30 * (n - 1)
    case 4:
    case 3:
      return 30 * n
    case 2:
    case 1:
      return 20 * n
    default: return 0
  }
}

function overTricks(bid: any, result: number, v: boolean, x: boolean, xx: boolean) {
  if (xx) {
    return (v ? 400 : 200) * result
  } else if (x) {
    return (v ? 200 : 100) * result
  } else {
    switch (bid.bidS) {
      case 5:
      case 4:
      case 3:
        return 30 * result
      case 2:
      case 1:
        return 20 * result
      default: return 0
    }
  }
  return 0
}

const getScoreDown = function (bid: any, result: number, v: boolean, x: boolean, xx: boolean) {
  if (xx || x) {
    return downScoreX(result, v, x, xx)
  } else if (-result < (bid.bidN + 7)) {
    return result * 50 * (v ? 2 : 1)
  } else return 0
}

function downScoreX(n: number, v: boolean, x: boolean, xx: boolean) {
  switch (n) {
    case -1: {
      if (v) return 100 * (xx ? 4 : (x ? 2 : 1))
      else return 50 * (xx ? 4 : (x ? 2 : 1))
    }
    case -2:
    case -3: {
      if (v) return 100 * (xx ? 4 : (x ? 2 : 1)) + (-n - 1) * 150 * (xx ? 4 : (x ? 2 : 1))
      else return 50 * (xx ? 4 : (x ? 2 : 1)) + (-n - 1) * 100 * (xx ? 4 : (x ? 2 : 1))
    }
    default:
      if (v) return 100 * (xx ? 4 : (x ? 2 : 1)) + (-n - 1) * 150 * (xx ? 4 : (x ? 2 : 1))
      else return 50 * (xx ? 4 : (x ? 2 : 1)) + 200 * (xx ? 4 : (x ? 2 : 1)) + (-n - 3) * 150 * (xx ? 4 : (x ? 2 : 1))
  }
}

export {
  getScore,
  getScoreDown,
  getScorePlus
}
