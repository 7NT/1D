<template>
  <div
    class='q-ma-none'
    v-if='myTable'
  >
    <div class='jbtable column bg-teal'>
      <div class='col'>
        <div class='row no-wrap'>
          <div class='col-3 items-start'>
            <myBoard v-on:onBT='onBT'></myBoard>
          </div>
          <div class='col-6 box'>
            <div class='column'>
              <myHand
                :handId='1'
                v-on:onAction='onAction'
                class='myHand justify-start'
              />
            </div>
          </div>
          <div class='col-3 self-start'>
            <div
              class='row justify-end'
              v-if='myState > 1'
            >
              <myBidBox />
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
                v-on:onAction='onAction'
                class='myHand justify-end'
              />
            </div>
          </div>
          <div class='col-4'>
            <div class='column'>
              <q-card
                class='bbox cbox'
                v-if='myState === 1'
              >
                <q-card>
                  <myBidBox />
                </q-card>
              </q-card>
              <q-card
                class='cbox transparent'
                v-if='myState === 2'
              >
                <myPlayBox />
              </q-card>
            </div>
          </div>
          <div class='col-4 box'>
            <div class='column'>
              <myHand
                :handId='2'
                v-on:onAction='onAction'
                class='myHand justify-start'
              />
            </div>
          </div>
        </div>
      </div>
      <div class='col'>
        <div class='row no-wrap'>
          <div class='col-3'>
            <div
              class='column'
              v-if='myState > 1'
            >
              <myTricks />
            </div>
          </div>
          <div class='col-6 box'>
            <div class='column'>
              <myHand
                :handId='3'
                v-on:onAction='onAction'
                class='myHand justify-end'
              />
            </div>
          </div>
          <div class='col-3 bidbox'>
            <div
              class='column'
              v-if='isMyTurn() === 1'
            >
              <div
                class='row bidrow'
                style='height:30px'
              >
                <q-btn-group push>
                  <q-fab
                    v-for='n of 7'
                    :key='n'
                    square
                    persistent
                    v-show='bidN(n)'
                    type="button"
                    direction='up'
                    :label='n'
                    label-position='left'
                    icon=null
                    active-icon=null
                    class="bidfab"
                  >
                    <q-fab-action
                      v-for='s in suits'
                      :key='s.id'
                      square
                      v-show='isBid(n, s.id)'
                      icon=null
                      :color='s.color'
                      @click='onBid(`${n}${s.suit}`)'
                    >
                      {{ bidNS(n, s.suit) }}
                    </q-fab-action>
                  </q-fab>
                </q-btn-group>
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
                    @click="onBid('P')"
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
import { tableService } from 'src/api'
import jb from 'src/jb'
import myBoard from 'src/components/myBoard'
import myHand from 'src/components/myHand'
import myBidBox from 'src/components/myBidBox'
import myPlayBox from 'src/components/myPlayBox'
import myTricks from 'src/components/myTricks'

export default {
  name: 'myPlaysTable',
  data: function () {
    return {
      tableData: null,
      state: 0,
      suits: [
        { id: 1, suit: '♣', color: 'black' },
        { id: 2, suit: '♦', color: 'red' },
        { id: 3, suit: '♥', color: 'red' },
        { id: 4, suit: '♠', color: 'black' },
        { id: 5, suit: 'NT', color: 'warning' }
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
    ...mapGetters('jstore', ['myPlayer', 'myTable']),
    myTid: {
      get: function () {
        return this.myPlayer.tId
      }
    },
    mySid: {
      get: function () {
        return this.myPlayer.sId
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
      const b = this.myTurn === this.myPlayer.sId ? this.myState : 0
      return b
    },
    onBT (bt) {
      switch (bt) {
        case 'MP':
        case 'IMP':
        case 'XIMP':
          this.$data.tableData.bt = bt
          this.$q.notify({
            type: 'positive',
            message: `Board will switch to ${bt} next`
          })
          break
        default:
      }
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
      let seat = this.myTurn
      data.pop()
      data.push({ seat, bid })
      seat = (seat % 4) + 1
      data.push({ seat, bid: '?' })
      this.onAction({ action: 'bid', bid: { bids: { info, data } } })
    },
    onAction (action) {
      console.log('onAction', action)
      switch (action.action) {
        case 'sit': {
          this.$emit('onSit', { tId: this.myPlayer.tId, sId: action.sit.sId })
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
        }
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
    myTable: function (t1, t0) {
      // console.log('t', t1, t0)
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
    this.myState = this.myTable.state || 0
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
  min-width: 696px;
  min-height: 390px;
  max-height: 480px;
  border: 1px solid green;
  margin: 2px;
  width: 100%;
  height: 100%;
  background-image: url("~assets/jbbg.jpeg");
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Do not repeat the image */
  background-size: cover; /* Resize the background image to cover the entire container */
}
.box {
  border: 1px solid blue;
}
.bbox {
  min-height: 120px;
  min-width: 120px;
}
.cbox {
  max-height: 200px;
  max-width: 240px;
  border: 1px solid red;
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
