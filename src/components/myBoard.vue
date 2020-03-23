<template>
  <q-card>
    <q-table
      dense
      hide-bottom
      separator='cell'
      :data='boardData'
      :columns='columns'
      row-key='name'
      color='primary'>
      <q-tr slot='header'>
        <td colspan='100%'>
          <q-btn align='left' size='sm' :label='bi' color='info' icon='menu' class='full-width'>
            <q-popover>
              <div class='column group'>
                <q-radio v-model='mix' val='MP' label='MP' v-close-overlay @input="onBT('MP')" />
                <q-radio v-model='mix' val='IMP' label='IMP' v-close-overlay @input="onBT('IMP')" />
                <q-radio v-model='mix' val='XIMP' label='XIMP' v-close-overlay @input="onBT('XIMP')" />
              </div>
            </q-popover>
          </q-btn>
        </td>
      </q-tr>
      <q-td slot='body-cell-name' slot-scope='props' :props='props'>
        <q-chip small square dense pointing='right' color='info'>{{ props.value }}</q-chip>
      </q-td>
    </q-table>
  </q-card>
</template>

<script>
export default {
  name: 'myBoard',
  props: ['boardInfo'],
  data () {
    return {
      mix: null,
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
      return ''
    }
  },
  methods: {
    onBT (bt) {
      this.$emit('onBT', bt)
    }
  },
  created () {}
}
</script>

<style>
</style>
