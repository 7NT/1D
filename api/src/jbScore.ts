export const jbGetScore = function (sdata: any, result: number) {
  const contract = sdata.contract
  const v = V12(sdata.vul, contract.declarer)
  const xx = contract.XX > 0
  const x = !xx && contract.X > 0

  if (result < 0) return getScoreDown(contract, result, v, x, xx)
  else return getScorePlus(contract, result, v, x, xx)
}

function V12 (v: number, d: number) {
  switch (v) {
    case 0: return false
    case 3: return true
    case 1: return (d % 2) === 1
    case 2: return (d % 2) === 0
    default: return false
  }
}

const getScorePlus = function (contract: any, result: number, v: boolean, x: boolean, xx: boolean) {
  let base = 0
  if (result < (8 - contract.bidN)) {
    base = contractScore(contract, x, xx) * (xx ? 4 : (x ? 2 : 1))

    //game score
    if (base < 100) base += 50
    else base += v ? 500 : 300
    //slam
    if (contract.bidN > 5) base += (contract.bidN === 7) ? (v ? 1500 : 1000) : (v ? 750 : 500)

    //X
    base += xx ? 100 : (x ? 50 : 0)

    //overtricks
    if (result > 0) base += overTricks(contract, result, v, x, xx)
  }

  return base
}

function contractScore (contract: any, x: boolean, xx: boolean) {
  const n = contract.bidN
  switch (contract.bidS) {
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

function overTricks (contract: any, result: number, v: boolean, x: boolean, xx: boolean) {
  if (xx) {
    return (v ? 400 : 200) * result
  } else if (x) {
    return (v ? 200 : 100) * result
  } else {
    switch (contract.bidS) {
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

const getScoreDown = function (contract: any, result: number, v: boolean, x: boolean, xx: boolean) {
  if (xx || x) {
    return downScoreX(result, v, x, xx)
  } else if (-result < (contract.bidN + 7)) {
    return result * 50 * (v ? 2 : 1)
  } else return 0
}

function downScoreX (n: number, v: boolean, x: boolean, xx: boolean) {
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

