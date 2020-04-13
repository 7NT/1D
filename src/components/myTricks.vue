<template>
  <div class="column">
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
            :class='winner12(c)'
            :style='`z-index:${i++}`'
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
    cardback (n) {
      return 'statics/cards/Blue_Back.svg'
    },
    winner12 (c) {
      const w = c.winner
      const sId = Math.abs(this.myPlayer.sId)
      const card = 'card'
      let r = ''

      if (jb.isPlayer(sId)) {
        r = (w % 2) === (sId % 2) ? '' : ' rotate-90'
      } else {
        r = w % 2 ? '' : ' rotate-90'
      }
      return card + r
    }

  },
  watch: {}
}
</script>
<style scoped>
img.card {
  max-height: 70px;
  margin: 0;
  padding: 10;
  border: 0;
  vertical-align: initial;
  box-sizing: initial;
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
  margin-left: -40px;
  margin-bottom: -40px;
  padding-top: 10px;
}
.hhand-compact.active-hand img.card:hover {
  padding-top: 0px;
  padding-bottom: 10px;
}
</style>
