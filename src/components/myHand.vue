<template>
  <div class="row items-end">
    <div class="column">
      <div class="row self-end no-wrap">
        <q-card flat v-if="isVisible" class="transparent">
          <div class="hand hhand-compact active-hand full-width">
            <img
              v-for="(c, i) of myCards"
              :key="`${i}`"
              :src="cardImg(c)"
              @click="onPlay(c)"
              class="card"
            />
          </div>
        </q-card>
      </div>
      <div class="pbar">
        <q-btn-group flat dense spread>
          <q-icon :name="seatIcon" class="seat" />
          <q-icon :name="flag" class="flag" />
          <q-btn
            flat
            outline
            dense
            no-caps
            no-wrap
            ellipsis
            :label="pNick"
            :color="pTurn"
            :icon="pAvatar"
            align="left"
            class="player"
          />
          <q-space />
          <q-btn
            dense
            push
            ripple
            color="primary"
            :icon="player ? 'check' : 'event_seat'"
            :label="player ? 'Ready' : 'Sit'"
            v-show="!player || isReady === 0"
            class="ready"
            @click="onReady"
          />
          <q-btn-dropdown
            push
            split
            auto-close
            v-if="isDeclarer"
            :label="myContract"
            color="info"
            class="declarer"
            :disable="showDeclarer"
          >
            <q-list dense>
              <q-item clickable v-close-popup>
                <q-item-section>
                  <q-item-label label v-for="c in claims" :key="c" @click="onClaim(c)">{{c}}</q-item-label>
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
import { jbIsPlayer, jbSeatX, jbSeat1234 } from 'src/jbPlayer'

export default {
  name: 'myHand',
  props: ['handId', 'myPlayer', 'myTable'],
  data () {
    return {
      seatId: 0,
      NESW: ['North', 'East', 'South', 'West'],
      myCards: [],
      claims: ['Concede All', 'Claim Just Make', 'Claim All'],
      isClaim: false
    }
  },
  components: {
    // myCards
  },
  computed: {
    ...mapGetters('jstore', ['getPlayerById']),
    myState: {
      get: function () {
        return this.myTable.state
      }
    },
    mySeat: {
      get: function () {
        return this.myPlayer.seat
      }
    },
    seatX: {
      get: function () {
        return jbSeatX(this.handId, this.mySeat.sId)
      }
    },
    player: {
      get: function () {
        const pId = this.myTable.seats[this.seatX - 1]
        return this.getPlayerById(pId)
      }
    },
    pNick: {
      get: function () {
        return this.player ? this.player.nick : this.NESW[this.seatX - 1]
      }
    },
    pAvatar: {
      get: function () {
        return this.player ? `img:${this.player.profile.avatar}` : null
      }
    },
    isVisible () {
      if (this.myTable.state > 2) return true
      else if (this.myTable.state === 0) return false
      else if (this.isDummy) return true
      else return this.seatX === this.mySeat.sId
    },
    pTurn () {
      if (this.isMyTurn()) return 'warning'
      else return this.myPlayer ? 'indigo' : 'positive'
    },
    flag () {
      if (this.player) {
        try {
          const flag2 = this.player.profile.flag.toLowerCase()
          return `img:statics/flags/4x3/${flag2}.svg`
        } catch (_) {}
      }
      return null
    },
    seatIcon () {
      return `img:statics/jbicon/seats/seat${this.seatX}.svg`
    },
    isReady () {
      return this.myTable.ready[this.seatX - 1]
    },
    showDeclarer () {
      if (this.myTable.state === 2) {
        return this.seatX !== this.mySeat.sId
      } else return true
    },
    isDeclarer () {
      try {
        if (this.myTable.bids) return this.myTable.bids.info.by === this.seatX
      } catch (_) {
        // console.log(err);
      }
      return false
    },
    isDummy () {
      try {
        if (this.myTable.state > 1) {
          if (this.myTable.plays.data.length > 0) {
            return (this.myTable.bids.info.by + 2) % 4 === this.seatX % 4
          }
        }
      } catch (_) {
        // console.log(err);
      }
      return false
    },
    myContract () {
      let c = this.myTable.bids ? this.myTable.bids.info.contract : null
      if (this.myTable.bids.info.XX) c += 'XX'
      else if (this.myTable.bids.info.X) c += 'X'
      return c
    },
    playerBtn () {
      if (!this.player) return 'Ready...'
      else if (this.isDeclarer) return this.contract
      return null
    },
    playedCards () {
      try {
        if (this.myTable.state > 1) {
          return this.myTable.plays.data.map(x => x.card)
        }
      } catch (_) {}
      return []
    },
    myClaim () {
      return this.myTable.claim
    }
  },
  methods: {
    // ...mapActions('jstore', ['addUser']),
    onReady () {
      if (!this.player) {
        const seat = {
          action: 'sit',
          state: this.myTable.state,
          seat: {
            tId: this.myTable.id,
            sId: this.seatX
          }
        }
        this.$emit('onTable', seat)
      } else if (this.player.id === this.myPlayer.id) {
        const _ready = [...this.myTable.ready] || [null, null, null, null]
        _ready[this.seatX - 1] = this.seatX
        const ready = {
          action: 'ready',
          state: this.myTable.state,
          ready: _ready
        }
        this.$emit('onTable', ready)
        this.$q.notify({ type: 'info', message: 'I am Ready' })
      } else {
        this.$q.notify({ type: 'negative', message: 'This seat is taken' })
      }
    },
    onPlay (n) {
      if (this.isMyPlay()) {
        if (this.cardCheck(n)) {
          this.$emit('onTable', {
            action: 'play',
            play: {
              uId: this.myPlayer.id,
              sId: this.seatX,
              winner: 0,
              z: this.myTable.plays.data.length || 0,
              card: n
            }
          })
          // this.updateCards()
        } else {
          this.$q.notify({
            type: 'positive',
            message: 'invalid card...'
          })
        }
      } else {
        this.$q.notify({
          type: 'positive',
          message: 'not your turn'
        })
      }
    },
    onClaim (c) {
      // console.log(this.myTable)
      this.$emit('onTable', {
        action: 'claim',
        claim: {
          // bV: this.myTable.board.bV,
          contract: this.myTable.bids.info,
          tricks: this.myTable.plays.info.tricks,
          claim: c,
          declarer: this.mySeat.sId,
          o1: -jbSeat1234(this.mySeat.sId - 1),
          o2: -jbSeat1234(this.mySeat.sId + 1)
        }
      })
    },
    onClaimR (accept) {
      let claim
      claim = Object.assign({}, claim, this.myClaim)
      if (accept) {
        if (this.myClaim.o1 === -this.mySeat.sId) {
          claim.o1 = -claim.o1
        } else {
          claim.o2 = -claim.o2
        }
      } else {
        claim = null
      }
      this.$emit('onTable', {
        action: 'claim',
        claim
      })
    },
    cardImg (n52) {
      // if (!n52.suit) console.log('error', n52)
      return `statics/cards/${n52.rank + n52.suit}.svg`
    },
    updateTable () {
      this.updatePlay()
    },
    updatePlay () {
      try {
        let playCards = this.myTable.board.cards[this.seatX - 1]
        const _played = this.playedCards.map(x => x.value)
        if (_played.length) {
          playCards = playCards.filter(c => !_played.includes(c.value))
        }

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
          const _suit = this.$data.myCards.filter(
            c => c.suit === lead.card.suit
          )
          // console.log(lead.card.suit, _suit)
          return _suit.length === 0
        }
      }
    },
    isMyPlay () {
      if (this.myTable.state === 2) {
        return this.isDummy
          ? this.myPlayer.seat.sId === this.myTable.bids.info.by
          : this.isMyTurn()
      } else return false
    },
    isMyTurn () {
      if (this.myState > 0) return this.myTable.turn === this.seatX
      else return false
    },
    isMyClaim (claim) {
      const notification = {
        message: 'Declarer is claiming:',
        caption: `Contract ${this.myContract}: ${claim.claim}`,
        color: 'primary',
        icon: 'live_help'
      }
      if (jbIsPlayer(this.mySeat.sId)) {
        if (this.mySeat.sId === -claim.o1 || this.mySeat.sId === -claim.o2) {
          notification.timeout = 5000
          notification.actions = [
            {
              label: 'Accept',
              color: 'yellow',
              handler: () => {
                this.onClaimR(true)
              }
            },
            {
              label: 'Decline',
              color: 'white',
              handler: () => {
                this.onClaimR(true)
              }
            }
          ]
        }
      }
      this.$q.notify(notification)
    }
  },
  watch: {
    mySeat (x) {
      this.updateTable()
    },
    myTable (t, o) {
      this.updateTable()
    },
    myClaim (claim) {
      if (claim && this.myTable.state === 2) this.isMyClaim(claim)
    }
  },
  mounted () {
    this.updateTable()
  },
  created () {}
}
</script>

<style scoped>
.pbar {
  min-width: 275px;
  height: 34px;
  margin-bottom: 0px;
  align-items: flex-start;
  text-overflow: ellipsis;
  background-image: url("/statics/imgs/jbpbar.png");
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 1;
  z-index: 100;
}
/*
body.screen--xs {
  .myCard {
    max-width: 70px;
  }
}
*/
img.card {
  max-width: 75px;
  margin: 0;
  padding: 0;
  border: 0;
  vertical-align: initial;
  box-sizing: initial;
}
.seat {
  width: 24px;
  height: 30px;
  margin-top: 1px;
}
.flag {
  width: 32px;
  height: 24px;
  margin-top: 2px;
}
.avatar {
  width: 24px;
  height: 24px;
  margin-top: 1px;
}
.ready {
  height: 24px;
  width: 50px;
  margin-top: auto;
}
.declarer {
  height: 24px;
  margin: auto;
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
