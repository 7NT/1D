<template padding>
  <div class="boardBox">
    <div class="full-width">
      <q-select
        color="grey-3"
        dense
        square
        outlined
        label-color="orange"
        v-model="mix"
        :options="options_mix"
        options-dense
        options-dark
        behavior="menu"
        menu-shrink
        :label="bdata"
      >
        <template v-slot:append>
          <q-icon
            name="img:statics/jbicon/svg/mix.svg"
            color="orange"
          />
        </template>
      </q-select>
      <q-list
        dense
        bordered
        separator
        class="rounded-borders"
      >
        <q-item
          dense
          class="row boardItem"
        >
          <q-item-section class="col-2 gt-sm">
            <q-item-label class="q-mt-sm">System:</q-item-label>
          </q-item-section>
          <q-item-section
            side
            class="col-10 gt-sm"
          >
            <div class="row q-pa-xs q-gutter-xs no-wrap full-width">
              <div class="col-6">
                <q-btn
                  dense
                  size="xs"
                  icon="img:statics/jbicon/seats/seat13.svg"
                >
                  <q-badge
                    class="cc"
                    color="orange"
                    text-color="black"
                    align="top"
                    :label="cc[0]"
                  />
                  <q-menu
                    dense
                    auto-close
                  >
                    <q-list dense>
                      <template v-if="isMyCC===0">
                        <q-item
                          clickable
                          v-for="c in CCs"
                          :key="c"
                          @click="onCC(0,c)"
                        >
                          <q-item-section>{{c}}</q-item-section>
                        </q-item>
                        <q-separator />
                      </template>
                      <q-item
                        clickable
                        @click="onCCView(0)"
                      >
                        <q-item-section>view...</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
              <div class="col-6">
                <q-btn
                  dense
                  size="xs"
                  icon="img:statics/jbicon/seats/seat24.svg"
                >
                  <q-badge
                    class="cc"
                    color="orange"
                    text-color="black"
                    align="top"
                    :label="cc[1]"
                  />
                  <q-menu
                    dense
                    auto-close
                  >
                    <q-list dense>
                      <template v-if="isMyCC===1">
                        <q-item
                          clickable
                          v-for="c in CCs"
                          :key="c"
                          @click="onCC(1,c)"
                        >
                          <q-item-section>{{c}}</q-item-section>
                        </q-item>
                        <q-separator />
                      </template>
                      <q-item
                        clickable
                        @click="onCCView(1)"
                      >
                        <q-item-section>view...</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </q-item-section>
        </q-item>

      <q-slide-item @left="onScoreReset" @right="onScoreReset">
        <template v-slot:left>
          <q-icon name="done" />Score Reset?
        </template>
        <template v-slot:right>
          <q-icon name="alarm" />Score Reset
        </template>

        <q-item>
          <q-item-section
            top
            class="col-4 gt-sm"
          >
            <q-item-label class="q-mt-sm">{{mix}}/Boards:</q-item-label>
          </q-item-section>
          <q-item-section
            side
            class="col-10 gt-sm"
          >
            <div class="row q-pa-xs q-gutter-xs no-wrap text-orange full-width">
              <div class="col-4">
                <q-badge
                  color="info"
                  text-color="black"
                  :label="score(0)"
                />
              </div>
              <div class="col-4">
                <q-badge
                  color="info"
                  text-color="black"
                  :label="score(1)"
                />
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-slide-item>
      </q-list>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { openURL } from 'quasar'
import { jbIsPlayer } from 'src/jbPlayer'

export default {
  name: 'myBoard',
  props: ['jsTable', 'mySeat'],

  data () {
    return {
      mix: null,
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
      CCs: ['SAYC', '2over1', 'Prec', 'my CC...'],
      myScores: [0, 0],
      myBoards: [0, 0]
    }
  },
  computed: {
    ...mapGetters('jstore', ['jsResultById']),
    bdata: function () {
      try {
        if (this.jsTable.board) {
          return this.jsTable.board.bT + ': ' + this.jsTable.board.bN
        }
      } catch (err) { }
      return 'Board'
    },
    cc: function () {
      return this.jsTable.cc || ['SAYC', 'SAYC']
    },
    isMyCC: function () {
      if (jbIsPlayer(this.mySeat.sId)) {
        return (this.mySeat.sId - 1) % 2
      }
      return null
    },
    state () {
      return this.jsTable.state
    },
    myTid () {
      return this.jsTable.id
    }
  },
  methods: {
    onBT (bT) {
      let message
      if (jbIsPlayer(this.mySeat.sId)) {
        this.$emit('onTable', { action: 'bT', bT })
        message = `Board will switch to ${bT} next`
        // say.speak(message)
      } else {
        message = 'You do not have permission to switch board'
      }
      this.$q.notify({ type: 'positive', message })
    },
    onCC (n, c) {
      if (this.isMyCC === n) {
        const _cc = [...this.cc] // .slice(0)
        _cc.splice(n, 1, c)
        this.$emit('onTable', { action: 'cc', cc: _cc })
        return
      }
      const message = 'You do not have permission to change this CC card'
      this.$q.notify({ type: 'positive', message })
    },
    onCCView (n) {
      const cc = this.cc[n]
      openURL(`http://localhost:8080/statics/cc/${cc}.pdf`)
    },
    score (n) {
      return this.myScores[n] + '/' + this.myBoards[n]
    },
    scoreReset () {
      switch (this.mix) {
        case 'MP':
          this.$data.myScores = [50, 50]
          break
        default:
          this.$data.myScores = [0, 0]
      }
      this.$data.myBoards = [0, 0]
    },
    onScoreReset ({ reset }) {
      // this.scoreReset()
      this.finalize(reset)
    },

    finalize (reset) {
      this.timer = setTimeout(() => {
        reset()
      }, 1000)
    }
  },
  watch: {
    mix (bT) {
      this.scoreReset()
      this.onBT(bT)
    },
    myTid (n, o) {
      if (o) {
        const r = this.jsResultById(o)
        if (r) {
          for (let i = 0; i < 2; i++) {
            let mix = r.mix
            if (i === 1) {
              if (r.info.bT === 'MP') mix = 100 - mix
              else mix = -mix
            }
            const scoreSum = this.$data.myScores[i] * this.$data.myBoards[i] + mix
            this.$data.myBoards[i]++
            this.$data.myScores[i] = scoreSum / this.$data.myBoards[i]
          }
        }
      }
    }
  },
  mounted () {
    this.mix = this.jsTable.bT
    if (this.jsTable.t2) {
      this.myScores = this.jsTable.t2.scores
      this.myBoards = this.jsTable.t2.boards
    }
  }
}
</script>

<style scoped>
.boardBox {
  max-width: 240px;
  height: 120px;
  margin: 4px;
  background: bisque;
}
.boardItem {
  height: 26px;
}
.cc {
  text-transform: none;
}
</style>
