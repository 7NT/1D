
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
