<template>
  <div class="q-pa-md">
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title>Tourney List:</q-toolbar-title>
      <q-btn
        icon="add"
        @click="newTx=!newTx"
      />
    </q-toolbar>
    <q-expansion-item
      group="tourney"
      icon="event"
      header-class="bg-teal text-white"
      expand-icon-class="text-white"
      v-show="newTx"
      :label="`Tourney Director: @${t2.td}`"
      default-opened
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
            @click='onT2Submit(t2, 0)'
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
        group="tourney"
        header-class="bg-teal text-white"
        expand-icon-class="text-white"
        v-for="t in myTourneys"
        :key="t.id"
        :caption="`start in: ${t.time} minutes`"
      >
        <template v-slot:header>
          <q-item-section>
            <q-item-label overline>
              @{{t.td}}: {{t.name}}
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
                  @click="onJoin"
                  icon="hourglass_empty"
                  label="Close"
                />
                <q-fab-action
                  square
                  label-position="right"
                  color="positive"
                  @click="onJoin"
                  icon="hourglass_full"
                  label="Start"
                />
                <q-fab-action
                  square
                  label-position="right"
                  color="warning"
                  @click="onJoin"
                  icon="alarm_on"
                  label="Ready..."
                />
              </q-fab>
            </q-item-section>
          </q-item-section>
        </template>
        <q-card>
          <q-card-section>
            <q-time
              v-for="p in t.pairs"
              :key="p.id"
            >
              <q-item-section
                avatar
                top
              >
                <q-badge
                  color="orange"
                  text-color="black"
                  label="t.id"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{p.player}}</q-item-label>
                <q-item-label>{{p.partner}}</q-item-label>
              </q-item-section>
              <q-item-section
                side
                top
              >
                <q-item-label caption>p.cc</q-item-label>
              </q-item-section>
            </q-time>
          </q-card-section>
          <q-card-section class="justify-start">
          </q-card-section>
          <q-separator
            color="orange"
            inset
          />
          <q-card-actions align="right">
            <q-btn-toggle
              v-model="myCC"
              push
              glossy
              toggle-color="primary"
              :options="[
                {label: 'SAYC', value: 'SAYC'},
                {label: '2/1', value: '2/1'},
                {label: 'Precision', value: 'Precision'},
                {label: 'My CC...', value: 'My CC'}
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
              @click='onT2Submit(t,-1)'
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
import { mapState } from 'vuex'
import { jbBoardMix } from '../jb'
import { tourneys$ } from 'src/api'

export default {
  name: 'myTourney',
  props: ['myPlayer'],

  data () {
    return {
      newTx: false,
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
    myTourneys () {
      return this.tourneys
    }
  },
  methods: {
    onT2Submit (t, state) {
      console.log('t', t)
      switch (state) {
        case -1:
          tourneys$.remove(t._id)
          break
        case 0:
          tourneys$.create(t)
          break
        default:
      }
      this.newTx = false
    },
    onJoin (ev) {
      console.log('onJoin', ev)
    },
    getTourney (t) {
      let tinfo = `${t.td}: ${t.Name}`
      tinfo += `: ${t.bn} x ${t.br}`
      return tinfo
    },
    startAt (startAt) {
      return moment(startAt).format('MMM Do, hh:mm:ss')
    }
  },
  watch: {
    newTx (t) { }
  }
}
</script>
