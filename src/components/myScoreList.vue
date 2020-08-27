<template>
  <div>
    <q-table
      dense
      square
      separator='cell'
      :data='myScoreData'
      :columns='columns'
      :visible-columns='myColumns'
      row-key='id'
    >
      <template v-slot:body-cell='props'>
        <q-td :props='props' :class='props.row.myClass'>
          {{ props.value }}
          <q-tooltip>{{ props }}</q-tooltip>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import { results$ } from 'src/api'

export default {
  name: 'myScoreList',
  props: ['result'],

  data: () => ({
    seatName: ['N', 'E', 'S', 'W'],
    // columns: ['NS Score', 'Contract', 'By', 'Result', 'EW Score'],
    columns: [ // array of Objects
      // column Object definition
      {
        // unique id
        // identifies column
        // (used by pagination.sortBy, "body-cell-[name]" slot, ...)
        name: 'id',

        // label for header
        label: 'id',

        // row Object property to determine value for this column
        field: 'id',
        // OR field: row => row.some.nested.prop,

        // (optional) if we use visible-columns, this col will always be visible
        required: false
      },
      { name: 'ns', label: 'NS', field: 'ns' },
      { name: 'contract', label: 'Contract', field: 'contract', sortable: true },
      { name: 'by', label: 'By', field: 'by', sortable: false },
      { name: 'lead', label: 'lead', field: 'lead', sortable: false },
      { name: 'result', label: 'Result', field: 'result' },
      { name: 'ew', label: 'EW', field: 'ew' }
    ],
    myColumns: ['ns', 'contract', 'by', 'played', 'ew'],
    myScoreData: []
  }),
  computed: {
    scoreFormat () {
      return this.result.info.bT === 'MP' ? '%' : ''
    },
    ewFormat () {
      return this.result.info.bT === 'MP' ? 100 : 0
    }
  },
  mounted () {
    if (this.result) {
      results$.find({
        query:
        {
          $select: ['info.contract', 'info.by', 'result', 'score', 'mix', 'tId'],
          'info.id': this.result.info.id,
          'info.bN': this.result.info.bN,
          'info.bT': this.result.info.bT,
          $sort: { mix: -1 }
        }
      })
        .then(response => {
          const scores = []
          response.data.forEach(function (d) {
            var i = scores.findIndex(x => ((x.info.contract === d.info.contract) && (x.info.by === d.info.by) && (x.result === d.result)))
            if (i <= -1) {
              scores.push(d)
            }
          })
          // console.log('r', response.data, scores)

          scores.forEach(d => {
            let r
            if (d.result === 0) r = '='
            else if (d.result > 0) r = '+' + d.result
            else r = d.result

            let by
            if (d.info.by === 0) by = 'pass all'
            else if (d.info.by % 2) by = this.seatName[d.info.by - 1] + ': ' + d.score
            else by = this.seatName[d.info.by - 1] + ': ' + (-d.score)

            const contract = d.info.contract + ' ' + r
            const lead = d.lead
            const ew = this.ewFormat - d.mix
            const myClass = (d.tId === this.result.tId) ? 'myScore' : 'scoreClass'
            const scoreData = {
              id: d._id,
              ns: d.mix,
              contract,
              by,
              lead,
              ew,
              myClass
            }
            // console.log('d', d, scoreData)
            this.myScoreData.push(scoreData)
          })
        })
    }
  }
}
</script>

<style scoped>
.scoreClass {
  color: black;
}
.myScore {
  color: blue;
}
</style>
