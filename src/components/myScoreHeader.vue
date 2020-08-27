<template>
  <div v-if='result'>
    <q-card>
      <q-item-section>
        <q-item-label overline>{{ getBoardInfo }}</q-item-label>
        <q-item-label caption>
          {{ getContractInfo }}
          <q-badge
            outline
            color='secondary'
            :text-color='getRScore >= 0 ? "positive" : "negative"'
            :label='getScore'
          />
        </q-item-label>
      </q-item-section>

      <q-item-section side top>
        <q-item-label caption>{{ playedDate }}</q-item-label>
      </q-item-section>
    </q-card>
  </div>
</template>

<script>
import * as moment from 'moment'

export default {
  name: 'myScoreHeader',
  props: ['result'],
  data () {
    return {
      seatName: ['North', 'East', 'South', 'West']
    }
  },
  computed: {
    getBoardInfo () {
      return this.result.info.id + '#' + this.result.info.bN
    },
    getContractInfo () {
      let c = this.result.info.contract + ' by ' + this.getBy(this.result.info.by)
      c += ' :' + this.getResult + ': ' + this.getRScore
      return c
    },
    getResult () {
      if (this.result.result === 0) return '='
      else if (this.result.result > 0) return `+${this.result.result}`
      else return `${this.result.result}`
    },
    getRScore () {
      switch (this.result.info.by) {
        case 1:
        case 3:
          return 'NS: ' + this.result.score
        case 2:
        case 4:
          return 'EW: ' + (-this.result.score)
        default: return 0
      }
    },
    getScore () {
      const bT = this.result.info.bT
      const score = bT + ':: NS: '
      switch (bT) {
        case 'MP':
          return score + this.result.mix + '% :: EW: ' + (100 - this.result.mix) + '%'
        default:
          return score + this.result.mix + ' :: EW: ' + (-this.result.mix)
      }
    },
    playedDate () {
      return moment(this.result.playedAt).fromNow()
    }
  },
  methods: {
    getBy (by) {
      switch (by) {
        case 1:
        case 2:
        case 3:
        case 4:
          return this.seatName[by]
        default:
          return 'pass all'
      }
    },
    getBy2 (by) {
      switch (by) {
        case 1:
        case 3:
          return 'NS'
        case 2:
        case 4:
          return 'EW'
        default:
          return 'pass all'
      }
    }
  },
  mounted () {
    // console.log(this.result)
  }
}
</script>
