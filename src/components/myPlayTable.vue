<template>
  <div class='q-ma-none'>
    <div class='jbtable column bg-teal'>
      <div class='col'>
        <div class='row no-wrap'>
          <div class='col-3 items-start'>
            <myBoard :myTable='myTable' v-on:onBT='onBT'></myBoard>
          </div>
          <div class='col-6 box'>
            <div class='column'>
              <myHand :handId='1' v-on:onAction='onAction' class='myHand justify-start' />
            </div>
          </div>
          <div class='col-3 self-start'>
            <div class='row justify-end' v-if='myState > 1'>
              <myBidBox />
            </div>
          </div>
        </div>
      </div>
      <div class='col'>
        <div class='row no-wrap'>
          <div class='col-4 box'>
            <div class='column'>
              <myHand :handId='4' v-on:onAction='onAction' class='myHand justify-end' />
            </div>
          </div>
          <div class='col-4'>
            <div class='column'>
              <q-card class='bbox cbox' v-if='myState === 1'>
                <q-card>
                  <myBidBox />
                </q-card>
              </q-card>
              <q-card class='cbox transparent' v-if='myState === 2'>
                <myPlayBox :card4='played4' :seatX='seatX' />
              </q-card>
            </div>
          </div>
          <div class='col-4 box'>
            <div class='column'>
              <myHand :handId='2' v-on:onAction='onAction' class='myHand justify-start' />
            </div>
          </div>
        </div>
      </div>
      <div class='col'>
        <div class='row no-wrap'>
          <div class='col-3' />
          <div class='col-6 box'>
            <div class='column'>
              <myHand :handId='3' v-on:onAction='onAction' class='myHand justify-end' />
            </div>
          </div>
          <div class='col-3'>
            <div class='column' v-if='isMyTurn() === 1'>
              <div class='row bidrow items-start' style='height:30px'>
                <q-btn-group push>
                  <q-fab
                    v-for='n of 7' :key='n'
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
              <div class='row items-center' style='height:40px'>
                <q-input dense standout autofocus clearable color='warning' v-model='alert' label='Alert' class='full-width'>
                  <template v-slot:prepend>
                    <q-icon name='add_alert' />
                  </template>
                </q-input>
              </div>
              <div class='row items-end' style='height:30px'>
                <q-btn-group dense class='full-width'>
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
                    style='width:30%'
                  />
                  <q-btn glaosy label='Pass' color='primary' @click="onBid('P')" style='width:50%' />
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

export default {
  name: 'myPlaysTable',
  data: function () {
    return {
      tableData: null,
      state: 0,
      seatX: [1, 2, 3, 4],
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
    myPlayBox
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
        return this.myTable.play
      }
    },
    X: function () {
      return jb.bidX(this.myBids.info.by, this.myTurn)
    },
    XX: function () {
      return jb.bidX(this.myBids.info.X, this.myTurn)
    },
    played4: function () {
      let card4 = [null, null, null, null]
      if (this.myState > 1) {
        try {
          const l4 = this.myTable.play.data.length
          let n4 = l4 % 4
          if (!n4) n4 = 4
          card4 = this.myTable.play.data.slice(-n4)
          // console.log(l4, n4, this.myTable.play.data)
        } catch (_) {
          // console.log(err)
        }
      }
      return card4
    }
  },
  methods: {
    isMyTurn () {
      const b = this.myTurn === this.myPlayer.sId ? this.myState : 0
      console.log('turn', this.myTurn, this.myPlayer.sId)
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
      console.log('bid', bid, this.myTable)
      const _bid = this.myBids
      let _turn = this.myTurn
      _bid.data.pop()
      _bid.data.push({ seat: _turn, bid: bid })
      _turn = (_turn % 4) + 1
      _bid.data.push({ seat: _turn, bid: '?' })
      tableService.patch(this.myTable._id, { bid: _bid, turn: _turn })
    },
    onAction (data) {
      console.log('onAction', data)
      if (data.action === 'sit') {
        if (!data.uId) {
          this.$emit('onSit', { tId: this.myPlayer.tId, sId: data.sId })
        } else if (data.uId === this.myUid) {
          this.$q.notify({ type: 'info', message: 'Ready' })
        } else {
          this.$q.notify({ type: 'negative', message: 'This seat is taken' })
        }
      } else if (data.action === 'play') {
        const _play = this.myTable.play || []
        const _played = _play.data.map(x => x.card) || []
        if (!_played.includes(data.card)) {
          _play.data.push(data.play)
          tableService.patch(this.myTable._id, { play: _play })
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
    myTable: function (t) {
      console.log('t', t)
      this.myState = t.state
    },
    myState: function (s1, s0) {
      // s0++
      for (let s = s0; s <= s1; s++) {
        this.onState(s)
      }
    },
    myTurn: function (t1, t0) {}
  },
  created () {
    // this.$parent.page = 'Lobby'
    // this.myTable = this.getTableById(this.user.tId)
    /*
    tableService.on('patched', table => {
      if (table._id === this.user.tId) {
        this.myTable = table
      }
    })
    */
  },
  beforeDestroy () {}
}
</script>
<!-- Notice lang='scss' -->
<style scoped>
.q-fab >>> .q-btn {
  height: 28px
}
.q-btn >>> .q-icon {
  float: left;
  align-self: flex-start;
}
.bidrow {
  flex-wrap: no-wrap;
}
.bidfab {
  width:28px;
  height:28px;
  padding:0px;
  margin:0px;
}
.jbtable {
  min-width: 696px;
  min-height: 390px;
  border: 1px solid green;
  width: 100%;
  height: 100%;
  background-image: url('../statics/img/jbbg.jpeg');
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Do not repeat the image */
  background-size: cover; /* Resize the background image to cover the entire container */
}
.jbtable > div {
  border: 1px solid yellow;
  align-items: flex-end;
}
.box {
  border: 1px solid blue;
}
.bbox {
  min-height: 160px;
  min-width: 160px;
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
}
</style>
