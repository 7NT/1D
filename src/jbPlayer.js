export function jbGetNick (p) {
  return p ? p.nick : null
}

export function jbGetSeat (p) {
  return p ? p.seat : null
}

export function jbGetFlag (p) {
  return p ? p.profile.flag : null
}

export function jbGetAvatar (p) {
  return p ? p.profile.avatar : null
}

export function jbIsMyPlayer (p, p0) {
  return p ? p.id === p0.id : null
}

export const jbIsPlayer = (seat) => {
  switch (seat) {
    case 1:
    case 2:
    case 3:
    case 4:
      return true
    default:
      return false
  }
}

export function jbIsAdmin (p) {
  return p.status > 1
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
