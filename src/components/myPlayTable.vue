<template padding>
  <div>
    <div class='column jbtable'>
      <div class='col'>
        <div class='row no-wrap'>
          <div class='col-4 items-start'>
            <myBoard
              :myTable='myTable'
              :mySeat='mySeat'
              v-on:onTable='onTable'
            ></myBoard>
          </div>
          <div class='col-5'>
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
          <div class='col-4'>
            <div class='column'>
              <myHand
                :handId='4'
                :myPlayer='myPlayer'
                :myTable='myTable'
                v-on:onTable='onTable'
                class='myHand justify-center'
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
          <div class='col-4'>
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
                class='myHand justify-start'
              />
            </div>
          </div>
          <div class='col-6'>
            <div class='column'>
              <myHand
                :handId='3'
                :myPlayer='myPlayer'
                :myTable='myTable'
                v-on:onTable='onTable'
                class='myHand justify-center'
              />
            </div>
          </div>
          <div class='col-3 bidbox'>
            <div class='fit'>
              <myBid
                :myPlayer='myPlayer'
                :myTable='myTable'
                v-on:onTable='onTable'
                class='justify-center'
              />
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
import myBoard from 'src/components/myBoard'
import myHand from 'src/components/myHand'
import myBid from 'src/components/myBid'
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
      cc: { name: { NS: 'SAYC', EW: 'SAYC' }, card: { NS: '', EW: '' } },
      alert: null
    }
  },
  components: {
    myBoard,
    myHand,
    myBid,
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
    myAlert: {
      get: function () {
        return this.myTable ? this.myTable.alert : null
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
    }
  },
  methods: {
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
          const alert = {
            type: 'info',
            message: `Declarer is claiming: ${action.claim.info}: ${action.claim.claim}`
          }
          tableService.patch(this.myTable.id, { alert, claim: action.claim })
          break
        }
        default: { }
      }
    }
  },
  watch: {
    myPlayer (n, o) {
      console.log('p', n, o)
    },
    myTable (t1, t0) {
      console.log('t', t1, t0)
      this.myState = t1.state
    },
    myState (s1, s0) {
      // s0++
      for (let s = s0; s <= s1; s++) {
        this.onState(s)
      }
    },
    myAlert (a) {
      if (a) {
        this.$q.notify({
          type: a.type,
          message: a.message
        })
      }
    },
    myTurn (t1, t0) { }
  },
  mounted () {
    console.log('t', this.myTable)
  },
  beforeDestroy () { }
}
</script>
<!-- Notice lang='scss' -->
<style scoped>
.jbtable {
  /*
  min-width: 694px;
  min-height: 393px;
  max-height: 480px;
  border: 1px solid red;
  width: 100%;
  height: 100%;
  */
  margin: 2px;
  background-image: url("/statics/imgs/jbbg.jpeg");
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Do not repeat the image */
  background-size: cover; /* Resize the background image to cover the entire container */
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
