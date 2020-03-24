<template>
  <q-list
    padding
    bordered
    class='rounded-borders'
  >
    <q-select
      color='grey-3'
      dense
      outlined
      label-color='orange'
      v-model='model_mix'
      :options='options_mix'
      options-dark
      options-dense
      menu-shrink
      label='Board'
    >
      <template v-slot:append>
        <q-icon
          name='games'
          color='orange'
        />
      </template>
    </q-select>
  </q-list>
</template>

<script>
export default {
  name: 'myBoard',
  props: ['boardInfo'],
  data () {
    return {
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
      } catch (err) { }
      return ''
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
  created () { }
}
</script>

<style>
</style>
