<template>
  <div
    class='boardBox'
    v-if='myTable.board'
  >
    <q-list
      padding
      dense
      bordered
      class="rounded-borders"
    >
      <q-select
        color="grey-3"
        dense
        square
        outlined
        label-color="orange"
        v-model="model_mix"
        :options="options_mix"
        options-dense
        options-dark
        menu-shrink
        :label='bdata'
      >
        <template v-slot:append>
          <q-icon
            name="games"
            color="orange"
          />
        </template>
      </q-select>
      <q-item dense>
        <q-item-section>
          <q-item-label overline>CC:</q-item-label>
        </q-item-section>
        <q-item-section
          side
          top
        >
          <div class="text-orange">
            <q-btn-group
              glossy
              outline
              dense
            >
              <q-btn
                size="xs"
                label="SAYC"
                icon="timeline"
              />
              <q-btn
                size="xs"
                label="Prec"
                icon-right="visibility"
              />
            </q-btn-group>
          </div>
        </q-item-section>
      </q-item>
      <q-item dense>
        <q-item-section>
          <q-item-label overline>Score:</q-item-label>
        </q-item-section>
        <q-item-section
          side
          top
        >
          <div class="text-orange">
            <q-badge
              color="info"
              text-color="black"
              label=''
            />
            <q-badge
              color="info"
              text-color="black"
              label=''
            />
          </div>
        </q-item-section>
      </q-item>
      <q-item dense>
        <q-item-section>
          <q-item-label overline>Tricks:</q-item-label>
        </q-item-section>
        <q-item-section
          side
          top
        >
          <div class="text-orange">
            <q-badge
              color="info"
              text-color="black"
              :label='tricks(0)'
            />
            <q-badge
              color="info"
              text-color="black"
              :label='tricks(1)'
            />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'myBoard',
  // props: ['myTable'],
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
    ...mapGetters('jstore', ['myPlayer', 'myTable']),
    bdata: function () {
      try {
        if (this.myTable.board) return this.myTable.board.bt + ': ' + this.myTable.board.bn
      } catch (err) { }
      return 'Board'
    }
  },
  methods: {
    onBT (bt) {
      this.$emit('onBT', bt)
    },
    tricks (n) {
      try {
        if (this.myTable.plays) {
          if (n === 0) return this.myTable.plays.info.NS
          else if (n === 1) return this.myTable.plays.info.EW
        }
      } catch (err) {
        // console.log(err)
      }
      return null
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
    console.log(this.myTable)
    this.model_mix = this.myTable.bt
  }
}
</script>

<style scoped>
.boardBox {
  width: 160px;
  height: 120px;
}
</style>
