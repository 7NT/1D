<template>
  <div class="column q-pa-md">
    <div class="row self-start justify-end no-wrap">
      <q-card
        flat
        v-if="isVisible"
        class="transparent"
      >
        <div class="hand hhand-compact active-hand full-width">
          <img
            v-for="(c, i) of playedCards"
            :key="`${i}`"
            :src="cardback(c)"
            :class="trickClass(c)"
            :style='`z-index:${i}`'
          />
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import jb from 'src/jb'

export default {
  name: 'myTricks',
  data () {
    return {
      offset: 0
      // myPlayedCards: []
    }
  },
  computed: {
    ...mapGetters('jstore', ['myPlayer', 'myTable']),
    isVisible () {
      return this.myTable.state > 1
    },
    playedCards () {
      return this.myTable.plays.data.slice(0).filter(c => c.winner > 0)
    }
  },
  methods: {
    isWinner (c) {
      const w = c.winner
      const sId = Math.abs(this.myPlayer.sId)

      if (jb.isPlayer(sId)) {
        return (w % 2) === (sId % 2)
      } else {
        return w % 2
      }
    },
    cardback (c) {
      let card = ''
      card = this.isWinner(c) ? 'Blue' : 'Red'
      return `statics/cards/${card}_Back.svg`
    },
    trickClass (c) {
      // return this.isWinner(c) ? 'card rotate-180' : 'cardh rotate-90'
      return this.isWinner(c) ? 'card cardv' : 'card cardh'
    },
    trickStyle (c) {
      const r = this.isWinner(c) ? '' : "{ transform: 'rotate(90deg)' }"
      return r
    }
  },
  watch: {}
}
</script>
<style scoped>
img.card {
  max-height: 70px;
  margin: 0;
  border: 0;
  vertical-align: initial;
  box-sizing: initial;
}
img.cardv {
  transform: rotate(180deg)
}
img.cardh {
  transform: rotate(90deg)
}
img.offset {
  margin-left: -50px;
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
