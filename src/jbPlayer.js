export function getNick (p) {
  return p ? p.nick : null
}

export function getSeat (p) {
  return p ? p.seat : null
}

export function getFlag (p) {
  return p ? p.profile.flag : null
}

export function getAvatar (p) {
  return p ? p.profile.avatar : null
}
// export default { jbSeat, jbBoard, jbBid, jbCard, jbUtil }
