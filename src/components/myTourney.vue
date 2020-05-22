<template>
  <div class="q-pa-md">
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title>Tourney List:</q-toolbar-title>
      <q-btn
        :icon="newT2 ? 'close' : 'add'"
        :disable="!isTD"
        @click="newT2=!newT2"
      />
    </q-toolbar>
    <q-expansion-item
      default-opened
      expand-separator
      icon="event"
      header-class="bg-teal text-white"
      expand-icon-class="text-white"
      v-if="newT2"
      :label="`Tourney Director: @${t2.td}`"
    >
      <q-card>
        <q-card-section>
          <q-item-label header>
            <div class="q-ma-md row">
              <q-input
                standout="bg-teal text-white"
                v-model="t2.name"
                label="Tourney Name"
                class="col-8"
              />
              <q-space />
              <div class="col">
                <q-badge color="secondary">Start in: {{ t2.minutes2 }} minutes</q-badge>
                <q-slider
                  dense
                  v-model="t2.minutes2"
                  color="red"
                  :min="10"
                  :max="30"
                  :step="10"
                />
              </div>
            </div>
          </q-item-label>
          <q-separator />
          <q-item>
            <q-item-section side>
              <q-icon name="settings" />
            </q-item-section>
            <q-separator />
            <q-item-section>
              <div class="q-ma-md row">
                <q-slider
                  dense
                  v-model="t2.bN"
                  :min="1"
                  :max="5"
                  :step="1"
                  markers
                  snap
                  label
                  label-always
                  :label-value="`boards/round: ${t2.bN}`"
                  color="blue"
                  class="col-5"
                />
                <q-separator vertical>
                  <q-space />
                </q-separator>
                <q-slider
                  dense
                  v-model="t2.bR"
                  :min="4"
                  :max="10"
                  :step="1"
                  markers
                  snap
                  label
                  label-always
                  :label-value="`rounds: ${t2.bR}`"
                  color="green"
                  class="col-5"
                />
              </div>
            </q-item-section>
            <q-item-section
              side
              top
            >
              <div class="q-pa-md bg-info">
                <q-option-group
                  dense
                  :options="bT"
                  label="Board"
                  type="radio"
                  v-model="t2.bT"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-card-section>
        <q-separator dark />
        <q-card-actions align="right">
          <q-btn
            push
            @click="onState(t2, 0)"
          >Submit</q-btn>
        </q-card-actions>
      </q-card>
    </q-expansion-item>
    <q-list
      bordered
      separator
    >
      <q-expansion-item
        dense-toggle
        switch-toggle-side
        expand-separator
        header-class="bg-teal text-white"
        expand-icon-class="text-white"
        v-for="t in myTourneys"
        :key="t.id"
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
              >@{{t.td}}: {{t.name}}</q-chip>
            </q-item-label>
            <q-item-label caption>
              <q-badge color="blue">{{t.bT}}</q-badge>
              <q-badge
                transparent
                align="middle"
                color="orange"
              >{{t.bN}} x {{t.bR}}</q-badge>
            </q-item-label>
          </q-item-section>
          <q-item-section
            side
            top
          >
            <q-badge color="info">start in: {{startAt(t.startAt)}}</q-badge>
          </q-item-section>
          <q-item-section side>
            <q-item-section avatar>
              <q-fab
                color="primary"
                square
                icon="keyboard_arrow_down"
                label="Status"
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
                  @click="onState(t, -1)"
                  icon="hourglass_empty"
                  label="Close"
                />
                <q-fab-action
                  square
                  padding="5px"
                  label-position="right"
                  color="positive"
                  @click="onState(t, 1)"
                  icon="hourglass_full"
                  label="Start"
                />
                <q-fab-action
                  square
                  padding="5px"
                  label-position="right"
                  color="warning"
                  @click="onState(t,  0)"
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
              v-for="p in t.pairs"
              :key="p.pN"
              :t2="t"
              :myPlayer="myPlayer"
              :myPair="p"
              v-on:onRoomId="onRoomId"
              v-on:onPair="onPair"
              class="pair"
            />
          </q-card-section>
          <q-card-section class="justify-start"></q-card-section>
          <q-separator
            color="orange"
            inset
          />
          <q-card-actions
            align="right"
            v-if="t.state===0"
          >
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
            <q-separator
              vertical
              inset
            />
            <q-input
              filled
              dense
              v-model="myCC"
              label="My CC..."
            />
            <q-space />
            <q-input
              filled
              dense
              v-model="myPd"
              label="My Partner"
            />
            <q-space>
              <q-separator />
            </q-space>
            <q-btn
              push
              @click="onRegister(t)"
            >{{register(t)}}</q-btn>
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
import { jbBoardMix } from '../jb'
import { jbIsAdmin, jbIsMyPlayer, jbIsPlayer } from 'src/jbPlayer'
import { tourneys$ } from 'src/api'
import myT2List from 'src/components/myT2List'

export default {
  name: 'myTourney',
  props: ['myPlayer'],

  data () {
    return {
      newT2: false,
      t2: {
        name: 'Welcome to my Tourney...',
        td: this.myPlayer.nick,
        minutes2: 30,
        bT: jbBoardMix(),
        bN: 2,
        bR: 6,
        state: 0,
        pairs: []
      },
      bT: [
        { label: 'MP', value: 'MP', color: 'blue' },
        { label: 'IMP', value: 'IMP', color: 'green' },
        { label: 'XIMP', value: 'XIMP', color: 'red' }
      ],
      myPd: null,
      myCC: 'SAYC'
    }
  },
  components: {
    myT2List
  },
  computed: {
    ...mapState('jstore', ['tourneys', 'jbT2']),
    ...mapGetters('jstore', ['getPlayerById', 'getPlayerByNick']),
    myTourneys () {
      return this.tourneys
    },
    isTD () {
      return jbIsAdmin(this.myPlayer)
    }
  },
  methods: {
    ...mapActions('jstore', ['setRoomId']),
    isOnline (nick) {
      try {
        return this.getPlayerByNick(nick).state >= 0
      } catch (err) { }
      return false
    },
    register (t) {
      try {
        if (this.jbT2._id === t._id) return 'Update'
      } catch (err) { }
      return 'Join'
    },
    onRegister (t) {
      // const pairs = [...t.pairs] // .slice(0)
      const pairs = JSON.parse(JSON.stringify(t.pairs))
      let pd
      let pair
      let pN = 0
      let message = null

      if (this.myPd && this.jbT2._id === t._id) {
        const players = t.pairs.map(p => (p.player || p.partner)).map(n => n.nick)
        // console.log(players, this.jbT2.myPair)
        if (this.jbT2.myPair) {
          if (jbIsMyPlayer(this.jbT2.myPair.player, this.myPlayer) || jbIsMyPlayer(this.jbT2.myPair.partner, this.myPlayer)) pN = this.jbT2.myPair.pN
        }
        if (players.includes(this.myPd)) {
          message = `${this.Pd} has already JOINED this tourney`
        } else if (this.isOnline(this.myPd)) {
          pd = this.getPlayerByNick(this.myPd)
          if (jbIsPlayer(pd)) message = `${this.Pd} is playing`
        } else if (t.state > 0) {
          message = `${this.Pd} is not online`
        } else pd = { nick: this.myPd }
      }

      if (message) {
        this.$q.notify({ type: 'info', message })
      } else {
        if (pN > 0 && pN <= pairs.length) {
          pair = pairs[pN - 1]
          pair.partner = pd
          pair.cc = this.myCC
        } else {
          pair = {
            player: this.myPlayer,
            partner: pd,
            cc: this.myCC,
            boards: 0,
            score: null,
            state: 0
          }
          pairs.push(pair)
        }

        this.onRoomId({ id: 2, jbT2: { _id: t._id, myPair: pair } })
        // console.log(pairs)
        tourneys$.patch(t._id, { pairs })
      }
    },
    onRoomId (jbT2) {
      if (this.jbT2 !== jbT2) this.setRoomId(jbT2)
    },
    onPair (pair) {
      tourneys$.patch(pair.t2._id, { pairs: pair.pairs })
    },
    onState (t, s) {
      // console.log(t, s)
      switch (s) {
        case -1:
          tourneys$.remove(t._id)
          break
        case 0:
          tourneys$.create(t)
          break
        case 1:
          tourneys$.patch(t._id, { state: s })
          break
        default:
      }
      this.newT2 = false
    },
    getTourney (t) {
      let tinfo = `${t.td}: ${t.Name}`
      tinfo += `: ${t.bN} x ${t.bR}`
      return tinfo
    },
    startAt (startAt) {
      // return moment(startAt).format('MMM Do, hh:mm:ss')
      return moment(startAt).toNow()
    }
  },
  mounted () {
    // console.log(this.jbT2)
    if (this.jbT2._id) {
      this.myCC = this.jbT2.myPair.cc || 'SAYC'
      this.myPd = this.jbT2.myPair.partner ? this.jbT2.myPair.partner.nick : null
    }
  },
  watch: {
    newT2 (t2) {
      // console.log(t2, this.isTD)
    }
  }
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
