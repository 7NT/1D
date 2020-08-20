export function jbGetNick (p) {
  return p ? p.nick : null
}

export function jbGetSeat (p) {
  return p ? p.seat : null
}

export function jbPlayerSIcon (p) {
  const s = p.seat ? p.seat.sId : 0
  return jbSeatIcon(s)
}

export function jbSeatIcon (sId) {
  return `img:jbIcon/seats/seat${sId}.svg`
}

export function jbFlag (p) {
  if (p) {
    const flag2 = (p.flag || 'us').toLowerCase()
    return `img:flags/4x3/${flag2}.svg`
  } else return null
}

export function jbAvatar (p) {
  return p ? p.avatar : null
}

export function jbSameId (i0, i1) {
  return i0 === i1
}

export function jbIsMyPlayer (p, p0) {
  return p ? p.id === p0.id : false
}

export function jbIsMyNick (p, p0) {
  /*
  try {
    return p.nick.toLowerCase() === p0.nick.toLowerCase()
  } catch (err) {}
  */
  return p.toLowerCase() === p0.toLowerCase()
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

export const jbIsMyPd = (s1, s2) => {
  if (s1 === s2) return false
  else if (!jbIsPlayer(s1) || !jbIsPlayer(s2)) return false
  else return (s1 % 2) === (s2 % 2)
}

export function jbIsAdmin (p) {
  return p.status > 1
}
