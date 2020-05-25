export const jbSeatName = (n) => {
  return ['North', 'East', 'South', 'West'][n]
}

export const jbSeatX = (s, v) => {
  // if (v < 1) v = 3
  const v0 = Math.abs(v)
  switch (v0) {
    case 1:
    case 2:
    case 3:
    case 4:
      v = v0 - 3
      break
    default:
      v = 0
  }
  let x = (s + v) % 4
  if (x <= 0) x += 4
  return x
}

export const jbSeat1234 = (s) => {
  let s1234 = s % 4
  if (s1234 < 1) s1234 += 4
  return s1234
}
