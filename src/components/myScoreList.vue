<template>
  <div>
    <q-table
      dense
      square
      hide-bottom
      separator="cell"
      :data="myScoreData"
      :columns="columns"
      :visible-columns="myColumns"
      row-key="row"
    >
    </q-table>
  </div>
</template>

<script>
import { results$ } from 'src/api'

export default {
  name: 'myScoreList',
  props: ['tId', 'bId'],

  data: () => ({
    seatName: ['N', 'E', 'S', 'W'],
    // columns: ['NS Score', 'Contract', 'By', 'Result', 'EW Score'],
    columns: [ // array of Objects
      // column Object definition
      {
        // unique id
        // identifies column
        // (used by pagination.sortBy, "body-cell-[name]" slot, ...)
        name: 'tId',

        // label for header
        label: 'tId',

        // row Object property to determine value for this column
        field: 'tId',
        // OR field: row => row.some.nested.prop,

        // (optional) if we use visible-columns, this col will always be visible
        required: false
      },
      { name: 'ns', label: 'NS', field: 'ns' },
      { name: 'contract', label: 'Contract', field: 'contract', sortable: true },
      { name: 'by', label: 'By', field: 'by', sortable: true },
      { name: 'result', label: 'Result', field: 'result' },
      { name: 'ew', label: 'EW', field: 'ew' }
    ],
    myColumns: ['ns', 'contract', 'by', ' result', 'ew'],
    myScoreData: []
  }),
  mounted () {
    if (this.bId) {
      results$.find({ query: { bId: this.bId } })
        .then(response => {
          console.log('r', response)
          response.data.forEach(d => {
            let result
            if (d.result === 0) result = '='
            else if (d.result > 0) result = '+' + d.result
            else result = d.result

            let by
            if (d.info.by === 0) by = 'pass all'
            else if (d.info.by % 2) by = this.seatName[d.info.by - 1] + ': ' + d.score
            else by = this.seatName[d.info.by - 1] + ': ' + (-d.score)

            const contract = d.info.contract + ' ' + result
            const ew = d.info.bT === 'MP' ? 100 - d.mix : -d.mix
            const scoreData = {
              ns: d.mix,
              contract,
              by,
              result,
              ew
            }
            console.log('d', scoreData)
            this.myScoreData.push(scoreData)
          })
        })
    }
  }
}
</script>
