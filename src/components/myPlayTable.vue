<template>
  <div v-if='!!jsTable' class='fit'>
    <div class='column jbtable'>
      <div class='col'>
        <div class='row no-wrap'>
          <div class='col-4 items-start'>
            <myBoard :jsTable='jsTable' :mySeat='mySeat' v-on:onTable='onTable'></myBoard>
          </div>
          <div class='col-5'>
            <div class='column justify-start'>
              <myHand
                :handId='1'
                :jsPlayer='jsPlayer'
                :jsTable='jsTable'
                v-on:onTable='onTable'
                class='myHand'
              />
            </div>
          </div>
          <div class='col-3 items-start column'>
            <q-list bordered>
              <q-item-label overline class='bg-primary text-white shadow-2'>
                <div class='full-width row statusbar'>
                  <q-chip square color='green' text-color='white' icon='alarm'>
                    <myTimer :timer='timer' />
                  </q-chip>
                  <q-btn-group push>
                    <q-btn
                      class='gt-xs'
                      size='12px'
                      flat
                      dense
                      icon='live_help'
                      @click='onCommand(0)'
                      disable
                    >
                      <q-tooltip>Call Admin...</q-tooltip>
                    </q-btn>
                    <q-btn
                      class='gt-xs'
                      size='12px'
                      flat
                      dense
                      icon='close'
                      color='negative'
                      @click='onCommand(-1)'
                    >
                      <q-tooltip>Exit Table</q-tooltip>
                    </q-btn>
                    <q-btn size='12px' flat dense round icon='more_vert'>
                      <q-tooltip>Table Settings</q-tooltip>
                    </q-btn>
                  </q-btn-group>
                </div>
              </q-item-label>
              <q-item-section v-if='myState > 1'>
                <q-expansion-item
                  icon='img:jbIcon/svg/mix.svg'
                  :label='myContract'
                  header-class='bg-info text-white'
                  expand-icon-class='text-white'
                >
                  <myBidBox :jsPlayer='jsPlayer' :jsTable='jsTable' class='fit bbox' />
                </q-expansion-item>
              </q-item-section>
            </q-list>
          </div>
        </div>
      </div>
      <div class='col'>
        <div class='row no-wrap'>
          <div class='col-4'>
            <div class='column'>
              <myHand
                :handId='4'
                :jsPlayer='jsPlayer'
                :jsTable='jsTable'
                v-on:onTable='onTable'
                class='myHand justify-center'
              />
            </div>
          </div>
          <div class='col-4'>
            <div class='column items-center justify-center'>
              <div class='bbox'>
                <q-card class='fit' v-if='myState === 1'>
                  <q-card>
                    <myBidBox :jsPlayer='jsPlayer' :jsTable='jsTable' />
                  </q-card>
                </q-card>
                <q-card flat class='fit transparent' v-if='myState >= 2'>
                  <myPlayBox :jsPlayer='jsPlayer' :jsTable='jsTable' :review='false' />
                </q-card>
                <q-space />
              </div>
            </div>
          </div>
          <div class='col-4'>
            <div class='column'>
              <myHand
                :handId='2'
                :jsPlayer='jsPlayer'
                :jsTable='jsTable'
                v-on:onTable='onTable'
                class='myHand justify-start'
              />
            </div>
          </div>
        </div>
      </div>
      <div class='col-auto'>
        <div class='row items-end no-wrap'>
          <div class='col-3 column'>
            <div class='justify-end q-pa-sm'>
              <myTricks :jsPlayer='jsPlayer' :jsTable='jsTable' />
            </div>
          </div>
          <div class='col-5'>
            <div class='column'>
              <myHand
                :handId='3'
                :jsPlayer='jsPlayer'
                :jsTable='jsTable'
                v-on:onTable='onTable'
                class='myHand justify-center'
              />
            </div>
          </div>
          <div class='col-4 column'>
            <div class='justify-end'>
              <myBid :jsPlayer='jsPlayer' :jsTable='jsTable' v-on:onTable='onTable' />
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

import { jbContractBy } from 'src/jbBid'
import { jbIsPlayer, jbIsMyPd } from '../jbPlayer'
import { jbV2C } from 'src/jbVoice'

export default {
  name: 'myPlayTable',
  props: ['jsPlayer'],
  components: {
    myBoard,
    myHand,
    myBid,
    myBidBox,
    myPlayBox,
    myTricks,
    myTimer
  },
  data: () => ({
    cc: { name: { NS: 'SAYC', EW: 'SAYC' }, card: { NS: '', EW: '' } },
    alert: null,
    timer: new Date().getTime()
  }),
  computed: {
    ...mapState('jstore', ['jsPlayers', 'jsTables', 'jsSpeech']),
    ...mapGetters('jstore', ['jsTableById']),

    jsTable () {
      const tId = this.jsPlayer.seat.tId
      return this.jsTableById(tId)
    },
    mySeat () {
      return this.jsPlayer.seat
    },
    myState () {
      return this.jsTable ? this.jsTable.state : null
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
    myContract () {
      let c = this.jsTable.bids ? this.jsTable.bids.info.contract : null
      if (this.jsTable.bids.info.XX) c += 'XX'
      else if (this.jsTable.bids.info.X) c += 'X'
      return c
    },
    myAlert () {
      try {
        return this.jsTable.alert
      } catch (err) { }
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
    ...mapActions('jstore', ['addTable', 'addChat']),

    onTable (action) {
      // console.log('onTable', action)
      switch (action.action) {
        case 'sit': {
          this.$emit('onPlayer', action.seat)
          break
        }
        case 'ready': {
          tables$.patch(this.jsTable.id, {
            action: action.action,
            state: action.state,
            ready: action.ready
          })
          break
        }
        case 'bT': {
          tables$.patch(this.jsTable.id, {
            action: action.action,
            bT: action.bT
          })
          break
        }
        case 'cc': {
          tables$.patch(this.jsTable.id, {
            action: action.action,
            cc: action.cc
          })
          break
        }
        case 'bid': {
          const bidData = {
            action: action.action,
            bids: action.bid.bids,
            alert: action.bid.alert
          }
          tables$.patch(this.jsTable.id, bidData)
          break
        }
        case 'play': {
          const _info = this.myPlays.info
          const _data = [...this.myPlays.data] // .slice(0)
          const _played = _data.map((x) => x.card) || []
          if (!_played.includes(action.play.card)) {
            _data.push(action.play)
            const plays = {
              action: action.action,
              plays: { info: _info, data: _data }
            }
            tables$.patch(this.jsTable.id, plays)
          }
          break
        }
        case 'claim': {
          tables$.patch(this.jsTable.id, {
            action: action.action,
            claim: action.claim
          })
          break
        }
        default: {
        }
      }
    },
    onCommand (action) {
      // const cmd = action.target.innerText
      switch (action) {
        case -1: {
          this.onTable({ action: 'sit', seat: null })
          break
        }
        case 0: {
          break
        }
        default:
      }
    }
  },
  watch: {
    jsTable (t) {
      if (!t) this.onTable({ action: 'sit', seat: null })
    },
    myState (s1, s0) {
      switch (s1) {
        case 1: {
          const from = {
            nick:
              this.jsTable.board.bT +
              ': ' +
              this.jsTable.board.bId +
              '#' +
              this.jsTable.board.bN,
            id: '@info'
          }
          const board = {
            to: this.jsTable.id,
            text: 'Played: ' + this.jsTable.board.played,
            from
          }
          this.addChat(board)
          break
        }
        case 3: {
          // review
          let message = jbContractBy(this.jsTable.bids.info)
          const score = this.jsTable.score
          let caption = score.score

          if (score.result === 0) message += ' = MADE'
          else if (score.result > 0) message += '+' + score.result
          else message += score.result

          if (this.jsTable.bids.info.by % 2 === 0) caption = -score.score

          const from = {
            nick:
              this.jsTable.board.bT +
              ': ' +
              this.jsTable.board.bId +
              '#' +
              this.jsTable.board.bN,
            id: '@info'
          }
          const result = {
            to: this.jsTable.id,
            text: 'Result: ' + message,
            from
          }
          this.addChat(result)

          this.$q.notify({
            message: message,
            caption: caption,
            color: 'info'
          })
          break
        }
        default:
      }
      this.$data.timer = new Date().getTime()
    },
    myAlert (a) {
      if (a) {
        if (jbIsMyPd(a.sId, this.mySeat.sId)) return
        if (this.myState < 1 || this.myState > 3) return
        const message = (a.bid || a.play) + ' = ' + a.alert
        const from = { nick: 'ALERT', id: '@info' }

        const alert = {
          to: this.jsTable.id,
          text: message,
          from
        }
        this.addChat(alert)

        this.$q.notify({
          type: 'warning',
          message,
          caption: 'ALERT'
        })
      }
    },
    myTurn () {
      this.$data.timer = new Date().getTime()
    },
    jsSpeech (s) {
      if (!jbIsPlayer(this.mySeat.sId)) return
      const c = jbV2C(s)
      switch (c) {
        case 'ready':
          if (this.myState < 1 || this.myState > 2) {
            const ready = [...this.jsTable.ready] || [0, 0, 0, 0]
            ready[this.mySeat.sId - 1] = this.mySeat.sId
            const readyData = {
              action: 'ready',
              state: this.myState,
              ready: ready
            }
            this.onTable(readyData)
          }
          break
        case 'sit north':
        case 'north':
          this.$emit('onPlayer', { tId: this.mySeat.tId, sId: 1 })
          break
        case 'sit east':
        case 'east':
          this.$emit('onPlayer', { tId: this.mySeat.tId, sId: 2 })
          break
        case 'sit south':
        case 'south':
          this.$emit('onPlayer', { tId: this.mySeat.tId, sId: 3 })
          break
        case 'sit west':
        case 'west':
          this.$emit('onPlayer', { tId: this.mySeat.tId, sId: 4 })
          break
        default:
      }
    }
  },
  mounted () {
    if (this.$q.screen.lt.sm) {
      this.$q.fullscreen.request()
        .then(() => { // v1.5.0+
          // success!
          const message = 'Rotate to Landscape/Portrait to PLAY/CHAT...'
          const from = { nick: 'FYI', id: '@info' }

          const alert = {
            to: this.jsTable.id,
            text: message,
            from
          }
          this.addChat(alert)

          this.$q.notify({
            type: 'info',
            message,
            caption: 'FYI'
          })
        })
        .catch(() => { // v1.5.0+
          // oh, no!!!
        })
    }
  },
  beforeDestroy () {
    // Exiting fullscreen mode:
    if (this.$q.fullscreen.isActive) this.$q.fullscreen.exit()
  }
}
</script>
<!-- Notice lang='scss' -->
<style scoped>
.jbtable {
  margin: 0px;
  min-height: 393px;
  background-image: url('~assets/imgs/jbbg.jpeg');
  background-position: center; /* Center the image */
  background-repeat: no-repeat; /* Do not repeat the image */
  background-size: cover; /* Resize the background image to cover the entire container */
}
.bbox {
  margin: auto;
  align-items: center;
  justify-content: center;
  overflow: auto;
  z-index: 100;
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
