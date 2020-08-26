<template>
  <div class='fit' v-if='isMyTurn()'>
    <div class='column justify-end'>
      <div class='col row'>
        <q-btn-group push>
          <q-fab
            square
            glossy
            unelevated
            hide-icon
            v-for='n of 7'
            :key='n'
            v-show='bidN(n)'
            :label='n'
            label-position='left'
            type='button'
            direction='up'
            class='bg-teal'
            padding='sm'
            style='width:32px'
          >
            <q-fab-action
              v-for='s in suits'
              :key='s.id'
              square
              v-show='isBid(n, s.id)'
              icon='null'
              :color='s.color'
              v-close-popup
              @click='onBid(`${n}${s.suit}`)'
            >
              {{ bidNS(n, s.suit) }}
              <q-tooltip>{{n}} {{ getSuitName(s.suit) }}</q-tooltip>
            </q-fab-action>
          </q-fab>
          <q-separator spaced inset vertical />
        </q-btn-group>
      </div>
      <div class='col row' style='height:30px'>
        <q-btn-group dense class='full-width'>
          <q-btn
            glossy
            label='X'
            color='negative'
            :disable='X'
            @click='onBid("X")'
            style='width:20%'
          />
          <q-btn
            glossy
            label='XX'
            color='warning'
            :disable='XX'
            @click='onBid("XX")'
            style='width:25%'
          />
          <q-btn glaosy label='Pass' color='primary' @click='onBid("pass")' style='width:45%' />
        </q-btn-group>
      </div>
      <div class='col row items-center'>
        <q-btn-group dense class='full-width' style='height:30px'>
          <q-btn
            glossy
            :label='`Bid: ${bidding}`'
            :disable='!bidding'
            color='positive'
            @click='onBid2()'
          />
          <q-btn
            glossy
            :label='`Alert: ${bidding}`'
            :disable='!bidding'
            color='negative'
            @click='onAlert2()'
          />
        </q-btn-group>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { jbBidX, jbSuitName } from 'src/jbBid'
import { jbV2W, jbV2S, jbV2N } from 'src/jbVoice'

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
      alert: null
    }
  },
  computed: {
    ...mapState('jstore', ['jsSpeech']),

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
    ...mapActions('jstore', ['setJsMap']),

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
      if (this.bidding) {
        const info = this.myBids.info
        const data = [...this.myBids.data] // this.myBids.data.slice(0)
        const sId = this.myTurn
        data.pop()
        data.push({ sId, bid: this.bidding, alert: this.alert })
        data.push({ sId: (sId % 4) + 1, bid: '?' })

        const bid = { bids: { info, data } }
        if (this.alert) bid.alert = { sId, bid: this.bidding, alert: this.alert }
        else bid.alert = null

        this.$emit('onTable', { action: 'bid', bid })
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
    checkBidding (voice) {
      const word = voice.toLowerCase()
      let w = parseInt(word)
      const bid12 = word.split(' ')
      if (w > 0 && w < 8) {
        bid12[0] = w
        bid12[1] = word.substring(1).trim()
      } else w = jbV2W(bid12[0])

      switch (w) {
        case 'p': return 'pass'
        case 'x':
          if (!this.X) return 'X'
          else return null
        case 'xx':
          if (!this.XX) return 'XX'
          else return null
        case 1:
        case 'one':
        case 2:
        case 'two':
        case 3:
        case 'three':
        case 4:
        case 'four':
        case 5:
        case 'five':
        case 6:
        case 'six':
        case 7:
        case 'seven':
        {
          const n = jbV2N(w)
          const s = jbV2S(bid12[1])
          // console.log(w, n, s)
          switch (s) {
            case 'c':
              if (this.isBid(n, 1)) return n + '♣'
              else return null
            case 'd':
              if (this.isBid(n, 2)) return n + '♦'
              else return null
            case 'h':
              if (this.isBid(n, 3)) return n + '♥'
              else return null
            case 's':
              if (this.isBid(n, 4)) return n + '♠'
              else return null
            case 'no-trump':
              if (this.isBid(n, 5)) return n + 'NT'
              else return null
            default: return null
          }
        }
        default:
          return null
      }
    }
  },
  watch: {
    jsSpeech (s) {
      if (this.isMyTurn()) {
        const bid = this.checkBidding(s)
        if (bid) {
          this.bidding = bid
          this.onBid2()
        }
        this.setJsMap({ key: 'speech', value: null })
      }
    }
  },
  created () {}
}
</script>

<style scoped>
.q-fab >>> .q-btn {
  height: 32px;
}
.q-btn {
  text-transform: none;
}
.q-btn >>> .q-icon {
  float: left;
  align-self: flex-start;
}
</style>
