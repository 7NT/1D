export const jbV2C = (v) => {
  if (!v) return null
  else if (v.startsWith('jo')) return 'join'
  else if (v.startsWith('nor')) return 'north'
  else if (v.startsWith('eas')) return 'east'
  else if (v.startsWith('sou')) return 'south'
  else if (v.startsWith('wes')) return 'west'
  else if (v.startsWith('rea')) return 'ready'
  else if (v.startsWith('tour')) return 'tourney'
  else return v
}

export const jbV2W = (v) => {
  if (!v) return null
  else if (v.startsWith('pas')) return 'p'
  else if (v.startsWith('doub')) return 'x'
  else if (v.startsWith('redoub')) return 'xx'
  else if (v.startsWith('wi')) return '1'
  else if (v.startsWith('tu')) return '2'
  else if (v.startsWith('th')) return '3'
  else if (v.startsWith('fo')) return '4'
  else if (v.startsWith('fi')) return '5'
  else if (v.startsWith('si')) return '6'
  else if (v.startsWith('se')) return '7'
  else return v
}

export const jbV2S = (v) => {
  if (!v) return null
  else if (v.startsWith('cl')) return 'c'
  else if (v.startsWith('dia')) return 'd'
  else if (v.startsWith('hear')) return 'h'
  else if (v.startsWith('sp')) return 's'
  else if (v.startsWith('no')) return 'nt'
  else return v
}

export const jbV2N = (v) => {
  switch (v) {
    case 'one': return 1
    case 'two': return 2
    case 'three': return 3
    case 'four': return 4
    case 'five': return 5
    case 'six': return 6
    case 'seven': return 7
    case 'eight': return 8
    case 'nine': return 9
    case 'ten': return 10
    case 'jack': return 'J'
    case 'queen': return 'Q'
    case 'king': return 'K'
    case 'ace': return 'A'
    default: return v
  }
}
