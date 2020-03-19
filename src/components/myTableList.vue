<template>
  <q-item
    dense
    clickable
  >
    <q-item-section>
      <q-item-label
        overline
        class='bg-warning'
      >
        {{ myTable.name }}: {{ myTable.info || state }}
      </q-item-label>
      <q-item-label>
        <q-btn-group
          push
          v-for='n in 4'
          :key='n'
        >
          <q-btn
            push
            glassy
            ripple
            no-caps
            no-wrap
            @click='sit(n)'
            :label='nickName(n)'
            icon='event_seat'
            :color='scolor(n)'
            style='width:100px'
          >
            <q-tooltip>{{ sname[n-1] }}</q-tooltip>
          </q-btn>
          <!--
          <q-separator
            vertical
            inset
          />
          -->
        </q-btn-group>
        <q-btn
          flat
          @click='sit(9)'
          round
          dense
          icon='person_pin'
        />
      </q-item-label>
    </q-item-section>

    <q-item-section
      side
      top
    >
      <q-badge
        color='info'
        :label='myTable.players'
      />
    </q-item-section>
  </q-item>
</template>

<script>
// import { userService } from 'src/api'
import { mapGetters } from 'vuex'

export default {
  name: 'myTableList',
  props: ['myTable'],

  data () {
    return {
      sname: ['North', 'East', 'South', 'West'],
      pname: [null, null, null, null]
    }
  },
  computed: {
    ...mapGetters('jstore', ['getPlayerById']),
    state: function () {
      if (this.myTable.name === '#Lobby') return 'Welcome'
      else {
        switch (this.myTable.state) {
          case 0:
            return 'Ready'
          case 1:
            return 'Bidding'
          case 2:
            return 'Playing'
          case -1:
            return 'Reviewing'
          default:
            return 'Waiting'
        }
      }
    }
  },
  methods: {
    // ...mapActions('jstore', ['addUser']),
    nickName (n) {
      const _uId = this.myTable.seats[n - 1]
      if (!_uId) {
        return 'SIT...'
      } else {
        const p = this.getPlayerById(_uId)
        return p ? p.nick || p._id : 'SIT...'
      }
    },
    scolor (n) {
      const _uId = this.myTable.seats[n - 1]
      return _uId ? 'info' : 'positive'
    },
    sit (sId) {
      if (!this.myTable.seats[sId - 1]) {
        this.$emit('onSit', { tId: this.myTable.id, sId })
      } else {
        this.$q.notify({ type: 'negative', message: 'This seat is taken' })
      }
    }
  },
  watch: {
    myTable (n, o) {
      console.log('t', n)
    }
  },
  mounted () {
    console.log('t', this.myTable)
  }
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
