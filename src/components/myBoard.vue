<template>
  <q-list padding bordered class="rounded-borders">
    <q-select
      color="grey-3"
      dense
      outlined
      label-color="orange"
      v-model="model_mix"
      :options="options_mix"
      options-dark
      options-dense
      menu-shrink
      label="Board"
    >
      <template v-slot:append>
        <q-icon name="games" color="orange" />
      </template>
    </q-select>
    <q-item dense>
      <q-item-section>
        <q-item-label overline>CC:</q-item-label>
      </q-item-section>
      <q-item-section side top>
        <div class="text-orange">
          <q-btn-group glossy outline dense>
            <q-btn size="xs" label="SAYC" icon="timeline" />
            <q-btn size="xs" label="Prec" icon-right="visibility" />
          </q-btn-group>
        </div>
      </q-item-section>
    </q-item>
    <q-item dense>
      <q-item-section>
        <q-item-label overline>Score:</q-item-label>
      </q-item-section>
      <q-item-section side top>
        <div class="text-orange">
          <q-badge color="info" text-color="black" label="" />
          <q-badge color="info" text-color="black" label="" />
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
export default {
  name: 'myBoard',
  props: ['myTable'],
  data () {
    return {
      boardInfo: {
        bt: '',
        bn: 0,
        cc: null,
        play: null
      },
      model_mix: null,
      options_mix: ['MP', 'IMP', 'XIMP'],
      boardData: [
        { name: 'System:', ns: 'NS: ...', ew: 'EW: ...' },
        { name: 'Trick:', ns: '0', ew: '0' },
        { name: 'Score:', ns: '', ew: '' }
      ],
      columns: [
        { name: 'name', label: '', field: 'name' },
        { name: 'ns', label: '', field: 'ns' },
        { name: 'ew', label: '', field: 'ew' }
      ]
    }
  },
  computed: {
    bi: function () {
      try {
        return this.boardInfo.board.bt + ': ' + this.boardInfo.board.bn
      } catch (err) {}
      return this.model_mix
    }
  },
  methods: {
    onBT (bt) {
      this.$emit('onBT', bt)
    }
  },
  watch: {
    model_mix (n) {
      this.$q.notify({
        color: 'positive',
        message: `Board will be switched to ${this.model_mix} next`
      })
    }
  },
  mounted () {
    // console.log('mounted', this.model_mix)
    const n = Date.now() % 3
    this.model_mix = this.options_mix[n]
  }
}
</script>

<style>
</style>
