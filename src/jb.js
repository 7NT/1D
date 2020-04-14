import { userService } from 'src/api'

const jb = {
  seatX (s, v) {
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
  },
  btMIX () {
    const t = new Date().getTime()
    switch (t % 3) {
      case 1:
        return 'IMP'
      case 2:
        return 'XIMP'
      default:
        return 'MP'
    }
  },
  isPlayer (seat) {
    switch (seat) {
      case 1:
      case 2:
      case 3:
      case 4:
        return true
      default:
        return false
    }
  },
  vulN (bn) {
    switch (bn % 16) {
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
  },
  dealer (bn) {
    return ((bn - 1) % 4) + 1
  },
  jbVoiceName (s) {
    const n = parseInt(s)
    const s0 = s.split(n)
    switch (s0) {
      case 'C':
        return `${n} Club`
      case 'D':
        return `${n} Diamond`
      case 'H':
        return `${n} Heart`
      case 'S':
        return `${n} Spade`
      case 'NT':
        return `${n} No Trump`
      case 'P':
        return 'Pass'
      case 'X':
        return 'Double'
      case 'XX':
        return 'Redouble'
      case 'A':
        return 'Ace'
      case 'K':
        return 'King'
      case 'Q':
        return 'Queen'
      case 'J':
        return 'Jack'
      default:
        return null
    }
  },
  bidNS (n, s) {
    switch (s) {
      case 'C':
        return n + '♣'
      case 'D':
        return n + '♦'
      case 'H':
        return n + '♥'
      case 'S':
        return n + '♠'
      default:
        return n + s
    }
  },
  bidX (by, turn) {
    if (by < 1) return true
    else return (by - turn) % 2 === 0
  },
  bidXX (X, turn) {
    if (X < 1) return true
    else return (X - turn) % 2 === 0
  },
  N4Suit (n4) {
    switch (n4) {
      case 4:
        return 'NT'
      case 3:
        return 'C'
      case 2:
        return 'D'
      case 1:
        return 'H'
      case 0:
        return 'S'
      default:
        return ''
    }
  },
  N52Suit (n52) {
    n52--
    const n13 = Math.floor(n52 / 13)
    return this.N4Suit(n13)
  },
  RankValue (n52) {
    const n13 = n52 % 13
    switch (n13) {
      case 12:
        return 'A'
      case 11:
        return 'K'
      case 10:
        return 'Q'
      case 9:
        return 'J'
      default:
        return n13 + 2
    }
  },
  N52Card (n52) {
    let n13 = n52 % 13
    if (n13) n13 = 13 - n13
    return {
      suit: this.N52Suit(n52),
      rank: n13
    }
  },
  cardImg (n52) {
    const card = this.N52Card(n52)
    if (card) return `../statics/cards/${card.rank + card.suit}.svg`
    else return null
  },
  async findUser (uid) {
    const user = await userService.get(uid)
    return user
  }
}

// module.exports = { getMIX, isPlayer, vulN, dealer, bidNS, X, XX, played4, findUser }
export default jb
