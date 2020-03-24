<template>
  <div class='row items-end'>
    <div class='column'>
      <div class='mycards self-end'>
        <q-card flat v-if='visible'>
          <div class='hand hhand-compact active-hand' style="width:100%">
            <!--
              <myCards :cards='myHand.cards' />
            -->
            <img :src='cardN2S(c)' v-for='(c, i) of myHand.cards' :key='`${i}`' v-show='isPlayed(c)' @click='play(c)' class='card'>
          </div>
        </q-card>
      </div>
      <div class='myplayer'>
        <q-btn-group flat>
            <q-btn
              push
              no-caps
              ellipsis
              @click='sit'
              :label=uname
              :color=ucolor
              :icon='flag'
              align='between'
              class='playerbar'>
              <q-icon :name='playerBut' :class='uclass'>
              </q-icon>
            </q-btn>
            <q-btn-dropdown split v-if='declarer' :label='contract' color='info'>
              <q-list link>
                <q-item>
                  <q-item-main>
                    <q-item-tile label>Claim All</q-item-tile>
                    <q-item-tile label>Concede All</q-item-tile>
                  </q-item-main>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-btn-group>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
// import myCards from 'src/components/myCards'

export default {
  name: 'myHand',
  props: ['myPlayer', 'myHand', 'myPlay', 'turn'],
  data () {
    return {}
  },
  components: {
    // myCards
  },
  computed: {
    ...mapState({
      players: state => state.jstore.players
    }),
    ...mapGetters({}),
    visible: function () {
      if (this.dummy) return true
      else return this.myHand.seatX === this.myPlayer.sId
    },
    /*
    handId: function () {
      return `hand_${this.myHand.seatX}`
    },
    */
    uname () {
      try {
        const user = this.players.find(p => p.id === this.myHand.uId)
        return user.username
      } catch (err) {
        if (this.myHand.uId) return '[Reserved]'
        else return 'SIT...' + this.myHand.seatX
      }
    },
    ucolor: function () {
      if (this.isTurn()) return 'warning'
      else return this.myPlayer ? 'secondary' : 'positive'
    },
    uclass: function () {
      return 'rotate-' + (this.myHand.seatX - 1) * 90
    },
    flag: function () {
      return 'us'
    },
    playerBut: function () {
      return 'navigation'
    },
    declarer: function () {
      try {
        return this.myPlays.bid.declarer === this.myHand.seatX
      } catch (err) {}
      return false
    },
    dummy: function () {
      try {
        if ((this.myPlays.NS + this.myPlays.EW) > 0) {
          return (this.myPlays.declarer + 2) % 4 === this.myHand.seatX % 4
        }
      } catch (err) {}
      return false
    },
    contract: function () {
      return this.myPlays.bid.contract
    }
  },
  methods: {
    sit () {
      const seat = { action: 'sit', uId: this.myHand.uId, sId: this.myHand.seatX }
      this.$emit('onHand', seat)
    },
    play (n) {
      if (this.isTurn()) {
        const card = this.getN(n) + this.getSuit(n)
        this.$emit('onHand', { action: 'play', play: { sId: this.myHand.sId, seatX: this.myHand.seatX, card } })
      } else {
        console.log('play', 'not your turn')
      }
    },
    cardN2S (n) {
      const c = this.getN(n) + this.getSuit(n)
      return `../statics/cards/${c}.svg`
    },
    getN (n) {
      const n0 = n % 13
      switch (n0) {
        case 0: return '2'
        case 1: return 'A'
        case 2: return 'K'
        case 3: return 'Q'
        case 4: return 'J'
        default: return 15 - n0
      }
    },
    getSuit (n) {
      n--
      const n0 = Math.floor(n / 13)
      switch (n0) {
        case 3: return 'C'
        case 2: return 'D'
        case 1: return 'H'
        case 0: return 'S'
        default: return ''
      }
    },
    isPlayed (c) {
      try {
        const _plays = this.myPlay.plays || []
        return !_plays.includes(c)
      } catch (err) { }
      return true
    },
    isTurn () {
      console.log('turn', this.turn, this.myHand.seatX)
      return this.turn === this.myHand.seatX
    }
  },
  watch: {
    myPlays: function () {
      // console.log('myPlays', this.myPlays)
    },
    turn: function (t1, t0) {
      // console.log(t1, t0, this.myHand, this.turn === this.myHand.sId)
    }
  },
  created () {
    // console.log(this.myHand)
  }
}
</script>

<style scoped>
  .playerbar {
    min-width: 175px;
    height: 32px;
    text-overflow: ellipsis;
  }
  img.card {
    max-width: 52px;
    margin: 0;
    padding: 0;
    border: 0;
    vertical-align: initial;
    box-sizing: initial;
  }

  /*
  * A hand is a div containing cards.
  */
  .hand {
    padding: 0;
    margin-bottom: auto;
  }

  .active-hand img.card {
    cursor: pointer;
  }

  /*
  * A horizontal hand, class="hand hhand".  The enitire card is visible.
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
  * A vertical hand, class="hand vhand".  The enitire card is visible.
  */
  .vhand {
    display: block;
  }
  .vhand img.card {
    padding-right: 10px;
  }
  .vhand.active-hand img.card:hover {
    padding-right: 0px;
    padding-left: 10px;
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

  /*
  * A compact vertical hand.  Only the last card is entirely visible.
  */
  .vhand-compact {
    display: inline-block;
    vertical-align: top;
  }
  .vhand-compact img.card:first-child {
    display: block;
    margin-top: 0px;
    padding-right: 10px;
  }
  .vhand-compact img.card {
    display: block;
    margin-top: -80px;
    padding-right: 10px;
  }
  .vhand-compact.active-hand img.card:hover,
  .active-hand .vhand-compact img.card:hover {
    display: block;
    padding-right: 0px;
    padding-left: 10px;
  }

  /*
  * A fanned hand.  Only the last card is entirely visible.
  */
  .fan {
    display: inline-block;
    vertical-align: top;
    position: relative;
    padding-bottom: 1em;
  }
  .fan img.card {
    position: absolute;
    width: 90px;
  }
</style>
