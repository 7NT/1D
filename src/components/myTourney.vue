<template>
  <div class="q-pa-md">
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title>Tourney List:</q-toolbar-title>
      <q-btn :icon="newT2 ? 'close' : 'add'" :disable="!isTD" @click="newT2=!newT2" />
    </q-toolbar>
    <q-expansion-item
      dense
      default-opened
      expand-separator
      icon="event"
      header-class="bg-info text-white"
      expand-icon-class="text-white"
      :label="`Tourney Director: @${t0.td}`"
      v-show="newT2"
    >
      <q-card>
        <q-card-section>
          <q-item-label header>
            <div class="q-ma-md row">
              <q-input
                standout="bg-teal text-white"
                v-model="myT2.name"
                label="Tourney Name"
                class="col-8"
              />
              <q-space />
              <div class="col">
                <q-badge color="secondary">Start in: {{ myT2.minutes2 }} minutes</q-badge>
                <q-slider dense v-model="myT2.minutes2" color="red" :min="10" :max="30" :step="10" />
              </div>
            </div>
          </q-item-label>
          <q-separator>
            <q-space />
          </q-separator>
          <q-item>
            <q-item-section>
              <div class="row justify-around">
                <div class="col-3">
                  <q-btn-toggle
                    v-model="t0.bT"
                    push
                    glossy
                    toggle-color="primary"
                    :options="[
                      {label: 'MP', value: 'MP'},
                      {label: 'IMP', value: 'IMP'},
                      {label: 'XIMP', value: 'XIMP'},
                    ]"
                  />
                </div>
                <div class="col-3">
                  <q-slider
                    dense
                    v-model="t0.bN"
                    :min="1"
                    :max="5"
                    :step="1"
                    markers
                    snap
                    label
                    label-always
                    :label-value="`boards/round: ${t0.bN}`"
                    color="blue"
                  />
                </div>
                <div class="col-3">
                  <q-slider
                    dense
                    v-model="t0.bR"
                    :min="4"
                    :max="10"
                    :step="1"
                    markers
                    snap
                    label
                    label-always
                    :label-value="`rounds: ${t0.bR}`"
                    color="green"
                  />
                </div>
              </div>
            </q-item-section>
          </q-item>
        </q-card-section>
        <q-separator dark />
        <q-card-actions align="right">
          <q-btn push :disable="myT2.state > 0" @click="onCreate(myT2)" label="Submit"></q-btn>
        </q-card-actions>
      </q-card>
    </q-expansion-item>
    <q-list dense bordered separator>
      <q-expansion-item
        dense
        dense-toggle
        switch-toggle-side
        expand-separator
        header-class="bg-teal text-white"
        expand-icon-class="text-white"
        v-for="t2 in myTourneys"
        :key="t2.id"
        :v-model="!newT2"
      >
        <template v-slot:header>
          <q-item-section>
            <q-item-label overline>
              <q-chip
                square
                class="glossy"
                color="green"
                text-color="white"
                icon="emoji_events"
              >@{{t2.td}}: {{t2.name}}</q-chip>
            </q-item-label>
            <q-item-label caption>
              <q-badge color="blue">{{t2.bT}}</q-badge>
              <q-badge transparent align="middle" color="orange">{{t2.bN}} x {{t2.bR}}</q-badge>
            </q-item-label>
          </q-item-section>
          <q-item-section side top>
            <q-badge color="info">start in: {{startAt(t2.startAt)}}</q-badge>
          </q-item-section>
          <q-item-section side>
            <q-item-section avatar>
              <q-fab
                color="primary"
                square
                icon="keyboard_arrow_left"
                :label="getT2Status(t2.state)"
                vertical-actions-align="left"
                direction="left"
                padding="none sm"
                :disable="!isTD"
              >
                <q-fab-action
                  square
                  padding="5px"
                  label-position="right"
                  color="negative"
                  @click="onState(t2, -1)"
                  icon="hourglass_empty"
                  label="Close"
                />
                <q-fab-action
                  v-show="t2.state > 0"
                  square
                  padding="5px"
                  label-position="right"
                  color="positive"
                  @click="onState(t2, 2)"
                  icon="hourglass_full"
                  label="Start"
                />
                <q-fab-action
                  v-show="t2.state < 1"
                  square
                  padding="5px"
                  label-position="right"
                  color="warning"
                  @click="onState(t2, 1)"
                  icon="alarm_on"
                  label="Ready..."
                />
              </q-fab>
            </q-item-section>
          </q-item-section>
        </template>
        <q-card>
          <q-card-section>
            <myT2List
              v-for="p2 in t2.pairs"
              :key="p2.pN"
              :t2="t2"
              :jsPlayer="jsPlayer"
              :myPair="p2"
              v-on:onPairs="onPairs"
            />
          </q-card-section>
          <q-card-section class="justify-start"></q-card-section>
          <q-separator color="orange" inset />
          <q-card-actions align="right">
            <template v-if="t2.state===0">
              <div class="row">
                <q-btn-toggle
                  v-model="myCC"
                  push
                  glossy
                  toggle-color="primary"
                  :options="[
                    {label: 'SAYC', value: 'SAYC'},
                    {label: '2/1', value: '2/1'},
                    {label: 'Precision', value: 'Precision'},
                  ]"
                />
                <q-separator vertical inset />
                <q-input filled dense v-model="myCC" label="My CC..." />
                <q-space />
                <q-input filled dense v-model="myPd" label="My Partner" />
                <q-space>
                  <q-separator />
                </q-space>
                <q-btn push @click="onRegister(t2)">{{register(t2)}}</q-btn>
              </div>
            </template>
            <template v-if="isTD">
              <q-btn push @click="onAddPair(t2)" v-if="isTD">Add Pair</q-btn>
            </template>
          </q-card-actions>
        </q-card>
      </q-expansion-item>
      <q-separator />
    </q-list>
  </div>
</template>

<script>
import moment from 'moment'
import { mapState, mapGetters, mapActions } from 'vuex'
import { jbIsAdmin, jbIsMyNick, jbIsPlayer } from 'src/jbPlayer'
import { jbMix } from 'src/jbBoard'
import { tourneys$, chats$ } from 'src/api'
// import myT2Setup from 'src/components/myT2Setup'
import myT2List from 'src/components/myT2List'
import myT2Pair from 'src/components/myT2Pair'

export default {
  name: 'myTourney',
  props: ['jsPlayer'],

  data () {
    return {
      t0: {
        id: null,
        name: 'Welcome to my Tourney...',
        td: this.jsPlayer.nick,
        minutes2: 30,
        bT: jbMix(),
        bN: 2,
        bR: 6,
        state: 0,
        pairs: []
      },
      newT2: false,
      myPd: null,
      myCC: 'SAYC'
    }
  },
  components: { myT2List },
  computed: {
    ...mapState('jstore', ['jsTourneys', 'jsT2']),
    ...mapGetters('jstore', ['jsPlayerByNick', 'jsTourneyByTD']),

    myTourneys () {
      return this.jsTourneys
    },
    myT2 () {
      const t0 = this.jsTourneyByTD(this.jsPlayer.nick)
      if (t0) return t0
      else return this.$data.t0
    },
    isTD () {
      return jbIsAdmin(this.jsPlayer)
    }
  },
  methods: {
    ...mapActions('jstore', ['setJsMap']),

    isOnline (nick) {
      try {
        return this.jsPlayerByNick(nick).state >= 0
      } catch (err) { }
      return false
    },
    register (t2) {
      try {
        if (this.jsT2._id === t2._id) return 'Update'
      } catch (err) { }
      return 'Join'
    },
    onAddPair (t2) {
      const p0 = {
        pN: t2.pairs.length + 1,
        cc: 'SAYC',
        player: null,
        partner: null,
        state: 0,
        boards: 0,
        score: null
      }
      this.$q
        .dialog({
          component: myT2Pair,
          // optional if you want to have access to
          // Router, Vuex store, and so on, in your
          // custom component:
          parent: this, // becomes child of this Vue node
          // ("this" points to your Vue component)
          // (prop was called "root" in < 1.1.0 and
          // still works, but recommending to switch
          // to the more appropriate "parent" name)

          // props forwarded to component
          // (everything except "component" and "parent" props above):
          pair: p0
          // ...more.props...
        })
        .onOk(() => {
          const p1 = this.jsPlayerByNick(p0.player)
          const p2 = this.jsPlayerByNick(p0.partner)
          if (p1 && p2) {
            p0.player = p1.nick
            p0.partner = p2.nick
            const pairs = JSON.parse(JSON.stringify(t2.pairs))
            pairs.push(p0)
            tourneys$.patch(t2._id, { pairs })
          } else {
            this.$q.notify({
              type: 'info',
              message: 'the sub player is not online'
            })
          }
        })
        .onCancel(() => {
          // console.log('Cancel', pair0)
        })
        .onDismiss(() => {
          // console.log('Called on OK or Cancel', pair0)
        })
    },
    onRegister (t2) {
      // const pairs = [...t.pairs] // .slice(0)
      const pairs = JSON.parse(JSON.stringify(t2.pairs))
      let pd
      let pair
      let pN = 0
      let message = null

      if (this.myPd) {
        if (this.jsT2 && this.jsT2._id === t2._id) {
          pN = this.jsT2.myPair.pN
          if (this.jsT2.myPair.partner === this.myPd) {
            message = `You and ${this.myPd} have already JOINED this tourney, your partner can UPDATE cc card`
          } else {
            const players = t2.pairs.map(p => p.player || p.partner) // .map(n => n.nick)
            if (players.includes(this.myPd)) {
              message = `${this.myPd} has already JOINED this tourney`
            }
          }
        }
        if (!message) {
          // this.$q.notify({ type: 'info', message })
          pd = this.jsPlayerByNick(this.myPd)
          if (pd) {
            if (jbIsPlayer(pd)) message = `${this.myPd} is playing`
            else {
              const chatData = {
                to: `@${pd.id}`,
                request: { q: 't2', id: t2._id, cc: this.myCC },
                text: 'Join me in Tourney?'
              }
              chats$.create(chatData)
              message = `sending tourney partner request to ${this.myPd}...`
            }
          } else if (t2.state > 0) {
            message = `${this.Pd} is not online`
          } // else pd = this.myPd
        }
      }

      if (pN > 0 && pN <= pairs.length) {
        pair = pairs[pN - 1]
        pair.partner = this.myPd
        pair.cc = this.myCC
        pair.update = new Date().getTime()
      } else {
        pair = {
          pN: pairs.length + 1,
          player: this.jsPlayer.nick,
          partner: this.myPd,
          cc: this.myCC,
          boards: 0,
          score: null,
          state: 0,
          updateAt: new Date().getTime()
        }
        pairs.push(pair)
      }

      this.onPairs({
        _id: t2._id,
        pairs,
        myPair: pair
      })
    },
    onT2 (jsT2) {
      if (this.jsT2 !== jsT2) this.setJsMap(jsT2)
    },
    onPairs (p2) {
      if (p2.myPair) { this.setJsMap({ key: 't2', value: { _id: p2._id, myPair: p2.myPair } }) }
      if (p2.pairs) tourneys$.patch(p2._id, { pairs: p2.pairs, state: p2.state })
      else if (p2.pstate) tourneys$.patch(p2._id, { pstate: p2.pstate })
    },
    getT2Status (s) {
      switch (s) {
        case 0:
          return 'Status: Waiting...'
        case 1:
          return 'Status: Ready...'
        case 2:
          return 'Status: Playing...'
        case -1:
          return 'Status: Closed'
        default:
          return 'Status'
      }
    },
    onCreate (t2) {
      if (t2._id) {
        if (t2.td !== this.jsPlayer.nick) {
          if (!this.isOnline(t2.td)) {
            tourneys$.patch(t2._id, { td: this.jsPlayer.nick })
          } else {
            this.$q.notify({
              type: 'positive',
              message: `TD: ${t2.td} is online`
            })
          }
        }
      } else tourneys$.create(t2)
      this.newT2 = false
    },
    onState (t2, s) {
      switch (s) {
        case -1:
          tourneys$.remove(t2._id)
          break
        default:
          if (t2.state < s) tourneys$.patch(t2._id, { state: s })
      }
      this.newT2 = false
    },
    getTourney (t2) {
      let tinfo = `${t2.td}: ${t2.Name}`
      tinfo += `: ${t2.bN} x ${t2.bR}`
      return tinfo
    },
    startAt (startAt) {
      // return moment(startAt).format('MMM Do, hh:mm:ss')
      return moment(startAt).fromNow()
    }
  },
  mounted () {
    if (this.jsT2) {
      this.myCC = this.jsT2.myPair.cc || 'SAYC'
      if (jbIsMyNick(this.jsT2.myPair.partner, this.jsPlayer.nick)) {
        this.myPd = this.jsT2.myPair.player.nick
      } else if (jbIsMyNick(this.jsT2.myPair.player, this.jsPlayer.nick)) {
        this.myPd = this.jsT2.myPair.partner.nick
      }
    }
  },
  watch: {}
}
</script>

<style scoped>
.q-btn .q-btn-toggle {
  /*max-width: 125px;*/
  /* height: 32px; */
  text-overflow: ellipsis;
  text-transform: none;
}
.pair {
  height: 30px;
}
</style>
