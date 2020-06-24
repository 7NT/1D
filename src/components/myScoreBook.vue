<template>
  <q-list
    separator
    bordered
    dense
  >
    <q-item>
      <q-item-section>
        <q-item-label
          header
          class="text-grey-8"
        >My ScoreBook:</q-item-label>
      </q-item-section>

      <q-item-section
          side
          top
        >
          <q-btn
          flat
          round
          @click="scoreReset()"
        >
          <q-icon name="clear" />
          <q-tooltip
            anchor="bottom middle"
            self="top middle"
            :offset="[0, 20]"
          >Clear</q-tooltip>
        </q-btn>
        </q-item-section>
    </q-item>
    <q-separator />

    <q-expansion-item
      v-for="r in jsResults"
      :key="r._id"
      >
        <template v-slot:header>
          <q-item-section>
            {{ getBoardInfo(r) }}
          </q-item-section>

          <q-item-section>
            {{ getContractInfo(r) }}
            <q-badge
              outline
              :color="getScore(r) >= 0 ? 'positive' : 'negative'"
              :label="getScore(r)"
            />
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption>{{playedDate(r.played)}}</q-item-label>
          </q-item-section>
        </template>
        <q-card>
          <q-card-section>
            <myScoreList :tId='r.tId' :bId='r.bId' />
          </q-card-section>
        </q-card>
    </q-expansion-item>
  </q-list>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import * as moment from 'moment'
import myScoreList from 'src/components/myScoreList'

export default {
  name: 'myScoreBook',
  components: { myScoreList },

  data: () => ({
    seatName: ['North', 'East', 'South', 'West']
  }),
  computed: {
    ...mapState('jstore', ['jsResults']),
    ...mapGetters('jstore', ['jsPlayerById'])
  },
  methods: {
    ...mapActions('jstore', ['resetResults']),

    scoreReset () {
      this.resetResults()
    },
    getResult (r) {
      if (r.result === 0) return '='
      else if (r.result > 0) return `+${r.result}`
      else return `${r.result}`
    },
    getBoardInfo (r) {
      return r.info.bT + '#' + r.info.bN + ': ' + this.getPNick(r)
    },
    getContractInfo (r) {
      return r.info.contract + ' ' + this.getResult(r) + ': ' + this.getRScore(r)
    },
    getRScore (r) {
      switch (r.info.by) {
        case 1:
        case 3:
          return r.score
        case 2:
        case 4:
          return -r.score
        default: return 0
      }
    },
    getScore (r) {
      const bT = r.info.bT
      switch (bT) {
        case 'MP':
          return `${bT}: NS: ${r.mix}% : EW: ${100 - r.mix}%`
        default:
          return `${bT}: NS: ${r.mix} : EW: ${-r.mix}`
      }
    },
    getPNick (r) {
      if (r.info.by < 1) return ''
      const pId = r.players[r.info.by - 1]
      let pname = this.seatName[r.info.by - 1]
      if (pId) {
        const p = this.jsPlayerById(pId)
        if (p) pname = p.nick
      }
      return `by ${pname}`
    },
    playedDate (playedAt) {
      return moment(playedAt).fromNow()
    }
  }
}
</script>
