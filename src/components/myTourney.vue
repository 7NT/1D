<template>
  <div class="q-pa-md">
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title>Tourney List:</q-toolbar-title>
      <q-btn
        :icon="newT2 ? 'close' : 'add'"
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
      :key="componentKey"
    >
      <q-card>
        <q-card-section>
          <q-item-label header>
            <div class='q-ma-md row'>
              <q-input
                standout="bg-teal text-white"
                v-model="t2.name"
                label="Tourney Name"
                class='col-8'
              />
              <q-space />
              <div class='col'>
                <q-badge color="secondary">Start in: {{ t2.time }} minutes</q-badge>
                <q-slider
                  dense
                  v-model="t2.time"
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
              <q-icon name='settings' />
            </q-item-section>
            <q-separator />
            <q-item-section>
              <div class="q-ma-md row">
                <q-slider
                  dense
                  v-model="t2.bn"
                  :min="1"
                  :max="5"
                  :step="1"
                  markers
                  snap
                  label
                  label-always
                  :label-value='`boards/round: ${t2.bn}`'
                  color="blue"
                  class='col-5'
                />
                <q-separator vertical>
                  <q-space />
                </q-separator>
                <q-slider
                  dense
                  v-model="t2.br"
                  :min="4"
                  :max="10"
                  :step="1"
                  markers
                  snap
                  label
                  label-always
                  :label-value='`rounds: ${t2.br}`'
                  color="green"
                  class='col-5'
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
                  :options="bt"
                  label="Board"
                  type="radio"
                  v-model="t2.mix"
                />
              </div>
            </q-item-section>
          </q-item>
        </q-card-section>
        <q-separator dark />
        <q-card-actions align="right">
          <q-btn
            push
            @click='onState(t2, 0)'
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
        :caption="`start in: ${t.time} minutes`"
      >
        <template v-slot:header>
          <q-item-section>
            <q-item-label overline>
              <q-chip
                class="glossy"
                color="teal"
                text-color="white"
                icon="emoji_events"
              >
                @{{t.td}}: {{t.name}}
              </q-chip>
            </q-item-label>
            <q-item-label caption>
              <q-badge color="blue">
                {{t.mix}}
              </q-badge>
              <q-badge
                transparent
                align="middle"
                color="orange"
              >
                {{t.bn}} x {{t.br}}
              </q-badge>
            </q-item-label>
          </q-item-section>
          <q-item-section
            side
            top
          >
            <q-badge color="info">
              start in: {{startAt(t.startAt)}}
            </q-badge>
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
                style='height:30px'
              >
                <q-fab-action
                  square
                  label-position="right"
                  color="negative"
                  @click="onState(t, -1)"
                  icon="hourglass_empty"
                  label="Close"
                />
                <q-fab-action
                  square
                  label-position="right"
                  color="positive"
                  @click="onState(t, 1)"
                  icon="hourglass_full"
                  label="Start"
                />
                <q-fab-action
                  square
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
            <q-item
              v-for="p in t.pairs"
              :key="p.id"
              class='pair'
            >
              <q-item-section
                avatar
                top
              >
                <q-chip>
                  <q-avatar
                    color="info"
                    text-color="white"
                  >{{p.pairN}}</q-avatar>
                  {{p.cc}}
                </q-chip>
              </q-item-section>
              <q-item-section>
                <div class="text-grey-8 q-gutter-xs">
                  <q-btn
                    dense
                    :icon-right="getPFlag(p.player)"
                  >
                    <q-avatar
                      square
                      size="24px"
                      color="orange"
                    >
                      <img :src='getPAvatar(p.player)'>
                    </q-avatar>
                    {{getPNick(p.player)}}
                  </q-btn>
                  <template v-if="getPlayer(p.partner)">
                    <q-btn
                      dense
                      :icon-right="getPFlag(p.partner)"
                    >
                      <q-avatar
                        square
                        size="24px"
                        color="green"
                      >
                        <img :src='getPAvatar(p.partner)'>
                      </q-avatar>
                      {{getPNick(p.partner)}}
                    </q-btn>
                  </template>
                  <template v-else>
                    <q-btn>
                      <q-icon
                        square
                        left
                        size="24px"
                        color="orange"
                        name='person_add'
                      />
                      Join...
                    </q-btn>
                  </template>
                </div>
              </q-item-section>
            </q-item>
          </q-card-section>
          <q-card-section class="justify-start">
          </q-card-section>
          <q-separator
            color="orange"
            inset
          />
          <q-card-actions
            align="right"
            v-if='t.state===0'
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
              @click='onJoin(t)'
            >Join</q-btn>
          </q-card-actions>
        </q-card>
      </q-expansion-item>
      <q-separator />
    </q-list>
  </div>
</template>

<script>
import moment from 'moment'
import { mapState, mapGetters } from 'vuex'
import { jbBoardMix } from '../jb'
import { tourneys$ } from 'src/api'

export default {
  name: 'myTourney',
  props: ['myPlayer'],

  data () {
    return {
      componentKey: 0,
      newT2: false,
      t2: {
        name: 'Welcome to my Tourney...',
        td: this.myPlayer.nick,
        time: 30,
        mix: jbBoardMix(),
        bn: 2,
        br: 6,
        state: 0,
        pairs: []
      },
      bt: [
        { label: 'MP', value: 'MP', color: 'blue' },
        { label: 'IMP', value: 'IMP', color: 'green' },
        { label: 'XIMP', value: 'XIMP', color: 'red' }
      ],
      myCC: 'SAYC',
      myPd: null
    }
  },
  computed: {
    ...mapState('jstore', ['tourneys']),
    ...mapGetters('jstore', ['getPlayerById']),
    myTourneys () {
      console.log(this.tourneys)
      return this.tourneys
    }
  },
  methods: {
    getPlayer: function (pId) {
      return this.getPlayerById(pId)
    },
    getPNick (p) {
      const player = this.getPlayer(p)
      if (player) return player.nick
      else return '[JOIN]'
    },
    getPAvatar (p) {
      const player = this.getPlayer(p)
      if (player) return player.profile.avatar
      else return null
    },
    getPFlag (p) {
      const player = this.getPlayer(p)
      if (player) {
        const flag = player.profile.flag.toLowerCase()
        return `img:statics/flags/4x3/${flag}.svg`
      } else return null
    },
    onJoin (t) {
      const pairs = t.pairs.slice(0)
      const myPair = {
        player: this.myPlayer.id,
        partner: this.myPd,
        cc: this.myCC
      }
      pairs.push(myPair)
      tourneys$.patch(t._id, { pairs })
      this.$forceUpdate()
    },
    onState (t, s) {
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
      this.$forceUpdate()
    },
    getTourney (t) {
      let tinfo = `${t.td}: ${t.Name}`
      tinfo += `: ${t.bn} x ${t.br}`
      return tinfo
    },
    startAt (startAt) {
      return moment(startAt).format('MMM Do, hh:mm:ss')
      // return moment(startAt).toNow()
    },
    forceRerender () {
      this.componentKey += 1
    }
  },
  watch: {
    newT2 (t2) {
      console.log(t2)
    }
  }
}
</script>

<style scoped>
.q-btn {
  /*max-width: 125px;*/
  /* height: 32px; */
  text-overflow: ellipsis;
  text-transform: none;
}
.pair {
  border: 1px solid yellowgreen;
}
</style>
