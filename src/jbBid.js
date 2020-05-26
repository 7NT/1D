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

export const jbSuitName = (s) => {
  switch (s) {
    case 'C':
    case '♣':
      return 'Clubs'
    case 'D':
    case '♦':
      return 'Diamonds'
    case 'H':
    case '♥':
      return 'Hearts'
    case 'S':
    case '♠':
      return 'Spades'
    case 'NT':
      return 'No Trump'
    default:
      return ''
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
