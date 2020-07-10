<template>
  <q-list
    separator
    bordered
    dense
  >
    <q-item>
      <q-item-section>
        <q-btn-toggle
          v-model="model"
          push
          no-caps
          glossy
          toggle-color="primary"
          :options="[
            {label: 'ScoreBook', value: 0},
            {label: 'Tourney Points', value: 1}
          ]"
        />
      </q-item-section>
    </q-item>
    <q-separator />
    <template v-if="model===0">
      <q-expansion-item
        v-for="r in jsResults"
        :key="r._id"
        >
          <template v-slot:header>
            <q-item-section>
            <q-item-label overline>{{ getBoardInfo(r) }}</q-item-label>
              <q-item-label caption>
                {{ getContractInfo(r) }}
                <q-badge
                outline
                color='secondary'
                :text-color="getRScore(r) >= 0 ? 'positive' : 'negative'"
                :label="getScore(r)"
                />
              </q-item-label>
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
    </template>
    <template v-else-if="model===1">

    </template>
  </q-list>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import * as moment from 'moment'
import myScoreList from 'src/components/myScoreList'

export default {
  name: 'myScoreBook',
  components: { myScoreList },

  data: () => ({
    model: 0,
    seatName: ['North', 'East', 'South', 'West']
  }),
  computed: {
    ...mapState('jstore', ['jsResults'])
  },
  methods: {
    ...mapActions('jstore', ['resetResults']),

    scoreBookClose () {
      // this.resetResults()
      // this.$emit('onDrawer', 'scoreBook')
    },
    getResult (r) {
      if (r.result === 0) return '='
      else if (r.result > 0) return `+${r.result}`
      else return `${r.result}`
    },
    getBoardInfo (r) {
      return r.info.bT + '#' + r.info.bN // + ': ' + this.getPNick(r)
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
      const score = bT + ': '
      const ns = 'NS: ' + r.mix
      const ew = 'EW: ' + r.mix
      switch (bT) {
        case 'MP':
          return score + ns + '% :: ' + ew + '%'
        default:
          return score + ns + ' :: ' + ew
      }
    },
    getPNick (r) {
      if (r.info.by < 1) return ''
      const nick = r.players[r.info.by - 1]
      if (nick) return 'by ' + nick
      else return 'by ' + this.seatName[r.info.by - 1]
    },
    playedDate (playedAt) {
      return moment(playedAt).fromNow()
    }
  }
}
</script>
