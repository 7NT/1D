<template>
  <q-item
    dense
    clickable
  >
    <q-item-section>
      <q-item-label
        overline
        class="bg-warning"
      >{{ myT1Info }}</q-item-label>
      <q-item-label>
        <q-btn-group
          push
          v-for="n in 4"
          :key="n"
        >
          <q-btn
            push
            glassy
            ripple
            no-caps
            no-wrap
            @click="sit(n)"
            :label="myNick(n)"
            :icon="mySeatIcon(n)"
            :color="mySeatColor(n)"
            style="width:100px"
          />
        </q-btn-group>
        <q-btn
          flat
          @click="sit(9)"
          round
          dense
          icon="remove_red_eye"
        />
      </q-item-label>
    </q-item-section>

    <q-item-section
      side
      top
    >
      <q-badge
        color="info"
        :label="myTable.players"
      />
    </q-item-section>
  </q-item>
</template>

<script>
import { mapGetters } from 'vuex'
import { jbT2State } from 'src/jbState'
import { jbSeatIcon } from 'src/jbPlayer'

export default {
  name: 'myT1List',
  props: ['myTable'],

  data () {
    return {}
  },
  computed: {
    ...mapGetters('jstore', ['jsPlayer', 'jsPlayerByNick']),

    state () {
      if (this.myTable.name === '#Lobby') return 'Welcome'
      else return jbT2State(this.myTable.state)
    },
    myT1Info () {
      return `${this.myTable.name}: ${this.state}`
    }
  },
  methods: {
    seatNick (sId) {
      switch (sId) {
        case 1:
        case 2:
        case 3:
        case 4:
          return this.myTable.seats[sId - 1]
        default:
          return null
      }
    },
    myNick (sId) {
      const nick = this.seatNick(sId)
      if (nick) {
        /*
        if (nick === this.jsPlayer.nick) {
          if (this.myTable.id !== this.jsPlayer.seat.tId || sId !== this.jsPlayer.seat.sId) this.onSit(sId)
        }
        */
        return nick
      } else return 'SIT...'
    },
    mySeatIcon (sId) {
      // return `img:statics/jbicon/seats/seat${sId}.svg`
      return jbSeatIcon(sId)
    },
    mySeatColor (sId) {
      const pId = this.seatNick(sId)
      return pId ? 'info' : 'positive'
    },
    sit (sId) {
      const nick = this.seatNick(sId)
      if (!nick) {
        this.onSit(sId)
      } else {
        this.$q.notify({ type: 'negative', message: 'This seat is taken' })
      }
    },
    onSit (sId) {
      const seat = {
        tId: this.myTable.id,
        sId
      }
      console.log('onSit', seat)
      this.$emit('onPlayer', seat)
    }
  },
  watch: {},
  mounted () { }
}
</script>

<style scoped>
.q-btn {
  min-width: 75px;
  height: 32px;
  text-overflow: ellipsis;
  text-transform: none;
}
</style>
