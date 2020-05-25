export const jbBidNS = (n, s) => {
  switch (s) {
    case 'C':
      return n + '♣'
    case 'D':
      return n + '♦'
    case 'H':
      return n + '♥'
    case 'S':
      return n + '♠'
    default:
      return n + s
  }
}

export const jbBidX = (by, turn) => {
  if (by < 1) return true
  else return (by - turn) % 2 === 0
}

export const jbBidXX = (X, turn) => {
  if (X < 1) return true
  else return (X - turn) % 2 === 0
}
