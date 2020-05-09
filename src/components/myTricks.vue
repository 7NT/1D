<template>
  <div class="row items-end" v-if="isVisible">
    <div class="column">
      <div class="row self-start no-wrap">
        <q-card
          flat
          class="transparent"
        >
          <q-card-section>
            <div class="hand hhand-compact active-hand full-width">
              <span v-for="(c, i) of playedCards" :key="`${i}`" class="card">
                <img :src="cardback(c)" :class="trickClass(c, i)" :style="`z-index:${i}`" />
                <q-tooltip content-class="bg-info" anchor="top right" self="bottom left">
                  <myPlayBox :myPlayer="myPlayer" :myTable="myTable" :review="true" />
                </q-tooltip>
              </span>
            </div>
          </q-card-section>
        </q-card>
      </div>
      <div class="pbar">
        <q-list>
          <q-item-section>
            <div class="row items-end justify-around">
              <q-icon size='sm' name='img:statics/jbicon/seats/seat13.svg' left />
              <q-badge outline color="black" :label="tricks(0)" align="middle" />
              <q-separator vertical />
              <q-icon size='sm' name='img:statics/jbicon/seats/seat24.svg' right />
              <q-badge outline color="black" :label="tricks(1)" align="middle" />
            </div>
          </q-item-section>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script>
import { jbIsPlayer } from 'src/jb'

import myPlayBox from 'src/components/myPlayBox'

export default {
  name: 'myTricks',
  props: ['myPlayer', 'myTable'],
  data () {
    return {
      offset: 0
      // myPlayedCards: []
    }
  },
  components: { myPlayBox },
  computed: {
    // ...mapGetters('jstore', ['myPlayer', 'myTable']),
    isVisible () {
      return this.myTable.state > 1 || this.myTable.state < 0
    },
    playedCards () {
      return this.myTable.plays.data
        .slice(0)
        .filter(c => c.winner > 0)
        .map(c => c.winner)
    }
  },
  methods: {
    tricks (n) {
      try {
        if (this.myTable.plays) {
          return this.myTable.plays.info.tricks[n]
        }
      } catch (err) {
        // console.log(err)
      }
      return null
    },
    isWinner (w) {
      // const w = c.winner
      const sId = Math.abs(this.myPlayer.seat.sId)

      if (jbIsPlayer(sId)) {
        return w % 2 === sId % 2
      } else {
        return w % 2
      }
    },
    cardback (c) {
      let card = ''
      card = this.isWinner(c) ? 'Blue' : 'Red'
      return `statics/cards/${card}_Back.svg`
    },
    trickClass (c, i) {
      const w = this.isWinner(c)
      const t = w ? 'card cardv' : 'card cardh'
      return t
    }
  },
  watch: {},
  mounted () {
    // console.log('t', this.myTable)
  }
}
</script>
<style scoped>
.trickbox {
  max-height: 60px;
}
.pbar {
  min-width: 275px;
  height: 32px;
  margin-top: -50px;
  align-items: flex-start;
  text-overflow: ellipsis;
  background:bisque;
  opacity: 1;
  z-index: 100;
}
img.card {
  max-height: 70px;
  margin: 0;
  border: 0;
  vertical-align: initial;
  box-sizing: initial;
}
img.cardv {
  transform: rotate(180deg);
}
img.cardh {
  transform-origin: botton;
  transform: translateX(10px) rotate(90deg);
}
img.offset1 {
  margin-left: -20px;
}
img.offset2 {
  margin-left: 10px;
}
/*
  * A hand is a div containing cards.
  */
.hand {
  padding: 0;
  margin-bottom: 0;
}

.active-hand img.card {
  cursor: pointer;
}

/*
  * A horizontal hand, class='hand hhand'.  The enitire card is visible.
  */
.hhand {
  display: inline-block;
}
.hhand img.card {
  padding-top: 10px;
}

.hhand.active-hand img.card:hover {
  padding-top: 0px;
  padding-bottom: 10px;
}
/*
  * A compact horizontal hand.  Only the last card is entirely visible.
  */
.hhand-compact {
  display: inline-block;
}
.hhand-compact img.card:first-child {
  margin-left: 0px;
  padding-top: 10px;
}
.hhand-compact img.card {
  margin-right: -40px;
  margin-bottom: 0px;
  padding-top: 10px;
}
.hhand-compact.active-hand img.card:hover {
  padding-top: 0px;
  padding-bottom: 10px;
}
</style>
