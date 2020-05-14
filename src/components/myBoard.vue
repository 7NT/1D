<template padding>
  <div class="boardBox">
    <div class=" full-width">
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

        <q-item
          dense
          class="row boardItem"
        >
          <q-item-section
            top
            class="col-2 gt-sm"
          >
            <q-item-label class="q-mt-sm">{{mix}}:</q-item-label>
          </q-item-section>
          <q-item-section
            side
            class="col-10 gt-sm"
          >
            <div class="row q-pa-xs q-gutter-xs no-wrap text-orange full-width">
              <div class='col-6'>
                <q-badge
                  color="info"
                  text-color="black"
                  :label="score(0)"
                />
              </div>
              <div class='col-6'>
                <q-badge
                  color="info"
                  text-color="black"
                  :label="score(1)"
                />
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script>
import { openURL } from 'quasar'
import { jbIsPlayer } from 'src/jbPlayer'

export default {
  name: 'myBoard',
  props: ['myTable', 'mySeat'],

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
      CCs: ['SAYC', '2over1', 'Prec', 'my CC...']
      // cc: ['SAYC', 'SAYC']
    }
  },
  computed: {
    // ...mapGetters('jstore', ['myPlayer']),
    bdata: function () {
      try {
        if (this.myTable.board) {
          return this.myTable.board.bT + ': ' + this.myTable.board.bN
        }
      } catch (err) { }
      return 'Board'
    },
    cc: function () {
      return this.myTable.cc || ['SAYC', 'SAYC']
    },
    isMyCC: function () {
      if (jbIsPlayer(this.mySeat.sId)) {
        return (this.mySeat.sId - 1) % 2
      }
      return null
    }
  },
  methods: {
    onBT (bT) {
      let message
      // console.log('bT', this.mySeat)
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
      try {
        if (this.myTable.result) {
          return this.myTable.result.scores[n]
        }
      } catch (err) {
        // console.log(err)
      }
      return null
    }
  },
  watch: {
    mix (bT) {
      this.onBT(bT)
    }
  },
  mounted () {
    this.mix = this.myTable.bT
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
