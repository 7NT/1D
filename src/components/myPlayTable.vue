<template>
  <div class='q-ma-none'>
    <div class='column jbtable'>
      <div class='col'>
        <div class='row no-wrap'>
          <div class='col-3 items-start'>
            <myBoard
              :myTable='myTable'
              :mySeat='mySeat'
              v-on:onTable='onTable'
            ></myBoard>
          </div>
          <div class='col-6 box'>
            <div class='column'>
              <myHand
                :handId='1'
                :myPlayer='myPlayer'
                :myTable='myTable'
                v-on:onTable='onTable'
                class='myHand justify-start'
                offset='[10, 10]'
              />
            </div>
          </div>
          <div class='col-3 self-start'>
            <div
              class='row justify-end'
              v-if='myState > 1'
            >
              <myBidBox
                :myPlayer='myPlayer'
                :myTable='myTable'
              />
            </div>
          </div>
        </div>
      </div>
      <div class='col'>
        <div class='row no-wrap'>
          <div class='col-4 box'>
            <div class='column'>
              <myHand
                :handId='4'
                :myPlayer='myPlayer'
                :myTable='myTable'
                v-on:onTable='onTable'
                class='myHand justify-end'
              />
            </div>
          </div>
          <div class='col-4'>
            <div class='column'>
              <div>
                <q-card
                  class='bbox pbox'
                  v-if='myState === 1'
                >
                  <q-card>
                    <myBidBox
                      :myPlayer='myPlayer'
                      :myTable='myTable'
                    />
                  </q-card>
                </q-card>
                <q-card
                  class='pbox transparent'
                  v-if='myState === 2'
                >
                  <myPlayBox
                    :myPlayer='myPlayer'
                    :myTable='myTable'
                    :review='false'
                  />
                </q-card>
                <q-space />
              </div>
            </div>
          </div>
          <div class='col-4 box'>
            <div class='column'>
              <myHand
                :handId='2'
                :myPlayer='myPlayer'
                :myTable='myTable'
                v-on:onTable='onTable'
                class='myHand justify-start'
              />
            </div>
          </div>
        </div>
      </div>
      <div class='col'>
        <div class='row no-wrap'>
          <div class='col-3'>
            <div class='column'>
              <myTricks
                :myPlayer='myPlayer'
                :myTable='myTable'
              />
            </div>
          </div>
          <div class='col-6 box'>
            <div class='column'>
              <myHand
                :handId='3'
                :myPlayer='myPlayer'
                :myTable='myTable'
                v-on:onTable='onTable'
                class='myHand justify-end'
              />
            </div>
          </div>
          <div class='col-3 bidbox'>
            <div class='column bg-blue-grey-6'>
              <myBid v-if='isMyTurn() === 1'
                :myPlayer='myPlayer'
                :myTable='myTable'
                class='justify-center'>
            </div>
              <div
                class='row items-center'
                style='height:40px'
              >
                <!--
                <q-input
                  dense
                  standout='bg-primary text-negative'
                  autofocus
                  clearable
                  color='warning'
                  v-model='alert'
                  label='Alert'
                  class='full-width'
                >
                  <template v-slot:prepend>
                    <q-icon name='add_alert' />
                  </template>
                </q-input>
              -->
                <q-space></q-space>
              </div>
              <div
                class='row'
                style='height:30px'
              >
                <q-btn-group
                  dense
                  class='full-width'
                >
                  <q-btn
                    glossy
                    label='X'
                    color='negative'
                    :disable='X'
                    @click="onBid('X')"
                    style='width:20%'
                  />
                  <q-btn
                    glossy
                    label='XX'
                    color='warning'
                    :disable='XX'
                    @click="onBid('XX')"
                    style='width:25%'
                  />
                  <q-btn
                    glaosy
                    label='Pass'
                    color='primary'
                    @click="onBid('Pass')"
                    style='width:45%'
                  />
                </q-btn-group>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
// import say from 'say'
import { tableService } from 'src/api'
import jb from 'src/jb'
import myBoard from 'src/components/myBoard'
import myHand from 'src/components/myHand'
import myBidBox from 'src/components/myBidBox'
import myPlayBox from 'src/components/myPlayBox'
import myTricks from 'src/components/myTricks'

export default {
  name: 'myPlayTable',
  props: ['myPlayer'],
  data: function () {
    return {
      tableData: null,
      state: 0,
      suits: [
        { id: 1, suit: '♣', color: 'green' },
        { id: 2, suit: '♦', color: 'orange' },
        { id: 3, suit: '♥', color: 'red' },
        { id: 4, suit: '♠', color: 'black' },
        { id: 5, suit: 'NT', color: 'purple' }
      ],
      cc: { name: { NS: 'SAYC', EW: 'SAYC' }, card: { NS: '', EW: '' } },
      alert: null
    }
  },
  components: {
    myBoard,
    myHand,
    myBidBox,
    myPlayBox,
    myTricks
  },
  computed: {
    ...mapState('jstore', ['players', 'tables']),
    ...mapGetters('jstore', ['getTableById']),

    myTable () {
      return this.getTableById(this.myPlayer.seat.tId)
    },
    mySeat: {
      get: function () {
        return this.myPlayer.seat
      }
    },
    myState: {
      get: function () {
        return this.$data.state
      },
      set: function (s) {
        this.$data.state = s
      }
    },
    myTurn: {
      get: function () {
        return this.myTable ? this.myTable.turn : 0
      }
    },
    myBids: {
      get: function () {
        return this.myTable.bids
      }
    },
    myPlays: {
      get: function () {
        return this.myTable.plays
      }
    },
    X: function () {
      return jb.bidX(this.myBids.info.by, this.myTurn)
    },
    XX: function () {
      return jb.bidX(this.myBids.info.X, this.myTurn)
    }
  },
  methods: {
    isMyTurn () {
      const b = this.myTurn === this.myPlayer.seat.sId ? this.myState : 0
      return b
    },
    onState (s) {
      console.log('t', s, this.myTable)
      /*
      switch (s) {
        case 0:
          this.$data.boardInfo.bt = this.myTable.bt
          break
        case 1:
          this.$data.boardInfo.bn = this.myTable.board.bn
          break
        case 2:
          this.$data.boardInfo.play = this.myTable.play.info
          break
        default:
        // return
      }
      */
    },
    onBid (bid) {
      const info = this.myBids.info
      const data = this.myBids.data.slice(0)
      let sId = this.myTurn
      data.pop()
      data.push({ sId, bid })
      sId = (sId % 4) + 1
      data.push({ sId, bid: '?' })
      this.onTable({ action: 'bid', bid: { bids: { info, data } } })
      // const tts = jb.jbVoiceName(bid)
      // say.speak(tts)
    },
    onTable (action) {
      console.log('onTable', action)
      switch (action.action) {
        case 'sit': {
          this.$emit('onPlayer', action.seat)
          break
        }
        case 'ready': {
          tableService.patch(this.myTable.id, { state: action.state, ready: action.ready })
          break
        }
        case 'bt': {
          tableService.patch(this.myTable.id, { bt: action.bt })
          break
        }
        case 'cc': {
          tableService.patch(this.myTable.id, { cc: action.cc })
          break
        }
        case 'bid': {
          const bids = { bids: action.bid.bids }
          tableService.patch(this.myTable.id, bids)
          break
        }
        case 'play': {
          const _info = this.myPlays.info
          const _data = this.myPlays.data.slice(0)
          const _played = _data.map(x => x.card) || []
          if (!_played.includes(action.play.card)) {
            _data.push(action.play)
            const plays = { plays: { info: _info, data: _data } }
            tableService.patch(this.myTable.id, plays)
          }
          break
        }
        case 'claim': {
          tableService.patch(this.myTable.id, { claim: action.claim })
          break
        }
        default: { }
      }
    },
    bidN (n) {
      try {
        if (n === this.myBids.info.bidN) return this.myBids.info.bidS < 5
        else return n > this.myBids.info.bidN
      } catch (_) {
        // console.log(err)
      }
      return true
    },
    isBid (n, s) {
      try {
        // console.log(n, s, this.myBids)
        const n1 = n * 10 + s
        const n0 = this.myBids.info.bidN * 10 + this.myBids.info.bidS
        return n1 > n0
      } catch (_) {
        // console.log(err)
      }
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
    }
  },
  watch: {
    myPlayer (n, o) {
      console.log('p', n, o)
    },
    myTable: function (t1, t0) {
      console.log('t', t1, t0)
      this.myState = t1.state
    },
    myState: function (s1, s0) {
      // s0++
      for (let s = s0; s <= s1; s++) {
        this.onState(s)
      }
    },
    myTurn: function (t1, t0) { }
  },
  mounted () {
    // this.$parent.page = 'Lobby'
    // this.myState = this.myTable.state || 0
    console.log('t', this.myTable)
  },
  beforeDestroy () { }
}
</script>
<!-- Notice lang='scss' -->
<style scoped>
.q-fab >>> .q-btn {
  height: 28px;
}
.q-btn >>> .q-icon {
  float: left;
  align-self: flex-start;
}
.bidbox {
  margin: 10px;
  align-items: flex-end;
  z-index: 200;
}
.bidrow {
  flex-wrap: no-wrap;
}
.bidfab {
  width: 28px;
  height: 28px;
  padding: 0px;
  margin: 0px;
}
.jbtable {
  min-width: 694px;
  min-height: 393px;
  max-height: 480px;
  /*border: 1px solid green;*/
  margin: 2px;
  width: 100%;
  height: 100%;
  background-image: url("/statics/imgs/jbbg.jpeg");
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Do not repeat the image */
  background-size: cover; /* Resize the background image to cover the entire container */
}
.box {
  /* border: 1px solid blue; */
  margin: 5px;
}
.bbox {
  min-height: 120px;
  min-width: 120px;
}
.pbox {
  max-height: 200px;
  max-width: 240px;
  margin: auto;
  overflow-y: auto;
}
.myHand {
  min-height: 100px;
  max-height: 130px;
  min-width: 175px;
  margin-right: 16px;
}
</style>
