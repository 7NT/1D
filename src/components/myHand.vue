<template>
  <div class='row items-end'>
    <div class='column'>
      <div class='row self-end no-wrap'>
        <q-card flat v-if='isVisible' class='transparent'>
          <div class='hand hhand-compact active-hand full-width no-wrap'>
            <img
              v-for='(c, i) of handCards'
              :key='i'
              :src='cardImg(c)'
              @click='onPlay(c)'
              class='card'
            />
          </div>
        </q-card>
      </div>
      <div class='pbar'>
        <q-btn-group flat dense spread>
          <q-icon :name='seatIcon' class='seat' />
          <q-icon :name='handFlag' class='flag' />
          <q-btn
            flat
            outline
            dense
            no-caps
            no-wrap
            ellipsis
            :label='handNick'
            :icon='handAvatar'
            :color='handTurn'
            align='left'
            class='player'
            :disable='!handPlayer'
            @click='onPlayer()'
          >
            <q-badge color='orange' align='top' transparent v-if='handMessage'>∞</q-badge>
          </q-btn>
          <q-space />
          <q-btn
            dense
            push
            ripple
            color='primary'
            :icon='handPlayer ? "check" : "event_seat"'
            :label='handPlayer ? "Ready" : "Sit"'
            v-show='!handPlayer || isReady === 0'
            class='ready'
            @click='onReady'
          />
          <q-btn-dropdown
            push
            split
            auto-close
            v-if='isDeclarer'
            :label='handContract'
            color='info'
            class='declarer'
            :disable='myDeclarer'
          >
            <q-list dense>
              <q-item clickable v-close-popup>
                <q-item-section>
                  <q-item-label label v-for='c in claims' :key='c' @click='onClaim(c)'>{{ c }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </q-btn-group>
      </div>
    </div>
    <q-dialog auto-close v-model='pchat'>
      <q-card class='q-dialog-plugin' v-if='!!handPlayer'>
        <q-card-section>
          <myMessages :chatTo='handPlayer' />
        </q-card-section>

        <q-card-actions align='right'>
          <myChat :chatTo='handPlayer' />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import myMessages from 'src/components/myMessages'
import myChat from 'src/components/myChat'
import { jbCards, jbCardImg } from 'src/jbBoard'
import { jbIsPlayer, jbIsMyPlayer, jbFlag, jbSeatIcon } from 'src/jbPlayer'
import { jbSeatName, jbSeatX, jbSeat1234 } from 'src/jbSeat'
import { jbV2N } from 'src/jbVoice'

export default {
  name: 'myHand',
  props: ['handId', 'jsPlayer', 'jsTable'],
  data () {
    return {
      claims: ['Concede All', 'Claim Just Make', 'Claim All'],
      isClaim: false,
      pchat: false
    }
  },
  components: { myMessages, myChat },
  computed: {
    ...mapState('jstore', ['jsPM']),
    ...mapGetters('jstore', ['jsPlayerByNick']),

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
      // return `img:jbIcon/seats/seat${this.seatX}.svg`
      return jbSeatIcon(this.seatX)
    },
    handPlayer () {
      const nick = this.jsTable.seats[this.seatX - 1]
      return this.jsPlayerByNick(nick)
    },
    handNick () {
      return this.handPlayer
        ? this.handPlayer.nick
        : jbSeatName(this.seatX - 1)
    },
    handAvatar () {
      if (this.handPlayer) return `img:${this.handPlayer.avatar}`
      else return null
    },
    handFlag () {
      return jbFlag(this.handPlayer)
    },
    handMessage () {
      if (this.handPlayer) return this.jsPM.indexOf(this.handPlayer.nick) >= 0
      else return false
    },
    handTurn () {
      if (this.isHandTurn) return 'amber'
      else return this.jsPlayer ? 'indigo' : 'positive'
    },
    isHandTurn () {
      switch (this.handState) {
        case 1:
        case 2:
          return this.jsTable.turn === this.seatX
        default:
          return false
      }
    },
    isMyTurn () {
      if (this.handState === 2 && this.isHandTurn) {
        if (this.isDummy) {
          return this.jsPlayer.seat.sId === this.jsTable.bids.info.by
        } else return this.jsPlayer.seat.sId === this.seatX
      } else return false
    },
    isMyPlay () {
      if (this.handState === 2) {
        if (!this.isHandTurn) return false
        return this.isDummy
          ? this.jsPlayer.seat.sId === this.jsTable.bids.info.by
          : true
      } else return false
    },
    handCards () {
      if (this.jsTable.board.data) {
        let t = 'S' // sort SHCD
        if (this.handState === 2) t = this.jsTable.plays.info.trump
        const cards = jbCards(this.jsTable.board.data, this.seatX, t)
        return cards.filter((c) => !this.playedCards.includes(c.value))
      } else return []
    },
    playedCards () {
      if (this.handState === 2) {
        return this.jsTable.plays.data.map((x) => x.card.value)
      } else return []
    },
    isVisible () {
      if (this.handState < 1) return false
      else if (this.handState > 2) return true
      else if (this.mySeat.sId === 9) return true
      else if (this.isDummy || !!this.handClaim) return true
      else if (this.isDeclarer) {
        return this.jsTable.bids.info.by % 2 === this.mySeat.sId % 2
      } else return this.seatX === Math.abs(this.mySeat.sId)
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
    ...mapActions('jstore', ['setJsMap']),

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
    onPlayer () {
      if (this.handPlayer && jbIsPlayer(this.mySeat.sId)) {
        this.pchat = this.mySeat.sId % 2 !== this.seatX % 2
        this.setJsMap({ key: '-pm', value: this.handPlayer.nick })
      }
    },
    onPlay (card) {
      if (this.isMyPlay) {
        if (this.cardCheck(card)) {
          this.$emit('onTable', {
            action: 'play',
            play: {
              uId: this.jsPlayer.nick,
              sId: this.seatX,
              winner: 0,
              z: this.jsTable.plays.data.length || 0,
              card
            }
          })
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
    cardImg (c52) {
      // return `cards/${n52.rank + n52.suit}.svg`
      return jbCardImg(c52)
    },
    cardCheck (play) {
      const lead = this.jsTable.plays.info.lead
      if (!lead) return true
      else {
        if (lead.card.suit === play.suit) {
          return true
        } else {
          const suit = this.handCards.filter((c) => c.suit === lead.card.suit)
          return suit.length === 0
        }
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
              color: 'amber',
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
    },
    checkPlaying (play) {
      const play12 = play.toLowerCase().split(' of ')
      switch (play12[0]) {
        case '2':
        case 'two':
        case '3':
        case 'three':
        case '4':
        case 'four':
        case '5':
        case 'five':
        case '6':
        case 'six':
        case '7':
        case 'even':
        case '8':
        case 'eight':
        case '9':
        case 'nine':
        case '10':
        case 'ten':
        case 'j':
        case 'jack':
        case 'q':
        case 'qureen':
        case 'k':
        case 'king':
        case 'a':
        case 'ace': {
          const n = jbV2N(play12[0])
          switch (play12[1]) {
            case 'c':
            case 'club':
            case 'clubs':
              if (this.isPlay('C', n)) return 'C' + n
              else return null
            case 'd':
            case 'diamond':
            case 'diamonds':
              if (this.isPlay('D', n)) return 'D' + n
              else return null
            case 'h':
            case 'heart':
            case 'hearts':
              if (this.isPlay('H', n)) return 'H' + n
              else return null
            case 's':
            case 'spade':
            case 'spades':
              if (this.isPlay('S', n)) return 'S' + n
              else return null
            default:
              return null
          }
        }
        default:
          return null
      }
    }
  },
  watch: {
    handTurn (t) {
      if (this.mySeat.sId === this.jsTable.turn) {
        if (t && this.handCards.length === 1) {
          const card = this.handCards[0]
          this.onPlay(card)
        }
      }
    },
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
  min-width: 280px;
  height: 34px;
  margin-bottom: 0px;
  align-items: flex-start;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-transform: none;
  background-image: url('~assets/imgs/jbpbar.png');
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 1;
  z-index: 100;
}
/* CARD_WIDTH = 71, CARD_HEIGHT = 96 */
img.card {
  max-width: 72px;
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
