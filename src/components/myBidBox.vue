<template>
  <div class='no-margin no-padding full-width'>
    <q-table
      dense
      square
      hide-bottom
      separator='cell'
      :data='myBidData'
      :columns='columns'
      row-key='row'
    >
      <q-tr slot='header' slot-scope='props' :props='props'>
        <q-th :class='getVColor(col.seat)' v-for='col in props.cols' :key='col.seat'>
          <!--{{ props.cols[col.seat - 1].field }}-->
          {{ col.field }}
          <q-tooltip>{{ col.label }}</q-tooltip>
        </q-th>
      </q-tr>
      <template v-slot:body-cell='props'>
        <q-td :props='props' :class='getBColor(props.value)'>
          {{ getBid(props.value) }}
          <q-tooltip>{{ getAlert(props.value) }}</q-tooltip>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'
import { jbSeatX } from 'src/jbSeat'
import { jbIsMyPd } from 'src/jbPlayer'

export default {
  name: 'myBidBox',
  props: ['jsPlayer', 'jsTable'],
  data: () => ({
    seats: ['N', 'E', 'S', 'W'],
    bData: []
  }),
  computed: {
    // ...mapGetters('jstore', ['jsPlayerByNick']),

    mySeatX () {
      let x = Math.abs(this.jsPlayer.seat.sId)
      if (x < 1 || x > 4) x = 3
      return x
    },
    myBids () {
      return this.jsTable.bids
    },
    columns () {
      const cols = []
      let i
      for (i of [0, 1, 2, 3]) {
        const x = this.seatX(i)
        const c = this.seats[x - 1]
        const p = this.getNick(x)
        cols.push({ seat: i + 1, label: p, field: c, align: 'center' })
      }
      return cols
    },
    myVul () {
      const s1 = this.mySeatX % 2
      switch (this.jsTable.board.bV) {
        case 0:
          return 'vul0'
        case 3:
          return 'vul3'
        case 1:
          return s1 === 1 ? 'vul1' : 'vul2'
        case 2:
          return s1 === 0 ? 'vul2' : 'vul1'
        default:
          return ''
      }
    },
    myBidData () {
      const data = []
      try {
        let row = 1
        let rBid = { N: null, E: null, S: null, W: null }
        this.myBids.data.forEach(bid => {
          const bdata = { sId: bid.sId, bid: bid.bid, alert: bid.alert || null }
          switch (bid.sId) {
            case 1: {
              rBid.N = bdata
              break
            }
            case 2: {
              rBid.E = bdata
              break
            }
            case 3: {
              rBid.S = bdata
              break
            }
            case 4: {
              rBid.W = bdata
              break
            }
            default:
          }
          if (bid.sId === this.mySeatX) {
            rBid.row = row
            data.push(rBid)
            rBid = { N: null, E: null, S: null, W: null }
            row++
          }
        })
        if (rBid) {
          rBid.row = row
          data.push(rBid)
        }
      } catch (err) { }
      return data
    }
  },
  methods: {
    seatX (s) {
      return ((this.mySeatX + s) % 4) + 1
    },
    getNick (s) {
      const nick = this.jsTable.seats[s - 1]
      // const p = this.getPlayer(pId)
      if (nick) return nick
      else return this.seats[s - 1]
    },
    getBid (b) {
      try {
        return b.bid
      } catch (err) { }
      return b
    },
    getAlert (a) {
      try {
        if (jbIsMyPd(a.sId, this.jsPlayer.seat.sId)) return null
        if (a.alert) return a.alert
      } catch (err) { }
      return null
    },
    getVColor (s) {
      if (this.myBids) {
        const x = jbSeatX(s, this.mySeatX) % 2
        switch (this.jsTable.board.bV) {
          case 0:
            return 'bg-info'
          case 3:
            return 'bg-negative'
          case 1: {
            if (x === 0) return 'bg-negative'
            else return 'bg-info'
          }
          case 2: {
            if (x === 0) return 'bg-info'
            else return 'bg-negative'
          }
          default:
            return null
        }
      }
    },
    getBColor (bdata) {
      let c
      if (!bdata) c = 'bg-grey'
      else if (bdata.bid === '?') c = 'bg-warning'
      else if (bdata.bid.endsWith('♦') || bdata.bid.endsWith('♥')) c = 'col-3 red'
      else c = 'col-3'

      if (this.getAlert(bdata)) c += ' vul3'

      return c
    }
  },
  watch: {},
  mounted () { }
}
</script>

<style scoped>
.vul0 {
  border: 1px solid silver;
}
.vul1 {
  border-top: 1px solid red;
  border-bottom: 1px solid red;
  border-left: 1px solid silver;
  border-right: 1px solid silver;
}
.vul2 {
  border-top: 1px solid silver;
  border-bottom: 1px solid silver;
  border-left: 1px solid red;
  border-right: 1px solid red;
}
.vul3 {
  border: 1px solid red;
}
table thead {
  font-size: medium;
}
table tbody {
  font-size: xx-small;
  background-color: white;
}
table td {
  text-align: center;
  font-size: 18px;
}
.red {
  color: red;
}
</style>
