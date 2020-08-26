<template>
  <div class='boardBox'>
    <div class='full-width'>
      <q-slide-item @left='setBT'>
        <template v-slot:left>
          <q-btn-toggle
            v-model='bT'
            dense
            push
            glossy
            toggle-color='primary'
            :options='[
              {label: "MP", value: "MP"},
              {label: "IMP", value: "IMP"},
              {label: "XIMP", value: "XIMP"},
            ]'
          />
        </template>

        <q-item>
          <q-item-section avatar>
            <q-icon name='drag_indicator' />
          </q-item-section>
          <q-item-section>
            <q-item-label overline>{{bdataT}}</q-item-label>
            <q-item-label caption>{{bdataN}}</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-icon name='img:jbIcon/svg/mix.svg' />
          </q-item-section>
        </q-item>
      </q-slide-item>
      <q-slide-item @left='setCC'>
        <template v-slot:left>
          <q-btn-dropdown color='info' label='Set CC...'>
            <q-list dense>
              <q-item
                dense
                clickable
                v-close-popup
                v-for='c in ccLinks'
                :key='c.title'
                @click='onCC(c)'
              >
                <q-item-section>
                  <q-item-label>{{c.title}}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </template>
        <q-item dense class='row boardItem'>
          <q-item-section class='col-2'>
            <q-item-label>CC:</q-item-label>
          </q-item-section>
          <q-item-section side class='col-10'>
            <div class='row no-wrap full-width'>
              <div class='col-6'>
                <q-btn dense size='xs' :icon='mySeatIcon(13)' @click='onCCView(0)'>
                  <q-badge
                    class='cc'
                    color='orange'
                    text-color='black'
                    align='top'
                    :label='cc[0].title'
                  />
                </q-btn>
              </div>
              <div class='col-6'>
                <q-btn dense size='xs' :icon='mySeatIcon(24)' @click='onCCView(1)'>
                  <q-badge
                    class='cc'
                    color='orange'
                    text-color='black'
                    align='top'
                    :label='cc[1].title'
                  />
                </q-btn>
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-slide-item>
      <q-list dense bordered class='rounded-borders'>
        <q-slide-item @right='onScore'>
          <q-item>
            <q-item-section top class='col-4'>
              <q-item-label class='q-mt-sm'>{{bT}}/#:</q-item-label>
            </q-item-section>
            <q-item-section side class='col-10'>
              <div class='row q-pa-xs q-gutter-xs no-wrap text-orange full-width'>
                <div class='col-4'>
                  <q-badge color='info' text-color='black' :label='score(0)' />
                </div>
                <div class='col-4'>
                  <q-badge color='info' text-color='black' :label='score(1)' />
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
// import EssentialLink from 'components/EssentialLink.vue'
import { openURL } from 'quasar'
import { jbSeatIcon, jbIsPlayer } from 'src/jbPlayer'

const CCLinks = [
  {
    title: 'SAYC',
    // caption: 'Modern Standard American',
    // icon: 'bookmark_border',
    link: 'https://bridgewinners.com/convention-card/print/modern-standard-american-2/4563'
  },
  {
    title: 'Prec',
    // caption: 'Basic Precision',
    // icon: 'bookmark_border',
    link: 'https://bridgewinners.com/convention-card/print/basic-precision-template/3'
  },
  {
    title: '2 over 1 Basic',
    // caption: 'Basic',
    // icon: 'bookmark_border',
    link: 'https://bridgewinners.com/convention-card/print/basic-21-card-276/4565'
  },
  {
    title: '2 over 1',
    // caption: 'Bridge Winners Standard',
    // icon: 'bookmark_border',
    link: 'https://bridgewinners.com/convention-card/print/bridge-winners-standard/4568'
  },
  {
    title: 'LC Standard',
    // caption: 'Larry Cohen & Simon Simple',
    // icon: 'bookmark_border',
    link: 'https://bridgewinners.com/convention-card/print/lc-standard-3/5454'
  }
]
export default {
  name: 'myBoard',
  props: ['jsTable', 'mySeat'],

  // components: { EssentialLink },
  data () {
    return {
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
      // CCs: ['SAYC', '2over1', 'Prec', 'my CC...'],
      myScores: [0, 0],
      myBoards: [0, 0],
      ccLinks: CCLinks
    }
  },
  computed: {
    ...mapGetters('jstore', ['jsResultById']),

    bT: {
      get: function () {
        return this.jsTable.bT
      },
      set: function (value) {
        this.onBT(value)
      }
    },
    bdataT: function () {
      try {
        if (this.jsTable.board) {
          return this.jsTable.board.bT
        }
      } catch (err) { }
      return 'Board'
    },
    bdataN: function () {
      try {
        if (this.jsTable.board) {
          return this.jsTable.board.bId + '#' + this.jsTable.board.bN
        }
      } catch (err) { }
      return null
    },
    cc: function () {
      return this.jsTable.cc || [this.ccLink[0], this.ccLink[0]]
    },
    isMyCC: function () {
      if (jbIsPlayer(this.mySeat.sId)) {
        return (this.mySeat.sId - 1) % 2
      }
      return null
    },
    state () {
      return this.jsTable.state
    }
  },
  methods: {
    mySeatIcon (sId) {
      return jbSeatIcon(sId)
    },
    setBT ({ reset }) {
      this.finalize(reset)
    },
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
    setCC ({ reset }) {
      this.finalize(reset)
    },
    onCC (c) {
      if (this.isMyCC !== null) {
        const _cc = [...this.cc] // .slice(0)
        _cc.splice(this.isMyCC, 1, { title: c.title, link: c.link })
        this.$emit('onTable', { action: 'cc', cc: _cc })
      } else {
        const message = 'You do not have permission to change this CC card'
        this.$q.notify({ type: 'positive', message })
      }
    },
    onCCView (n) {
      const url = this.cc[n].link
      openURL(url)
    },
    score (n) {
      return this.myScores[n] + '/' + this.myBoards[n]
    },
    onScore () {
      this.$q.notify({
        message: 'Score reset?',
        color: 'primary',
        actions: [
          { label: 'Reset', color: 'amber', handler: () => { this.scoreReset() } },
          { label: 'Dismiss', color: 'white', handler: () => { /* ... */ } }
        ]
      })
    },
    scoreReset () {
      switch (this.bT) {
        case 'MP':
          this.$data.myScores = [50, 50]
          break
        default:
          this.$data.myScores = [0, 0]
      }
      this.$data.myBoards = [0, 0]
    },
    finalize (reset) {
      this.timer = setTimeout(() => {
        reset()
      }, 5000)
    }
  },
  watch: {
    bT (bt) {
      if (!this.jsTable.t2) {
        this.scoreReset()
        this.onBT(bt)
      }
    },
    state (s) {
      if (s === 3) {
        const r = this.jsResultById(this.jsTable.id)
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
    this.bT = this.jsTable.bT
    if (this.jsTable.t2) {
      let s0 = 0
      if (this.jsTable.bT === 'MP') s0 = 50
      const s1 = this.jsTable.t2.p1.score || s0
      const s2 = this.jsTable.t2.p2.score || s0
      const b1 = this.jsTable.t2.p1.boards || 0
      const b2 = this.jsTable.t2.p2.boards || 0
      this.myScores = [s1, s2]
      this.myBoards = [b1, b2]
    }
  },
  beforeDestroy () {
    clearTimeout(this.timer)
  }
}
</script>

<style scoped>
.boardBox {
  max-width: 230px;
  max-height: 130px;
  margin: 1px;
  background: bisque;
}
.boardItem {
  height: 26px;
}
.cc {
  text-transform: none;
}
</style>
