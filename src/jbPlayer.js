export function jbGetNick (p) {
  return p ? p.nick : null
}

export function jbGetSeat (p) {
  return p ? p.seat : null
}

export function jbSeatIcon (p) {
  const s = p.seat ? p.seat.sId : 0
  return `img:statics/jbicon/seats/seat${s}.svg`
}
/*
export function jbPFlag (p) {
  return p ? p.profile.flag : null
}
*/
export function jbFlag (p) {
  if (p) {
    const flag2 = p.profile.flag.toLowerCase()
    return `img:statics/flags/4x3/${flag2}.svg`
  } else return null
}

export function jbAvatar (p) {
  return p ? p.profile.avatar : null
}

export function jbSameId (i0, i1) {
  return i0 === i1
}

export function jbIsMyPlayer (p, p0) {
  return p ? p.id === p0.id : false
}

export function jbIsMyNick (p, p0) {
  return p ? p.nick.toLowerCase() === p0.nick.toLowerCase() : false
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
