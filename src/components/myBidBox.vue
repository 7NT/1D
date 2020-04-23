<template>
  <q-table
    dense
    bordered
    square
    hide-bottom
    separator='cell'
    :data='bData'
    :columns='columns'
    row-key='row'
    class='bbox'
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
    <template v-slot:body-cell='props'>
      <q-td
        :props='props'
        :class='turn_bgcolor(props)'
      >
        {{props.value}}
      </q-td>
    </template>
  </q-table>
</template>

<script>
import { mapGetters } from 'vuex'
// import jb from 'src/jb'

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
      return this.myTable.bids
    },
    columns: function () {
      const cols = []
      let i
      for (i of [0, 1, 2, 3]) {
        const x = this.seatX(i) - 1
        const c = this.seats[x]
        cols.push({ seat: i + 1, label: c, field: c, align: 'center' })
      }
      return cols
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
    vul_bgcolor (s) {
      if (this.myBids) {
        switch (this.myTable.board.vulN) {
          case 0:
            return 'bg-info'
          case 3:
            return 'bg-negative'
          case 1: {
            if (s % 2 === 1) return 'bg-negative'
            else return 'bg-info'
          }
          case 2: {
            if (s % 2 === 1) return 'bg-info'
            else return 'bg-negative'
          }
          default:
            return null
        }
      }
    },
    turn_bgcolor (props) {
      if (!props.value) return 'bg-grey'
      else if (props.value === '?') return 'bg-warning'
      else return 'col-3'
    },
    loadBids () {
      // console.log('loadbids', this.myBids)
      if (!this.myBids) return
      // let turn = 0
      const data = []
      const _bid = this.myBids
      try {
        let row = 1
        let rBid = { N: null, E: null, S: null, W: null }
        _bid.data.forEach(bid => {
          switch (bid.sId) {
            case 1: {
              rBid.N = bid.bid
              break
            }
            case 2: {
              rBid.E = bid.bid
              break
            }
            case 3: {
              rBid.S = bid.bid
              break
            }
            case 4: {
              rBid.W = bid.bid
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
        console.log(err)
      }
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

<style>
.bbox {
  min-width: 160px;
  min-height: 160px;
  /*border: 1px solid silver;*/
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
