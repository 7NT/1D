export function jbT1State (s1) {
  switch (s1) {
    case 0:
      return 'Ready'
    case 1:
      return 'Bidding'
    case 2:
      return 'Playing'
    case 3:
      return 'Reviewing'
    default:
      return 'Waiting'
  }
}
export function jbT2State (s1) {
  switch (s1) {
    case 1:
      return 'Waiting'
    case 2:
      return 'Playing'
    case -1:
      return 'closed'
    default:
      return ''
  }
}
