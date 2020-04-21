<template>
  <div class="boardBox full-width">
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
      :label="bdata"
    >
      <template v-slot:append>
        <q-icon name="img:statics/jbicon/svg/mix.svg" color="orange" />
      </template>
    </q-select>
    <q-list dense bordered class="rounded-borders">
      <q-item dense class="boardItem">
        <q-item-section>
          <q-item-label caption>System:</q-item-label>
        </q-item-section>
        <q-item-section side top>
          <div class="q-pa-xs q-gutter-xs no-wrap">
            <q-btn dense size="xs" icon="img:statics/jbicon/seats/seat13.svg">
              <q-badge class='cc' color="orange" text-color="black" align='top' :label="cc[0]" />
              <q-menu dense auto-close>
                <q-list dense>
                  <template v-if='isMyCC===0'>
                    <q-item clickable v-for="c in CCs" :key="c" @click="onCC(0,c)">
                      <q-item-section>{{c}}</q-item-section>
                    </q-item>
                    <q-separator />
                  </template>
                  <q-item clickable @click="onCCView(0)">
                    <q-item-section>view...</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <q-btn dense size="xs" icon="img:statics/jbicon/seats/seat24.svg">
              <q-badge class='cc' color="orange" text-color="black" align='top' :label="cc[1]" />
              <q-menu dense auto-close>
                <q-list dense>
                  <template v-if='isMyCC===1'>
                    <q-item clickable v-for="c in CCs" :key="c" @click="onCC(1,c)">
                      <q-item-section>{{c}}</q-item-section>
                    </q-item>
                    <q-separator />
                  </template>
                  <q-item clickable @click="onCCView(1)">
                    <q-item-section>view...</q-item-section>
                  </q-item>

                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </q-item-section>
      </q-item>

      <q-item dense class="boardItem">
        <q-item-section>
          <q-item-label caption>Tricks:</q-item-label>
        </q-item-section>
        <q-item-section>
          <div class="text-orange">
            <q-badge color="info" text-color="black" :label="tricks(0)" />
            <q-badge color="info" text-color="black" :label="tricks(1)" />
          </div>
        </q-item-section>
      </q-item>
      <q-item dense class="boardItem">
        <q-item-section>
          <q-item-label caption>Score:</q-item-label>
        </q-item-section>
        <q-item-section>
          <div class="text-orange">
            <q-badge color="info" text-color="black" :label="score(0)" />
            <q-badge color="info" text-color="black" :label="score(1)" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import EssentialLink from 'components/EssentialLink'
import { mapGetters } from 'vuex'
import jb from 'src/jb'

export default {
  name: 'myBoard',
  props: ['myTable', 'mySid'],

  components: {
    EssentialLink
  },
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
      ],
      CCs: ['SAYC', '2over1', 'Prec', 'my CC...']
      // cc: ['SAYC', 'SAYC']
    }
  },
  computed: {
    ...mapGetters('jstore', ['myPlayer']),
    bdata: function () {
      try {
        if (this.myTable.board) { return this.myTable.board.bt + ': ' + this.myTable.board.bn }
      } catch (err) {}
      return 'Board'
    },
    cc: function () {
      return this.myTable.cc || ['SAYC', 'SAYC']
    },
    isMyCC: function () {
      if (jb.isPlayer(this.mySid)) {
        return (this.mySid - 1) % 2
      }
      return null
    }
  },
  methods: {
    onBT (bt) {
      let message
      if (this.isPlayer) {
        this.$emit('onTable', { action: 'bt', bt })
        message = `Board will switch to ${bt} next`
        // say.speak(message)
      } else {
        message = 'You do not have permission to switch board'
      }
      this.$q.notify({ type: 'positive', message })
    },
    onCC (n, c) {
      if (this.isMyCC === n) {
        const _cc = this.cc.slice(0)
        _cc.splice(n, 1, c)
        this.$emit('onTable', { action: 'cc', cc: _cc })
        return
      }
      const message = 'You do not have permission to change this CC card'
      this.$q.notify({ type: 'positive', message })
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
    // console.log(this.myTable)
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
.cc {
  text-transform: none;
}
</style>
