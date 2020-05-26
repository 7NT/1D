<template>
  <div>
    <q-expansion-item
      dense
      expand-separator
      icon="event"
      header-class="bg-info text-white"
      expand-icon-class="text-white"
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
                <q-slider dense v-model="t2.minutes2" color="red" :min="10" :max="30" :step="10" />
              </div>
            </div>
          </q-item-label>
          <q-separator>
            <q-space />
          </q-separator>
          <q-item>
            <q-item-section side>
              <q-btn-toggle
                v-model="t2.bT"
                push
                glossy
                toggle-color="primary"
                :options="[
                {label: 'MP', value: 'MP'},
                {label: 'IMP', value: 'IMP'},
                {label: 'XIMP', value: 'XIMP'},
              ]"
              />
              <q-space />
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
                <q-separator>
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
            <q-item-section side top />
          </q-item>
        </q-card-section>
        <q-separator dark />
        <q-card-actions align="right">
          <q-btn
            push
            disable='isTD'
            @click="onState(t2, 0)"
          >
            Submit
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script>
import { jbMix } from 'src/jbBoard'

export default {
  name: 'myT2Setup',
  props: ['myPlayer'],
  data () {
    return {
      t2: {
        name: 'Welcome to my Tourney...',
        td: this.myPlayer.nick,
        minutes2: 30,
        bT: jbMix(),
        bN: 2,
        bR: 6,
        state: 0,
        pairs: []
      }
    }
  },
  methods: {
    isTD () {
      if (this.t2.td.nick === this.myPlayer.nick) return true
      else return this.isOnline(this.t2.td)
    },
    isOnline (p) {
      try {
        const player = this.getPlayerByNick(p.nick)
        return player.state >= 0
      } catch (err) {}
      return false
    },
    onState (t, s) {
      t.state = s
      this.$emit('onState', t)
    }
  }
}
</script>
