<template>
  <div class="row full-width">
    <div class="column justify-start">
      <div class="row no-wrap">
        <q-card
          flat
          class="transparent"
        >
          <template v-if="myState===2">>
            <q-card-section>
              <div class="hand hhand-compact active-hand full-width no-wrap">
                <span
                  v-for="(c, i) of playedCards"
                  :key="`${i}`"
                  class="card"
                >
                  <img
                    :src="cardback(c)"
                    :class="trickClass(c, i)"
                    :style="`z-index:${i}`"
                  />
                  <q-tooltip
                    content-class="bg-info"
                    anchor="top right"
                    self="bottom left"
                  >
                    <myPlayBox
                      :jsPlayer="jsPlayer"
                      :jsTable="jsTable"
                      :review="true"
                    />
                  </q-tooltip>
                </span>
              </div>
            </q-card-section>
          </template>
          <template v-else>
            <q-card-section v-if='result'>
              <myScoreList
                :tId='result.tId'
                :bId='result.bId'
              />
            </q-card-section>
          </template>
        </q-card>
      </div>
      <div class='row'>
        <q-list
          dense
          class='column scorebar'
        >
          <q-item dense>
            <q-item-section class='col-10'>
              <div class="row">
                <q-icon
                  size='sm'
                  name='img:jbicon/seats/seat13.svg'
                  left
                />
                <q-badge
                  outline
                  color="silver"
                  :label="tricks(0)"
                  align="middle"
                />
                <q-icon
                  size='sm'
                  name='img:jbicon/seats/seat24.svg'
                  right
                />
                <q-badge
                  outline
                  color="silver"
                  :label="tricks(1)"
                  align="middle"
                />
              </div>
            </q-item-section>
            <q-item-section
              side
              avatar
              class='col-2'
            >
              <q-avatar square>
                <q-btn
                  color="silver"
                  icon='menu_book'
                />
              </q-avatar>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script>
import { jbIsPlayer } from 'src/jbPlayer'

import myPlayBox from 'src/components/myPlayBox'
import myScoreList from 'src/components/myScoreList'

export default {
  name: 'myTricks',
  props: ['jsPlayer', 'jsTable'],
  data () {
    return {
      offset: 0,
      result: null
    }
  },
  components: { myPlayBox, myScoreList },
  computed: {
    // ...mapGetters('jstore', ['jsPlayer', 'jsTable']),
    myState () {
      return this.jsTable.state
    },
    playedCards () {
      return this.jsTable.plays.data
        .slice(0)
        .filter(c => c.winner > 0)
        .map(c => c.winner)
    }
  },
  methods: {
    tricks (n) {
      try {
        return this.jsTable.plays.info.tricks[n]
      } catch (err) {
        // console.log(err)
      }
      return null
    },
    isWinner (w) {
      // const w = c.winner
      const sId = Math.abs(this.jsPlayer.seat.sId)

      if (jbIsPlayer(sId)) {
        return w % 2 === sId % 2
      } else {
        return w % 2
      }
    },
    cardback (c) {
      let card = ''
      card = this.isWinner(c) ? 'Blue' : 'Red'
      return `cards/${card}_Back.svg`
    },
    trickClass (c, i) {
      const w = this.isWinner(c)
      const t = w ? 'card cardv' : 'card cardh'
      return t
    }
  },
  watch: {
    myState (s) {
      if (s === 3) { // review
        this.result = {
          tId: this.jsTable.id,
          bId: this.jsTable.board._id
        }
      }
    }
  },
  mounted () { }
}
</script>
<style scoped>
.trickbox {
  max-height: 60px;
}
.scorebar {
  height: 30px;
  background: teal;
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
  margin-bottom: -40px;
  padding-top: 10px;
}
.hhand-compact.active-hand img.card:hover {
  padding-top: 0px;
  padding-bottom: 10px;
}
</style>
