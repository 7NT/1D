<template>
  <q-list
    separator
    bordered
    dense
  >
    <q-item-label
      header
      class="text-grey-8"
    >My ScoreBook:</q-item-label>
    <q-separator />
    <q-item
      v-for="r in results"
      :key="r._id"
    >
      <q-item-section>
        <q-item-label overline>{{r.info.bT}}#{{r.info.bN}}: {{getPNick(r)}}</q-item-label>
        <q-item-label>
          {{r.info.contract}}{{getResult(r)}}
          <q-badge
            outline
            :color="getScore(r) >= 0 ? 'positive' : 'negative'"
            :label="getScore(r)"
          />
        </q-item-label>
      </q-item-section>

      <q-item-section
        side
        top
      >
        <q-item-label caption>{{playedDate(r.playedAt)}}</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import * as moment from 'moment'

export default {
  name: 'myScoreBook',
  data () {
    return {
      seatName: ['North', 'East', 'South', 'West']
    }
  },
  computed: {
    ...mapState('jstore', ['results']),
    ...mapGetters('jstore', ['getPlayerById'])
  },
  methods: {
    getResult (r) {
      if (r.result === 0) return '='
      else if (r.result > 0) return `+${r.result}`
      else return `${r.result}`
    },
    getScore (r) {
      if (r.info.by < 1) return 0
      else {
        const by = (r.info.by - 1) % 2 === 0
        const bT = r.info.bT
        switch (bT) {
          case 'MP':
            return by ? `${r.mix}%` : `${100 - r.mix}%`
          default:
            return by ? r.mix : -r.mix
        }
      }
    },
    getPNick (r) {
      if (r.info.by < 1) return ''
      const pId = r.players[r.info.by - 1]
      let pname = this.seatName[r.info.by - 1]
      if (pId) {
        const p = this.getPlayerById(pId)
        if (p) pname = p.nick
      }
      return `by ${pname}`
    },
    playedDate (playedAt) {
      return moment(playedAt)
        .startOf('hour')
        .fromNow()
    }
  }
}
</script>
