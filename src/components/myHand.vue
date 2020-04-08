<template>
  <div class='row items-end'>
    <div class='column'>
      <div class='row self-end no-wrap'>
        <q-card
          flat
          v-if='isVisible'
          class='transparent'
        >
          <div class='hand hhand-compact active-hand full-width'>
            <img
              v-for='(c, i) of myCards'
              :key='`${i}`'
              :src='cardImg(c)'
              @click='onPlay(c)'
              class='card'
            />
          </div>
        </q-card>
      </div>
      <div class='myplayer'>
        <q-btn-group flat>
          <q-btn
            push
            no-caps
            ellipsis
            @click='onSit'
            :label='nick'
            :color='ucolor'
            :icon='flag'
            align='between'
            class='playerbar'
          >
            <q-icon
              :name='playerBut'
              :class='uclass'
            />
          </q-btn>
          <q-btn-dropdown
            split
            v-if='isDeclarer'
            :label='contract'
            color='info'
          >
            <q-list dense>
              <q-item
                clickable
                v-close-menu
                @click='onClaim'
              >
                <q-item-section>
                  <q-item-label label>Claim All</q-item-label>
                  <q-item-label label>Concede All</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-btn-group>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import myCards from 'src/components/myCards';
import jb from 'src/jb'

export default {
  name: 'myHand',
  props: ['handId'],
  data () {
    return {
      seatId: 0,
      player: null,
      nick: '[SIT...]',
      myCards: []
    }
  },
  components: {
    // myCards
  },
  computed: {
    ...mapGetters('jstore', ['myPlayer', 'myTable', 'getPlayerById']),
    mySid: {
      get: function () {
        return this.myPlayer.sId
      }
    },
    isVisible () {
      if (this.isDummy) return true
      else return this.seatId === this.mySid
    },
    ucolor () {
      if (this.myTable.turn === this.seatId) return 'warning'
      else return this.myPlayer ? 'secondary' : 'positive'
    },
    uclass () {
      return 'rotate-' + (this.seatId - 1) * 90
    },
    flag () {
      return 'us'
    },
    playerBut () {
      return 'navigation'
    },
    isDeclarer () {
      try {
        return this.myTable.bids.info.by === this.seatId
      } catch (_) {
        // console.log(err);
      }
      return false
    },
    isDummy () {
      try {
        if (this.myTable.plays.data.length > 0) {
          return (this.myTable.bids.info.by + 2) % 4 === this.seatId % 4
        }
      } catch (_) {
        // console.log(err);
      }
      return false
    },
    contract () {
      return this.myTable.bids.info.contract
    },
    playedCards () {
      try {
        return this.myTable.plays.data.map(x => x.card)
      } catch (_) {
        return []
      }
    }
  },
  methods: {
    // ...mapActions('jstore', ['addUser']),
    onSit () {
      if (!this.player) {
        const seat = {
          action: 'sit',
          sit: {
            sId: this.seatId
          }
        }
        this.$emit('onAction', seat)
      } else if (this.player.id === this.myPlayer.id) {
        this.$q.notify({ type: 'info', message: 'Ready' })
      } else {
        this.$q.notify({ type: 'negative', message: 'This seat is taken' })
      }
    },
    onPlay (n) {
      if (this.isMyPlay()) {
        if (this.cardCheck(n)) {
          this.$emit('onAction', {
            action: 'play',
            play: {
              uId: this.myPlayer.id,
              sId: this.seatId,
              z: this.myTable.plays.data.length || 0,
              card: n
            }
          })
          this.updateCards()
        } else {
          this.$q.notify({
            type: 'positive',
            message: 'invalid card...'
          })
        }
      } else {
        console.log('play', 'not your turn')
      }
    },
    cardImg (n52) {
      if (!n52.suit) console.log('error', n52)
      return `../statics/cards/${n52.rank + n52.suit}.svg`
    },
    updatePlayer () {
      this.seatId = jb.seatX(this.handId, this.mySid)
      // console.log('h', this.handId, this.mySid, this.seatId, this.myTable)
      const _uId = this.myTable.seats[this.seatId - 1]
      this.player = this.getPlayerById(_uId)
      this.nick = this.player ? this.player.nick : '[SIT...]'
      this.updateCards()
    },
    updateCards () {
      try {
        let playCards = this.myTable.board.cards[this.seatId - 1]
        const _played = this.playedCards.map(x => x.value)
        if (_played.length) { playCards = playCards.filter(c => !_played.includes(c.value)) }

        this.$data.myCards = playCards
      } catch (err) {
        // console.log(err)
        this.$data.myCards = []
      }
    },
    cardCheck (play) {
      const lead = this.myTable.plays.info.lead
      if (!lead) return true
      else {
        if (lead.card.suit === play.suit) {
          return true
        } else {
          const _suit = this.$data.myCards.filter(c => c.suit === lead.card.suit)
          console.log(lead.card.suit, _suit)
          return _suit.length === 0
        }
      }
    },
    onClaim () {
      console.log('onClaim')
    },
    isMyPlay () {
      return this.myTable.state === 2 ? this.isMyTurn() : false
    },
    isMyTurn () {
      if (this.myTable.turn === this.seatId) {
        if (this.isDummy) return this.myPlayer.sId === this.myTable.bids.info.by
        else return true
      }
      return false
    }
  },
  watch: {
    mySid (x) {
      this.updatePlayer()
    },
    myTable (t, o) {
      this.updatePlayer()
    }
  },
  mounted () {
    console.log('t', this.seatId, this.myTable)
    this.updatePlayer()
  },
  created () {
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
  max-width: 70px;
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
* A vertical hand, class='hand vhand'.  The enitire card is visible.
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
  margin-left: -55px;
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
