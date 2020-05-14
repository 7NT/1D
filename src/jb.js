export const jbBoardMix = () => {
  const t = new Date().getTime()
  switch (t % 3) {
    case 1:
      return 'IMP'
    case 2:
      return 'XIMP'
    default:
      return 'MP'
  }
}

export const jbBoardVulN = (bN) => {
  switch (bN % 16) {
    case 1:
    case 8:
    case 11:
    case 14:
      return 0
    case 2:
    case 5:
    case 12:
    case 15:
      return 1
    case 3:
    case 6:
    case 9:
    case 0:
      return 2
    case 4:
    case 7:
    case 10:
    case 13:
      return 3
    default:
      return -1
  }
}

export const jbDealer = (bN) => {
  return ((bN - 1) % 4) + 1
}

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

export const jbCardSuit4 = (s4) => {
  switch (s4) {
    case 4:
      return 'NT'
    case 3:
      return 'C'
    case 2:
      return 'D'
    case 1:
      return 'H'
    case 0:
      return 'S'
    default:
      return ''
  }
}

export const jbCardSuit52 = (s52) => {
  s52--
  const s13 = Math.floor(s52 / 13)
  return jbCardSuit4(s13)
}

export const jbCardRankValue = (c52) => {
  const c13 = c52 % 13
  switch (c13) {
    case 12:
      return 'A'
    case 11:
      return 'K'
    case 10:
      return 'Q'
    case 9:
      return 'J'
    default:
      return c13 + 2
  }
}

export const jbCardCard52 = (c52) => {
  let c13 = c52 % 13
  if (c13) c13 = 13 - c13
  return {
    suit: jbCardRankValue(c52),
    rank: c13
  }
}

export const jbCardImg = (c52) => {
  const card = this.N52Card(c52)
  if (card) return `../statics/cards/${card.rank + card.suit}.svg`
  else return null
}

export const jbVoiceName = (s) => {
  const n = parseInt(s)
  const s0 = s.split(n)
  switch (s0) {
    case 'C':
      return `${n} Club`
    case 'D':
      return `${n} Diamond`
    case 'H':
      return `${n} Heart`
    case 'S':
      return `${n} Spade`
    case 'NT':
      return `${n} No Trump`
    case 'P':
      return 'Pass'
    case 'X':
      return 'Double'
    case 'XX':
      return 'Redouble'
    case 'A':
      return 'Ace'
    case 'K':
      return 'King'
    case 'Q':
      return 'Queen'
    case 'J':
      return 'Jack'
    default:
      return null
  }
}

// export default { jbSeat, jbBoard, jbBid, jbCard, jbUtil }
