export const jbMix = () => {
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

export const jbCards = (data, s, t) => {
  const decodedData = Buffer.from(data, 'base64').toString('ascii')
  const cardData = decodedData.split(',').map(Number).slice((s - 1) * 13, s * 13)

  const t0 = jbSuit2N(t)
  const sorted = cardData
    .map(c => {
      if (jbCard2SN(c) <= t0) return c + 52
      else return c
    })
    .sort((a, b) => b - a)
  return sorted.map(c => jbCard52(c))
}

const jbCard2SN = (n) => {
  return Math.floor((n % 52) / 13) + 1
}

const jbSuit2N = (s) => {
  switch (s) {
    case 'C':
    case '♣':
      return 2
    case 'D':
    case '♦':
      return 1
    case 'H':
    case '♥':
      return 3
    case 'S':
    case '♠':
      return 4
    case 'NT':
      return 5
    default:
      return 0
  }
}

const jbCardSuit = (n) => {
  const s = Math.floor((n % 52) / 13) + 1
  return jbCardSuit4(s)
}

const jbCardSuit4 = (s4) => {
  switch (s4) {
    case 1:
      return 'D'
    case 2:
      return 'C'
    case 3:
      return 'H'
    case 4:
      return 'S'
    case 5:
      return 'NT'
    default:
      return ''
  }
}

const jbCardValue = (c52) => {
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

const jbCard52 = (c52) => {
  return {
    value: (c52 % 52),
    suit: jbCardSuit(c52),
    rank: jbCardValue(c52)
  }
}

export const jbCardImg = (card) => {
  // const card = jbCard52(c52)
  if (card) return `../statics/cards/${card.rank + card.suit}.svg`
  else return null
}

export const jbVulN = (bN) => {
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
