<template>
  <div
    class="fit column no-margin no-padding"
    v-if="isMyTurn()"
  >
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
            @click="onBid(`${n}${s.suit}`)"
          >{{ bidNS(n, s.suit) }}
            <q-tooltip>{{n}} {{ getSuitName(s.suit) }}</q-tooltip>
          </q-fab-action>
        </q-fab>
        <q-separator spaced inset vertical />
      </q-btn-group>
    </div>
    <q-separator
      spaced
      inset
    />
    <div
      class="col row"
      style="height:30px"
    >
      <q-btn-group
        dense
        class="full-width"
      >
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
        <q-btn
          glaosy
          label="Pass"
          color="primary"
          @click="onBid('pass')"
          style="width:45%"
        />
      </q-btn-group>
    </div>
    <q-separator
      spaced
      inset
    />
    <div class="col row items-center">
      <q-btn-group
        dense
        class="full-width"
        style="height:30px"
      >
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
      </q-btn-group>
    </div>
  </div>
</template>

<script>
import { jbBidX, jbSuitName } from 'src/jbBid'

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
      bidding: '',
      alert: null
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
    isMyTurn () {
      if (this.jsTable.state === 1) return this.myTurn === this.jsPlayer.seat.sId
      else return false
    },
    bidN (n) {
      try {
        if (n === this.myBids.info.bidN) return this.myBids.info.bidS < 5
        else return n > this.myBids.info.bidN
      } catch (_) { }
      return true
    },
    isBid (n, s) {
      try {
        const n1 = n * 10 + s
        const n0 = this.myBids.info.bidN * 10 + this.myBids.info.bidS
        return n1 > n0
      } catch (_) { }
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
        // const tts = jb.jbVoiceName(bid)
        // say.speak(tts)
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
    getSuitName (s) {
      return jbSuitName(s)
    }
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
