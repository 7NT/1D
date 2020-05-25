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
