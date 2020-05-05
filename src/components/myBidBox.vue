<template>
  <div>
    <!--:class='`bidbox ${myVul}`'>-->
    <div class='q-ma-sm'>
      <q-table
        dense
        square
        hide-bottom
        separator="cell"
        :data="bData"
        :columns="columns"
        row-key="row"
      >
        <q-tr
          slot="header"
          slot-scope="props"
          :props="props"
        >
          <q-th
            :class="vul_bgcolor(col.seat)"
            v-for="col in props.cols"
            :key="col.seat"
          >
            {{ props.cols[col.seat - 1].label }}
            <q-tooltip>{{ playerName(col.seat) }}</q-tooltip>
          </q-th>
        </q-tr>
        <template v-slot:body-cell="props">
          <q-td
            :props="props"
            :class="bid_class(props.value)"
          >
            {{ getBid(props.value) }}
            <q-tooltip>{{ getAlert(props.value) }}</q-tooltip>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import jb from 'src/jb'

export default {
  name: 'myBidBox',
  props: ['myPlayer', 'myTable'],
  data: () => ({
    seats: ['N', 'E', 'S', 'W'],
    bData: []
  }),
  computed: {
    ...mapGetters('jstore', ['getPlayerById']),
    mySeatX () {
      let x = Math.abs(this.myPlayer.seat.sId)
      if (x < 1 || x > 4) x = 3
      return x
    },
    myBids () {
      // console.log(this.myTable)
      return this.myTable.bids
    },
    columns () {
      const cols = []
      let i
      for (i of [0, 1, 2, 3]) {
        const x = this.seatX(i) - 1
        const c = this.seats[x]
        cols.push({ seat: i + 1, label: c, field: c, align: 'center' })
      }
      return cols
    },
    myVul () {
      const s1 = this.mySeatX % 2
      switch (this.myTable.board.vulN) {
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
    }
  },
  methods: {
    seatX (s) {
      return ((this.mySeatX + s) % 4) + 1
    },
    playerName (s) {
      const pId = this.myTable.seats[s - 1]
      const p = this.getPlayerById(pId)
      if (p) return p.nick
      else return this.seats[s - 1]
    },
    getBid (b) {
      try {
        return b.bid
      } catch (err) {}
      return b
    },
    getAlert (a) {
      try {
        if (a.alert) return a.alert
      } catch (err) {}
      return this.getBid(a)
    },
    vul_bgcolor (s) {
      if (this.myBids) {
        const x = jb.seatX(s, this.mySeatX) % 2
        switch (this.myTable.board.vulN) {
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
    bid_class (bdata) {
      if (!bdata) return 'bg-grey'
      else if (bdata.bid === '?') return 'bg-warning'
      else {
        if (bdata.alert) return 'col-3 vul3'
        else return 'col-3'
      }
    },
    loadBids () {
      if (!this.myBids) return
      // let turn = 0
      const data = []
      const _bid = this.myBids
      try {
        let row = 1
        let rBid = { N: null, E: null, S: null, W: null }
        _bid.data.forEach(bid => {
          const bdata = { bid: bid.bid, alert: bid.alert || null }
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
          // if (bid.bid === '?') turn = bid.sId
        })
        if (rBid) {
          rBid.row = row
          data.push(rBid)
        }
        this.$data.bData = data
      } catch (err) {
        // console.log(err)
      }
      // console.log('loadbids', this.$data.bData)
      // if (turn) this.$emit('onAction', { action: 'bid', turn, bid: _bid })
    }
  },
  watch: {
    myTable: function (t) {
      this.loadBids()
    },
    myPlayer () {
      this.loadBids()
    },
    myBid () {
      this.loadBids()
    }
  },
  mounted () {
    this.loadBids()
  }
}
</script>

<style scoped>
.bidbox {
  min-width: 160px;
  min-height: 160px;
}
.vul0 {
  border: 2px solid silver;
}
.vul1 {
  border-top: 2px solid red;
  border-bottom: 2px solid red;
  border-left: 2px solid silver;
  border-right: 2px solid silver;
}
.vul2 {
  border-top: 2px solid silver;
  border-bottom: 2px solid silver;
  border-left: 2px solid red;
  border-right: 2px solid red;
}
.vul3 {
  border: 2px solid red;
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
}
</style>
