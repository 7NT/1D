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
            dense
            push
            glassy
            ripple
            no-caps
            no-wrap
            @click="sit(n)"
            :label="myNick(n)"
            :icon="mySeatIcon(n)"
            :color="mySeatColor(n)"
            class='player'
          />
        </q-btn-group>
        <q-btn
          dense
          flat
          @click="sit(9)"
          round
          :icon="mySeatIcon(9)"
        />
        <q-btn
          v-if='isAdmin && myTable.id'
          dense
          round
          color='warning'
          icon="remove_circle_outline"
          @click="onTable()"
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
import { jbSeatIcon, jbIsAdmin } from 'src/jbPlayer'

export default {
  name: 'myT1List',
  props: ['myTable'],

  data () {
    return {}
  },
  computed: {
    ...mapGetters('jstore', ['jsPlayer', 'jsPlayerByNick']),

    isAdmin () {
      return jbIsAdmin(this.jsPlayer)
    },
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
      if (nick) return nick
      else return 'SIT...'
    },
    mySeatIcon (sId) {
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
        action: 'join',
        tId: this.myTable.id,
        sId
      }
      this.$emit('onPlayer', seat)
    },
    onTable () {
      this.$q.dialog({
        title: 'Confirm',
        message: 'Would you like to CLOSE this Table?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        // console.log('>>>> OK')
        this.onSit(-9)
      }).onOk(() => {
        // console.log('>>>> second OK catcher')
      }).onCancel(() => {
        // console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }
  },
  watch: {},
  mounted () { }
}
</script>

<style scoped>
.player {
  min-width: 85px;
  height: 32px;
  text-overflow: ellipsis;
  text-transform: none;
}
</style>
