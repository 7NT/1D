<template>
  <div class="q-pa-md">
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-toolbar-title>Tourney List:</q-toolbar-title>
      <q-btn icon="add" @click="newTx=!newTx" />
    </q-toolbar>
    <q-list bordered separator>
      <q-expansion-item
        group="tourney"
        icon="event"
        header-class="bg-teal text-white"
        expand-icon-class="text-white"
        v-show="newTx"
        :label="`Tourney Director: @${t2.TD}`"
        default-opened
      >
        <q-separator />
        <q-item>
          <q-item-label overline>
            <div class="q-ma-md row">
              <q-badge color="secondary">Start in: {{ t2.time }} minutes</q-badge>
              <q-slider v-model="t2.time" color="red" :min="10" :max="30" :step="10" />
            </div>
          </q-item-label>
          <q-separator />
          <q-item-section>
            <div class="column">
              <q-input standout="bg-teal text-white" v-model="t2.Name" label="Tourney Name" />
              <q-space>
                <q-separator />
              </q-space>
              <div class="row">
                <q-slider
                  dense
                  v-model="t2.bn"
                  :min="1"
                  :max="4"
                  :step="1"
                  markers
                  snap
                  label
                label-always
                  :label-value='`boards/round: ${t2.bn}`'
                  color="blue"
                  class='col-5'
                />
                <q-space class='col-2'>
                  <q-separator vertical />
                </q-space>
                <q-slider
                  dense
                  v-model="t2.br"
                  :min="4"
                  :max="10"
                  :step="1"
                  markers
                  snap
                  label
                  :label-value='`rounds: ${t2.br}`'
                  color="green"
                  class='col-5'
                />
              </div>
            </div>
          </q-item-section>
          <q-item-section side top>
            <div class="q-pa-md bg-info">
              <q-option-group dense :options="bt" label="Board" type="radio" v-model="t2.mix" />
            </div>
          </q-item-section>
        </q-item>
      </q-expansion-item>
      <q-expansion-item
        group="tourney"
        icon="event"
        header-class="bg-teal text-white"
        expand-icon-class="text-white"
        v-for="t in myTourneys"
        :key="t.id"
        :label="t.name"
      >
        <q-card>
          <q-card-section></q-card-section>
        </q-card>
      </q-expansion-item>
      <q-separator />
    </q-list>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { jbBoardMix } from '../jb'

export default {
  name: 'myTourney',
  props: ['myPlayer'],

  data () {
    return {
      newTx: null,
      t2: {
        Name: 'Welcome to my Tourney...',
        TD: this.myPlayer.nick,
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
      return this.tourneys
    }
  },
  watch: {
    newTx (t) {
      console.log(t)
    }
  }
}
</script>
