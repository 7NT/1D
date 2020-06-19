<template>
  <div class="row items-end">
    <div class="column">
      <div class="row self-end no-wrap">
        <q-card
          flat
          v-if="isVisible"
          class="transparent"
        >
          <div class="hand hhand-compact active-hand full-width">
            <img
              v-for="(c, i) of handCards"
              :key="i"
              :src="cardImg(c)"
              @click="onPlay(c)"
              class="card"
            />
          </div>
        </q-card>
      </div>
      <div class="pbar">
        <q-btn-group
          flat
          dense
          spread
        >
          <q-icon
            :name="seatIcon"
            class="seat"
          />
          <q-icon
            :name="handFlag"
            class="flag"
          />
          <q-btn
            flat
            outline
            dense
            no-caps
            no-wrap
            ellipsis
            :label="handNick"
            :color="handTurn"
            :icon="handAvatar"
            align="left"
            class="player"
          />
          <q-space />
          <q-btn
            dense
            push
            ripple
            color="primary"
            :icon="handPlayer ? 'check' : 'event_seat'"
            :label="handPlayer ? 'Ready' : 'Sit'"
            v-show="!handPlayer || isReady === 0"
            class="ready"
            @click="onReady"
          />
          <q-btn-dropdown
            push
            split
            auto-close
            v-if="isDeclarer"
            :label="handContract"
            color="info"
            class="declarer"
            :disable="myDeclarer"
          >
            <q-list dense>
              <q-item
                clickable
                v-close-popup
              >
                <q-item-section>
                  <q-item-label
                    label
                    v-for="c in claims"
                    :key="c"
                    @click="onClaim(c)"
                  >{{c}}</q-item-label>
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
import { jbIsPlayer, jbIsMyPlayer, jbAvatar, jbFlag } from 'src/jbPlayer'
import { jbSeatName, jbSeatX, jbSeat1234 } from 'src/jbSeat'

export default {
  name: 'myHand',
  props: ['handId', 'jsPlayer', 'jsTable'],
  data () {
    return {
      claims: ['Concede All', 'Claim Just Make', 'Claim All'],
      isClaim: false
    }
  },
  components: {},
  computed: {
    ...mapGetters('jstore', ['jsPlayerById']),

    handState () {
      return this.jsTable.state
    },
    mySeat () {
      return this.jsPlayer.seat
    },
    seatX () {
      return jbSeatX(this.handId, this.mySeat.sId)
    },
    seatIcon () {
      return `img:statics/jbicon/seats/seat${this.seatX}.svg`
    },
    handPlayer () {
      const pId = this.jsTable.seats[this.seatX - 1]
      if (this.jsTable.id.startsWith('#@')) return this.getPlayerByNick(pId)
      else return this.jsPlayerById(pId)
    },
    handNick () {
      return this.handPlayer ? this.handPlayer.nick : jbSeatName(this.seatX - 1)
    },
    handAvatar () {
      return jbAvatar(this.handPlayer)
    },
    handFlag () {
      return jbFlag(this.handPlayer)
    },
    handTurn () {
      if (this.isHandTurn()) return 'warning'
      else return this.jsPlayer ? 'indigo' : 'positive'
    },
    handCards () {
      return this.jsTable.board.cards[this.seatX - 1].filter(c => !this.playedCards.includes(c.value))
    },
    playedCards () {
      if (this.handState === 2) {
        return this.jsTable.plays.data.map(x => x.card.value)
      } else return []
    },
    isVisible () {
      if (this.handState < 1) return false
      else if (this.handState > 2) return true
      else if (this.mySeat.sId === 9) return true
      else if (this.isDummy) return true
      else return this.seatX === Math.abs(this.mySeat.sId)
    },
    isReady () {
      return this.jsTable.ready[this.seatX - 1]
    },
    isDummy () {
      if (this.handState === 2) {
        if (this.jsTable.plays.data.length > 0) {
          return (this.jsTable.bids.info.by + 2) % 4 === this.seatX % 4
        }
      }
      return false
    },
    isDeclarer () {
      switch (this.handState) {
        case 2:
        case 3:
          return this.jsTable.bids.info.by === this.seatX
        default:
          return false
      }
    },
    myDeclarer () {
      if (this.handState === 2) {
        return this.seatX !== this.mySeat.sId
      } else return true
    },
    handReady () {
      if (!this.handPlayer) return 'Ready...'
      else if (this.isDeclarer) return this.handContract
      return null
    },
    handContract () {
      let c = this.jsTable.bids ? this.jsTable.bids.info.contract : null
      if (this.jsTable.bids.info.XX) c += 'XX'
      else if (this.jsTable.bids.info.X) c += 'X'
      return c
    },
    handClaim () {
      return this.jsTable.claim
    }
  },
  methods: {
    // ...mapActions('jstore', ['addUser']),
    onReady () {
      if (!this.handPlayer) {
        const seat = {
          action: 'sit',
          state: this.handState,
          seat: {
            tId: this.jsTable.id,
            sId: this.seatX
          }
        }
        this.$emit('onTable', seat)
      } else if (jbIsMyPlayer(this.handPlayer, this.jsPlayer)) {
        const ready = [...this.jsTable.ready] || [0, 0, 0, 0]

        if (ready[this.seatX - 1] !== this.seatX) {
          ready[this.seatX - 1] = this.seatX
          const readyData = {
            action: 'ready',
            state: this.handState,
            ready: ready
          }
          this.$emit('onTable', readyData)
        }
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
              uId: this.jsPlayer.id,
              sId: this.seatX,
              winner: 0,
              z: this.jsTable.plays.data.length || 0,
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
      // console.log(this.jsTable)
      this.$emit('onTable', {
        action: 'claim',
        claim: {
          // bV: this.jsTable.board.bV,
          contract: this.jsTable.bids.info,
          tricks: this.jsTable.plays.info.tricks,
          claim: c,
          declarer: this.mySeat.sId,
          o1: -jbSeat1234(this.mySeat.sId - 1),
          o2: -jbSeat1234(this.mySeat.sId + 1)
        }
      })
    },
    onClaimR (accept) {
      let claim
      claim = Object.assign({}, claim, this.handClaim)
      if (accept) {
        if (this.handClaim.o1 === -this.mySeat.sId) {
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
    cardCheck (play) {
      const lead = this.jsTable.plays.info.lead
      if (!lead) return true
      else {
        if (lead.card.suit === play.suit) {
          return true
        } else {
          const _suit = this.playedCards.filter(c => c.suit === lead.card.suit)
          return _suit.length === 0
        }
      }
    },
    isMyPlay () {
      if (this.handState === 2) {
        return this.isDummy
          ? this.jsPlayer.seat.sId === this.jsTable.bids.info.by
          : this.isHandTurn()
      } else return false
    },
    isHandTurn () {
      switch (this.handState) {
        case 1:
        case 2:
          return this.jsTable.turn === this.seatX
        default: return false
      }
    },
    isHandClaim (claim) {
      const notification = {
        message: 'Declarer is claiming:',
        caption: `Contract ${this.handContract}: ${claim.claim}`,
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
                this.onClaimR(false)
              }
            }
          ]
        }
      }
      this.$q.notify(notification)
    }
  },
  watch: {
    handClaim (claim) {
      if (claim && this.handState === 2) this.isHandClaim(claim)
    }
  },
  mounted () { },
  created () { }
}
</script>

<style scoped>
.pbar {
  min-width: 275px;
  height: 34px;
  margin-bottom: 0px;
  align-items: flex-start;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-transform: none;
  background-image: url("/statics/imgs/jbpbar.png");
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 1;
  z-index: 100;
}
/* CARD_WIDTH = 71, CARD_HEIGHT = 96 */
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
