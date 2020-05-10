<template padding>
  <div v-if="myTable">
    <div class="column jbtable">
      <div class="col">
        <div class="row no-wrap">
          <div class="col-4 items-start">
            <myBoard
              :myTable="myTable"
              :mySeat="mySeat"
              v-on:onTable="onTable"
            ></myBoard>
          </div>
          <div class="col-5">
            <div class="column">
              <myHand
                :handId="1"
                :myPlayer="myPlayer"
                :myTable="myTable"
                v-on:onTable="onTable"
                class="myHand justify-start"
                offset="[10, 10]"
              />
            </div>
          </div>
          <div class="col-3 items-end column">
            <q-list bordered>
              <q-item-label
                overline
                class="bg-primary text-white shadow-2"
              >
                <div class="full-width">
                  <div class="row statusbar">
                    <q-space />
                    <q-chip
                      square
                      color="green"
                      text-color="white"
                      icon="alarm"
                      :label="myStatus"
                    />
                    <q-space />
                    <q-btn-group push>
                      <q-btn
                        class="gt-xs"
                        size="12px"
                        flat
                        dense
                        round
                        icon="live_help"
                        @click="onCommand"
                      />
                      <q-btn
                        class="gt-xs"
                        size="12px"
                        flat
                        dense
                        round
                        icon="close"
                        @click="onCommand"
                      />
                      <q-btn
                        size="12px"
                        flat
                        dense
                        round
                        icon="more_vert"
                      />
                    </q-btn-group>
                  </div>
                </div>
              </q-item-label>
              <q-item-section v-if="myState >1">
                <myBidBox
                  :myPlayer="myPlayer"
                  :myTable="myTable"
                  class="fit bbox"
                />
              </q-item-section>
            </q-list>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="row no-wrap">
          <div class="col-4">
            <div class="column">
              <myHand
                :handId="4"
                :myPlayer="myPlayer"
                :myTable="myTable"
                v-on:onTable="onTable"
                class="myHand justify-center"
              />
            </div>
          </div>
          <div class="col-4">
            <div class="column">
              <div>
                <q-card
                  class="bbox pbox"
                  v-if="myState === 1"
                >
                  <q-card>
                    <myBidBox
                      :myPlayer="myPlayer"
                      :myTable="myTable"
                    />
                  </q-card>
                </q-card>
                <q-card
                  flat
                  class="pbox transparent"
                  v-if="myState === 2"
                >
                  <myPlayBox
                    :myPlayer="myPlayer"
                    :myTable="myTable"
                    :review="false"
                  />
                </q-card>
                <q-space />
              </div>
            </div>
          </div>
          <div class="col-4">
            <div class="column">
              <myHand
                :handId="2"
                :myPlayer="myPlayer"
                :myTable="myTable"
                v-on:onTable="onTable"
                class="myHand justify-start"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="row no-wrap">
          <div class="col-3">
            <div class="column">
              <myTricks
                :myPlayer="myPlayer"
                :myTable="myTable"
                class="myHand justify-start"
              />
            </div>
          </div>
          <div class="col-6">
            <div class="column">
              <myHand
                :handId="3"
                :myPlayer="myPlayer"
                :myTable="myTable"
                v-on:onTable="onTable"
                class="myHand justify-center"
              />
            </div>
          </div>
          <div class="col-3 column">
            <div class="justify-start">
              <myBid
                :myPlayer="myPlayer"
                :myTable="myTable"
                v-on:onTable="onTable"
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
import { tables$ } from 'src/api'
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
    myStatus: {
      get: function () {
        switch (this.myState) {
          case -1: return 'Reviewing...'
          case 0: return 'Ready...'
          case 1: return 'Bidding...'
          case 2: return 'Playing...'
          default: return null
        }
      }
    },
    myAlert: {
      get: function (n) {
        try {
          return this.myTable.alert
        } catch (err) { }
        return null
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
    onState (s) { },
    onTable (action) {
      console.log('onTable', action)
      switch (action.action) {
        case 'sit': {
          this.$emit('onPlayer', action.seat)
          break
        }
        case 'ready': {
          tables$.patch(this.myTable.id, {
            state: action.state,
            ready: action.ready
          })
          break
        }
        case 'bt': {
          tables$.patch(this.myTable.id, { bt: action.bt })
          break
        }
        case 'cc': {
          tables$.patch(this.myTable.id, { cc: action.cc })
          break
        }
        case 'bid': {
          const bids = { bids: action.bid.bids }
          tables$.patch(this.myTable.id, bids)
          break
        }
        case 'play': {
          const _info = this.myPlays.info
          const _data = this.myPlays.data.slice(0)
          const _played = _data.map(x => x.card) || []
          if (!_played.includes(action.play.card)) {
            _data.push(action.play)
            const plays = { plays: { info: _info, data: _data } }
            tables$.patch(this.myTable.id, plays)
          }
          break
        }
        case 'claim': {
          tables$.patch(this.myTable.id, { claim: action.claim })
          break
        }
        default: {
        }
      }
    },
    onCommand (action) {
      const cmd = action.target.innerText
      switch (cmd) {
        case 'close': {
          this.onTable({ action: 'sit', seat: { tId: '#Lobby', sId: 0 } })
          break
        }
        case 'live_help': {
          break
        }
        default:
      }
    }
  },
  watch: {
    myTable (t) {
      if (t) this.myState = t.state
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
    if (!this.myTable) {
      const seat = { sId: 0 }
      this.onTable({ action: 'sit', seat })
    }
  },
  beforeDestroy () { }
}
</script>
<!-- Notice lang='scss' -->
<style scoped>
.jbtable {
  margin: 2px;
  background-image: url("/statics/imgs/jbbg.jpeg");
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Do not repeat the image */
  background-size: cover; /* Resize the background image to cover the entire container */
}
.bbox {
  margin: auto;
  z-index: 100;
}
.pbox {
  max-height: 200px;
  max-width: 240px;
  margin: auto;
  overflow-y: auto;
}
.statusbar {
  min-width: 200px;
}
.myHand {
  min-height: 100px;
  max-height: 130px;
  min-width: 175px;
  margin-right: 10px;
}
</style>
