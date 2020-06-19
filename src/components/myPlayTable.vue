<template padding>
  <div v-if="jsTable">
    <div class="column jbtable">
      <div class="col">
        <div class="row no-wrap">
          <div class="col-4 items-start">
            <myBoard :jsTable="jsTable" :mySeat="mySeat" v-on:onTable="onTable"></myBoard>
          </div>
          <div class="col-5">
            <div class="column">
              <myHand
                :handId="1"
                :jsPlayer="jsPlayer"
                :jsTable="jsTable"
                v-on:onTable="onTable"
                class="myHand justify-start"
                offset="[10, 10]"
              />
            </div>
          </div>
          <div class="col-3 items-end column">
            <q-list bordered>
              <q-item-label overline class="bg-primary text-white shadow-2">
                <div class="full-width">
                  <div class="row statusbar">
                    <q-space />
                    <q-chip
                      square
                      color="green"
                      text-color="white"
                      icon="alarm"
                      :label="myStatus"
                      class="full-width"
                    >
                      <myTimer :timer="timer" />
                    </q-chip>
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
                      >
                        <q-tooltip>Call Admin...</q-tooltip>
                      </q-btn>
                      <q-btn
                        class="gt-xs"
                        size="12px"
                        flat
                        dense
                        round
                        icon="close"
                        @click="onCommand"
                      >
                        <q-tooltip>Exit Table</q-tooltip>
                      </q-btn>
                      <q-btn size="12px" flat dense round icon="more_vert">
                        <q-tooltip>Table Settings</q-tooltip>
                      </q-btn>
                    </q-btn-group>
                  </div>
                </div>
              </q-item-label>
              <q-item-section v-if="myState >1">
                <myBidBox :jsPlayer="jsPlayer" :jsTable="jsTable" class="fit bbox" />
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
                :jsPlayer="jsPlayer"
                :jsTable="jsTable"
                v-on:onTable="onTable"
                class="myHand justify-center"
              />
            </div>
          </div>
          <div class="col-4">
            <div class="column justify-start">
              <div class="centerbox">
                <q-card class="bbox pbox" v-if="myState === 1">
                  <q-card>
                    <myBidBox :jsPlayer="jsPlayer" :jsTable="jsTable" />
                  </q-card>
                </q-card>
                <q-card flat class="pbox transparent" v-if="myState === 2">
                  <myPlayBox :jsPlayer="jsPlayer" :jsTable="jsTable" :review="false" />
                </q-card>
                <q-space />
              </div>
            </div>
          </div>
          <div class="col-4">
            <div class="column">
              <myHand
                :handId="2"
                :jsPlayer="jsPlayer"
                :jsTable="jsTable"
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
              <myTricks :jsPlayer="jsPlayer" :jsTable="jsTable" class="myHand justify-start" />
            </div>
          </div>
          <div class="col-6">
            <div class="column">
              <myHand
                :handId="3"
                :jsPlayer="jsPlayer"
                :jsTable="jsTable"
                v-on:onTable="onTable"
                class="myHand justify-center"
              />
            </div>
          </div>
          <div class="col-3 column">
            <div class="justify-start">
              <myBid :jsPlayer="jsPlayer" :jsTable="jsTable" v-on:onTable="onTable" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import * as moment from 'moment'
import { mapState, mapGetters, mapActions } from 'vuex'
// import say from 'say'
import { tables$ } from 'src/api'
import myBoard from 'src/components/myBoard'
import myHand from 'src/components/myHand'
import myBid from 'src/components/myBid'
import myBidBox from 'src/components/myBidBox'
import myPlayBox from 'src/components/myPlayBox'
import myTricks from 'src/components/myTricks'
import myTimer from 'src/components/myTimer'

export default {
  name: 'myPlayTable',
  props: ['jsPlayer'],
  data: function () {
    return {
      state: 0,
      cc: { name: { NS: 'SAYC', EW: 'SAYC' }, card: { NS: '', EW: '' } },
      alert: null,
      timer: new Date().getTime()
    }
  },
  components: {
    myBoard,
    myHand,
    myBid,
    myBidBox,
    myPlayBox,
    myTricks,
    myTimer
  },
  computed: {
    ...mapState('jstore', ['jsPlayers', 'jsTables']),
    ...mapGetters('jstore', ['jsTableById']),

    jsTable () {
      const tId = this.jsPlayer.seat.tId
      return this.jsTableById(tId)
    },
    mySeat () {
      return this.jsPlayer.seat
    },
    myState: {
      get: function () {
        return this.$data.state
      },
      set: function (s) {
        this.$data.state = s
      }
    },
    myTurn () {
      return this.jsTable ? this.jsTable.turn : 0
    },
    myStatus () {
      switch (this.myState) {
        case 0:
          return 'Ready...'
        case 1:
          return 'Bidding...'
        case 2:
          return 'Playing...'
        case 3:
          return 'Reviewing...'
        default:
          return null
      }
    },
    myAlert () {
      try {
        return this.jsTable.alert
      } catch (err) {}
      return null
    },
    myBids () {
      return this.jsTable.bids
    },
    myPlays () {
      return this.jsTable.plays
    }
  },
  methods: {
    ...mapActions('jstore', ['addTable']),

    // onState (s) {},
    onTable (action) {
      console.log('onTable', action, this.jsTable)
      switch (action.action) {
        case 'sit': {
          this.$emit('onPlayer', action.seat)
          break
        }
        case 'ready': {
          tables$.patch(this.jsTable._id, {
            action: 'ready',
            state: action.state,
            ready: action.ready
          })
          break
        }
        case 'bT': {
          tables$.patch(this.jsTable._id, {
            action: 'play',
            bT: action.bT
          })
          break
        }
        case 'cc': {
          tables$.patch(this.jsTable._id, {
            action: 'play',
            cc: action.cc
          })
          break
        }
        case 'bid': {
          const bids = {
            action: 'play',
            bids: action.bid.bids
          }
          tables$.patch(this.jsTable._id, bids)
          break
        }
        case 'play': {
          const _info = this.myPlays.info
          const _data = [...this.myPlays.data] // .slice(0)
          const _played = _data.map(x => x.card) || []
          if (!_played.includes(action.play.card)) {
            _data.push(action.play)
            const plays = {
              action: 'play',
              plays: { info: _info, data: _data }
            }
            tables$.patch(this.jsTable._id, plays)
          }
          break
        }
        case 'claim': {
          tables$.patch(this.jsTable._id, {
            action: 'play',
            claim: action.claim
          })
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
          this.onTable({ action: 'sit', seat: null })
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
    jsTable (t1) {
      if (t1) this.myState = t1.state
    },
    myState (s1, s0) {
      // s0++
      /*
      for (let s = s0; s <= s1; s++) {
        this.onState(s)
      }
      */
      if (s1 === 3) {
        // review
        let message = this.jsTable.info.contract
        let score = this.jsTable.score
        if (this.jsTable.result === 0) message += '=' + this.jsTable.result
        else if (this.jsTable.result > 0) message += '+' + this.jsTable.result
        else message += this.jsTable.result

        if (this.jsTable.info.by % 2 === 0) score = -score

        this.$q.notify({
          message: message,
          caption: score,
          color: 'info'
        })
      }
      this.$data.timer = new Date().getTime()
    },
    myAlert (a) {
      if (a) {
        this.$q.notify({
          type: a.type,
          message: a.message
        })
      }
    },
    myTurn () {
      this.$data.timer = new Date().getTime()
    }
  },
  mounted () {},
  beforeDestroy () {}
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
.centerbox {
  align-items: center;
  justify-content: center;
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
