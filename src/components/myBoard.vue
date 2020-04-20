<template>
  <div class='boardBox full-width'>
    <q-list
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
        behavior="menu"
        menu-shrink
        :label='bdata'
      >
        <template v-slot:append>
          <q-icon
            name="img:statics/jbicon/svg/mix.svg"
            color="orange"
          />
        </template>
      </q-select>
      <q-item
        dense
        class='boardItem'
      >
        <q-item-section>
          <q-item-label caption>System:</q-item-label>
        </q-item-section>
        <q-item-section
          side
          top
        >
          <div class="q-pa-xs q-gutter-xs">
            <q-btn
              size='xs'
              icon="img:statics/jbicon/seats/seat13.svg"
            >
              <q-badge
                color="orange"
                align="top"
              >SAYC</q-badge>
            </q-btn>
            <q-btn
              size='xs'
              icon="img:statics/jbicon/seats/seat24.svg"
            >
              <q-badge
                color="orange"
                align="top"
              >Prec</q-badge>
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
      <q-item
        dense
        class='boardItem'
      >
        <q-item-section>
          <q-item-label caption>Tricks:</q-item-label>
        </q-item-section>
        <q-item-section>
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
      <q-item
        dense
        class='boardItem'
      >
        <q-item-section>
          <q-item-label caption>Score:</q-item-label>
        </q-item-section>
        <q-item-section>
          <div class="text-orange">
            <q-badge
              color="info"
              text-color="black"
              :label='score(0)'
            />
            <q-badge
              color="info"
              text-color="black"
              :label='score(1)'
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
  props: ['myTable'],
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
    ...mapGetters('jstore', ['myPlayer']),
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
    },
    score (n) {
      try {
        if (this.myTable.plays) {
          if (n === 0) return this.myTable.plays.info.ScoreNS
          else if (n === 1) return this.myTable.plays.info.ScoreEW
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
.boardItem {
  height: 30px;
}
</style>
