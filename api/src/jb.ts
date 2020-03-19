export const getMIX = () => {
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

export const isPlayer = (seat: number) => {
  switch (seat) {
    case 1:
    case 2:
    case 3:
    case 4:
      return true;
    default:
      return false;
  }
}

const vulN = (bn: number) => {
  switch (bn % 16) {
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

const N52Suit = (n52: number) => {
  n52--;
  let n13 = Math.floor(n52 / 13);
  return N4Suit(n13);
}

const N52Rank = (n52: number) => {
  let n13 = n52 % 13;
  switch (n13) {
    case 0:
      return "A";
    case 12:
      return "K";
    case 11:
      return "Q";
    case 10:
      return "J";
    default:
      return n13 + 1;
  }
}

const N4Suit = (n4: number) => {
  switch (n4) {
    case 4:
      return 'NT';
    case 3:
      return 'S';
    case 2:
      return 'H';
    case 1:
      return 'C';
    case 0:
      return 'D';
    default:
      return '';
  }
}

// module.exports = { getMIX, isPlayer, vulN, N4Suit, N52Suit, N52Rank };
