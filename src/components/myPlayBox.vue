<template>
  <div id='playBox'>
    <img id='playCard1' class='card' :src='cardImg(1)' :style='zIndex(1)' />
    <img id='playCard4' class='card' :src='cardImg(4)' :style='zIndex(4)' />
    <img id='playCard2' class='card' :src='cardImg(2)' :style='zIndex(2)' />
    <img id='playCard3' class='card' :src='cardImg(3)' :style='zIndex(3)' />
  </div>
</template>

<script>
import { jbSeatX } from 'src/jbSeat'

export default {
  name: 'myPlayBox',
  props: ['jsPlayer', 'jsTable', 'review'],
  data: function () {
    return {
      card4: []
    }
  },
  computed: {
    mySeat () {
      return this.jsPlayer.seat
    },
    myPlays () {
      return this.jsTable.plays || null
    }
  },
  methods: {
    updatePlayed (plays) {
      try {
        if (this.jsTable.state > 1) {
          const l4 = plays.data.length
          let n4 = l4 % 4
          if (!n4) n4 = 4
          if (this.review) this.card4 = plays.data.slice(-4 - n4, -n4)
          else this.card4 = plays.data.slice(-n4)
        }
      } catch (err) {
        // console.log(err)
      }
    },
    cardImg (n) {
      const x = jbSeatX(n, this.mySeat.sId)
      const c = this.card4.filter(c => c.sId === x)[0] || null
      if (c) return `cards/${c.card.rank + c.card.suit}.svg`
      else return null
    },
    zIndex (n) {
      const x = jbSeatX(n, this.mySeat.sId)
      const c = this.card4.filter(c => c.sId === x)[0] || null
      if (c) return `z-index:${c.z}`
      else return -1
    }
  },
  watch: {
    myPlays (p) {
      this.updatePlayed(p)
    }
  },
  mounted () {
    this.updatePlayed(this.myPlays)
  }
}
</script>

<style scoped>
#playBox {
  position: relative;
  margin: auto;
  height: 160px;
  width: 160px;
  /* overflow: hidden; */
}
#playCard1 {
  position: absolute;
  top: 0px;
  left: 30px;
}
#playCard2 {
  position: absolute;
  top: 20px;
  right: 10px;
}
#playCard3 {
  position: absolute;
  bottom: 0px;
  left: 50px;
}
#playCard4 {
  position: absolute;
  top: 30px;
  left: 0px;
}
img {
  /*
  -moz-box-shadow: inset 0 0 2px #000000;
  -webkit-box-shadow: inset 0 0 2px #000000;
  box-shadow: inset 0 0 2px #000000;
  */
  border: 1px solid silver;
}
img.card {
  max-height: 96px;
  /*max-width: 76px;*/
}
</style>
