export const jbGetMIX = () => {
  let t = new Date().getTime();
  switch (t % 3) {
    case 1:
      return 'IMP';
    case 2:
      return 'XIMP';
    default:
      return 'MP';
  }
}

export const jbShuffleCards = () => {
  /**
   * Shuffles array in place. ES6 version
   * @param {Array} n items An array containing the items.
   */
  let n = [...Array(52).keys()]  //.map(x => x + 1)
  for (let i = n.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [n[i], n[j]] = [n[j], n[i]]
  }

  let sort4 = []
  // for (let h in [0, 1, 2, 3]) {
  for (let h = 0; h < 4; h++) {
    const h1 = h * 13
    sort4.push(n.slice(h1, h1 + 13).sort((a, b) => b - a))
  }

  let card4: any = [[], [], [], []]
  for (let h in [0, 1, 2, 3]) {
    for (let i = 0; i < 13; i++) {
      let c = sort4[h][i] + 1
      let card = {
        value: c,
        suit: jbGetSuitN52(c),
        rank: jbGetRankN52(c)
      }
      card4[h].push(card)
    }
  }

  return card4
}

export const jbGetVulN = (bN: number) => {
  switch (bN % 16) {
    case 1:
    case 8:
    case 11:
    case 14:
      return 0;
    case 2:
    case 5:
    case 12:
    case 15:
      return 1;
    case 3:
    case 6:
    case 9:
    case 0:
      return 2;
    case 4:
    case 7:
    case 10:
    case 13:
      return 3;
    default: return -1;
  }
}
