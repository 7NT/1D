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
            @click='onSubmit()'
          >Submit</q-btn>
        </q-card-actions>
      </q-card>
    </q-expansion-item>
    <q-list
      bordered
      separator
    >
      <q-expansion-item
        group="tourney"
        header-class="bg-teal text-white"
        expand-icon-class="text-white"
        v-for="t in myTourneys"
        :key="t.id"
        :caption="`start in: ${t.time} minutes`"
      >
        <template v-slot:header>
          <q-item-section avatar>
            <q-avatar
              icon="event"
              color="primary"
              text-color="white"
            />
          </q-item-section>

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
        </template>
        <q-card>
          <q-card-section></q-card-section>
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
        br: 6
      },
      bt: [
        { label: 'MP', value: 'MP', color: 'blue' },
        { label: 'IMP', value: 'IMP', color: 'green' },
        { label: 'XIMP', value: 'XIMP', color: 'red' }
      ]
    }
  },
  computed: {
    ...mapState('jstore', ['tourneys']),
    myTourneys () {
      console.log('t2', this.tourneys)
      return this.tourneys
    }
  },
  methods: {
    onSubmit () {
      this.$emit('onTourney', this.t2)
      this.newTx = false
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
