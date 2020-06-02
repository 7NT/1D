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
