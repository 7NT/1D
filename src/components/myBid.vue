<template>
  <div class="fit column no-margin no-padding" v-if="isMyTurn()">
    <div class="col row">
      <q-btn-group push>
        <q-fab
          square
          glossy
          unelevated
          hide-icon
          v-for="n of 7"
          :key="n"
          v-show="bidN(n)"
          :label="n"
          label-position="left"
          type="button"
          direction="up"
          class="bg-teal"
          padding="sm"
          style="width:30px"
        >
          <q-fab-action
            v-for="s in suits"
            :key="s.id"
            square
            v-show="isBid(n, s.id)"
            icon="null"
            :color="s.color"
            v-close-popup
            @click="onBid(`${n}${s.suit}`)"
          >
            {{ bidNS(n, s.suit) }}
            <q-tooltip>{{n}} {{ getSuitName(s.suit) }}</q-tooltip>
          </q-fab-action>
        </q-fab>
        <q-separator spaced inset vertical />
      </q-btn-group>
    </div>
    <q-separator spaced inset />
    <div class="col row" style="height:30px">
      <q-btn-group dense class="full-width">
        <q-btn
          glossy
          label="X"
          color="negative"
          :disable="X"
          @click="onBid('X')"
          style="width:20%"
        />
        <q-btn
          glossy
          label="XX"
          color="warning"
          :disable="XX"
          @click="onBid('XX')"
          style="width:25%"
        />
        <q-btn glaosy label="Pass" color="primary" @click="onBid('pass')" style="width:45%" />
      </q-btn-group>
    </div>
    <q-separator spaced inset />
    <div class="col row items-center">
      <q-btn-group dense class="full-width" style="height:30px">
        <q-btn
          glossy
          :label="`Bid: ${bidding}`"
          :disable="!bidding"
          color="positive"
          @click="onBid2()"
        />
        <q-btn
          glossy
          :label="`Alert: ${bidding}`"
          :disable="!bidding"
          color="negative"
          @click="onAlert2()"
        />
        <q-btn glossy color="red" :icon="isSpeaking ? 'mic' : 'mic_off'" @click="onMic" />
      </q-btn-group>
    </div>
  </div>
</template>

<script>
import SpeechToText from '../services/speech-to-text'

import { jbBidX, jbSuitName } from 'src/jbBid'
import { jbV2N } from 'src/jbVoice'

export default {
  name: 'myBid',
  props: ['jsPlayer', 'jsTable'],
  data () {
    return {
      suits: [
        { id: 1, suit: '♣', color: 'green' },
        { id: 2, suit: '♦', color: 'orange' },
        { id: 3, suit: '♥', color: 'red' },
        { id: 4, suit: '♠', color: 'black' },
        { id: 5, suit: 'NT', color: 'purple' }
      ],
      biddings: [
        'pass',
        'double',
        'redouble',
        're double',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        'club',
        'diamond',
        'heart',
        'spade',
        'no trump'
      ],
      bidding: '',
      alert: null,
      isSpeaking: false,
      speech: '',
      speechService: {}
    }
  },
  computed: {
    myBids () {
      return this.jsTable.bids
    },
    myTurn () {
      return this.jsTable.turn
    },
    X () {
      return jbBidX(this.myBids.info.by, this.myTurn)
    },
    XX () {
      return jbBidX(this.myBids.info.X, this.myTurn)
    }
  },
  methods: {
    getSuitName (s) {
      return jbSuitName(s)
    },
    isMyTurn () {
      if (this.jsTable.state === 1) {
        return this.myTurn === this.jsPlayer.seat.sId
      } else return false
    },
    bidN (n) {
      try {
        if (n === this.myBids.info.bidN) return this.myBids.info.bidS < 5
        else return n > this.myBids.info.bidN
      } catch (_) {}
      return true
    },
    isBid (n, s) {
      try {
        const n1 = n * 10 + s
        const n0 = this.myBids.info.bidN * 10 + this.myBids.info.bidS
        return n1 > n0
      } catch (_) {}
      return true
    },
    bidNS (n, s) {
      switch (s) {
        case 'C':
          return n + '♣'
        case 'D':
          return n + '♦'
        case 'H':
          return n + '♥'
        case 'S':
          return n + '♠'
        default:
          return n + s
      }
    },
    onBid (bid) {
      this.bidding = bid
    },
    onBid2 () {
      const bid = this.bidding
      if (bid) {
        const info = this.myBids.info
        const data = [...this.myBids.data] // this.myBids.data.slice(0)
        let sId = this.myTurn
        const alert = this.alert
        data.pop()
        data.push({ sId, bid, alert })
        sId = (sId % 4) + 1
        data.push({ sId, bid: '?' })
        this.$emit('onTable', {
          action: 'bid',
          bid: { bids: { info, data } }
        })
        this.bidding = ''
        this.alert = null
      }
    },
    onAlert2 () {
      this.$q
        .dialog({
          title: `Alert ${this.bidding}:`,
          message: 'Alert message?',
          prompt: {
            model: '',
            type: 'text' // optional
          },
          cancel: true,
          persistent: true
        })
        .onOk(data => {
          this.alert = data
          this.onBid2()
        })
        .onCancel(() => {
          this.alert = null
        })
        .onDismiss(() => {
          this.alert = null
          this.onBid2()
        })
    },
    onMic () {
      this.isSpeaking = true
      this.speechService.speak().subscribe(
        result => {
          this.speech = result
          // this.$emit('speech', this.speech)
          this.isSpeaking = false
          if (result) {
            this.$q.notify({ type: 'info', caption: 'Bid:', message: result })
            const bid = this.checkBidding(result)
            if (bid) {
              this.bidding = bid
              this.onBid2()
            }
          }
        },
        error => {
          console.log('Error', error)
          this.isSpeaking = false
        },
        () => {
          this.isSpeaking = false
        }
      )
      console.log('speechService started')
    },
    checkBidding (bid) {
      const bid12 = bid.toLowerCase().split(' ')
      switch (bid12[0]) {
        case 'p':
        case 'pass':
          return 'pass'
        case 'x':
        case 'double':
          if (this.X) return 'X'
          else return null
        case 're-double':
          if (this.XX) return 'XX'
          else return null
        case '1':
        case 'one':
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
        {
          const n = jbV2N(bid12[0])
          switch (bid12[1]) {
            case 'c':
            case 'club':
            case 'clubs':
              if (this.isBid(n, 1)) return bid12[0] + '♣'
              else return null
            case 'd':
            case 'diamond':
            case 'diamonds':
              if (this.isBid(n, 2)) return bid12[0] + '♦'
              else return null
            case 'h':
            case 'heart':
            case 'hearts':
              if (this.isBid(n, 3)) return bid12[0] + '♥'
              else return null
            case 's':
            case 'spade':
            case 'spades':
              if (this.isBid(n, 4)) return bid12[0] + '♠'
              else return null
            case 'no-trump':
              if (this.isBid(n, 5)) return bid12[0] + 'NT'
              else return null
            default: return null
          }
        }
        default:
          return null
      }
    }
  },
  created () {
    this.speechService = new SpeechToText()
  }
}
</script>

<style scoped>
.q-fab >>> .q-btn {
  height: 28px;
}
.q-btn {
  text-transform: none;
}
.q-btn >>> .q-icon {
  float: left;
  align-self: flex-start;
}
.bbox {
  height: 120px;
  min-width: 210px;
  margin: auto;
  border: 1px solid tomato;
  align-self: flex-start;
  z-index: 200;
}
</style>
