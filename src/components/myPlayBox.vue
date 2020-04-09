<template>
  <div id="playBox">
    <img id="playCard1" class="card" :src="cardImg(1)" :style="zIndex(1)" />
    <img id="playCard4" class="card" :src="cardImg(4)" :style="zIndex(4)" />
    <img id="playCard2" class="card" :src="cardImg(2)" :style="zIndex(2)" />
    <img id="playCard3" class="card" :src="cardImg(3)" :style="zIndex(3)" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import jb from 'src/jb'

export default {
  name: 'myPlayBox',
  data: function () {
    return {
      card4: []
    }
  },
  computed: {
    ...mapGetters('jstore', ['myPlayer', 'myTable']),
    mySid () {
      return this.myPlayer.sId
    },
    myPlays () {
      return this.myTable.plays
    }
  },
  methods: {
    updatePlayed (plays) {
      try {
        if (this.myTable.state > 1) {
          const l4 = plays.data.length
          let n4 = l4 % 4
          if (!n4) n4 = 4
          this.card4 = plays.data.slice(-n4)
          console.log('winner', plays.info.winner, this.card4)
        }
      } catch (err) {
        console.log(err)
      }
    },
    cardImg (n) {
      const x = jb.seatX(n, this.mySid)
      const c = this.card4.filter(c => c.sId === x)[0] || null
      if (c) return `statics/cards/${c.card.rank + c.card.suit}.svg`
      else return null
    },
    zIndex (n) {
      const x = jb.seatX(n, this.mySid)
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
    console.log('card4x', this.card4, this.myPlayer)
    this.updatePlayed(this.myPlays)
  }
}
</script>

<style scoped>
#playBox {
  position: relative;
  width: 120px;
  height: 160px;
  margin: auto;
  overflow: visible;
}
#playCard1 {
  position: absolute;
  top: 0px;
  left: 30px;
}
#playCard2 {
  position: absolute;
  top: 30px;
  left: 60px;
}
#playCard3 {
  position: absolute;
  bottom: 20px;
  left: 40px;
}
#playCard4 {
  position: absolute;
  top: 40px;
  left: 0px;
}
img.card {
  max-height: 76px;
}
</style>
