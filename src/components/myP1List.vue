<template>
  <div>
    <q-toolbar class="bg-primary text-white rounded-borders">
      <q-btn
        round
        dense
        flat
        icon="group"
        class="q-mr-xs"
      />

      <q-space />

      <q-input
        dark
        dense
        standout
        v-model="player"
        input-class="text-right"
        class="q-ml-md"
      >
        <template v-slot:append>
          <q-icon
            v-if="!player"
            name="search"
          />
          <q-icon
            v-else
            name="clear"
            class="cursor-pointer"
            @click="player_search = null"
          />
        </template>
      </q-input>
    </q-toolbar>

    <q-list bordered>
      <q-item-label header>{{jbT1.name}} Players:</q-item-label>
      <q-separator />
      <q-expansion-item
        dense
        dense-toggle
        expand-separator
        v-for="p in myPlayers"
        :key="p.id"
        group='players'
        @input='read(p)'
      >
        <template v-slot:header>
          <q-item-section side>
            <div class="row items-center">
              <q-icon
                :name="`img:statics/jbicon/seats/seat${p.seat.sId}.svg`"
                size="24px"
              />
              <q-avatar size="24px">
                <img :src="p.profile.avatar" />
              </q-avatar>
            </div>
          </q-item-section>

          <q-item-section>
            <div>
              <template v-if="p.status==2">
                <span style="color:red;">@</span>
              </template>
              <template v-else-if="p.status==1">
                <span style="color:purple;">♥</span>
              </template>
              <template v-else-if="isFriend(p.nick)">
                <q-icon name='mdi-account-heart' />
              </template>
              {{p.nick}}
              <q-badge
                color="orange"
                align='top'
                transparent
                v-if='newMessage(p)'
              >
                ∞
              </q-badge>
            </div>
          </q-item-section>

          <q-item-section
            avatar
            side
          >
            <q-icon
              dense
              :name="getFlag(p)"
              class="q-ml-md"
              size="sm"
            />
          </q-item-section>
        </template>
        <q-card>
          <q-card-actions v-if='p.id !== myUser._id'>
            <q-btn
              dense
              flat
              size="sm"
              icon='mdi-account-heart'
              @click='setFriend(p.nick)'
            >Friend</q-btn>
            <q-btn
              dense
              flat
              size="sm"
              icon='mdi-account-supervisor'
            >Watch</q-btn>
            <q-btn
              dense
              flat
              size="sm"
              icon='mdi-account-multiple-plus'
            >Join</q-btn>
          </q-card-actions>
          <q-separator dark />
          <q-card-section>
            <myMessages :sendTo='`@${p.id}`' />
          </q-card-section>
          <q-card-section>
            <div
              class="full-width"
              style="height:24px"
            >
              <myChat :sendTo='`@${p.id}`' />
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script>
// import { LocalStorage } from 'quasar'
import { mapState, mapGetters, mapActions } from 'vuex'
import myMessages from 'src/components/myMessages'
import myChat from 'src/components/myChat'

export default {
  name: 'myP1List',

  components: {
    // EssentialLink,
    myMessages,
    myChat
  },
  data () {
    return {
      player: null,
      friends: [],
      room: '#Lobby'
    }
  },
  computed: {
    ...mapState('jstore', ['myUser', 'players', 'jbT0', 'jbT1']),
    ...mapGetters('jstore', ['getPlayerById', 'getTableById']),
    myPlayers () {
      let players = this.players
      if (this.jbT1.id !== '#Lobby') players = players.filter(p => p.seat.tId === this.jbT1.id)
      return players
    }
  },
  methods: {
    ...mapActions('jstore', ['setT04']),
    getTName (p) {
      const t = this.getTableById(p.seat.tId)
      if (t) return t.name
      else return '#Lobby'
    },
    getPName (r) {
      if (r.info.by < 1) return ''
      const pId = r.players[r.info.by - 1]
      let pname = this.seatName[r.info.by - 1]
      if (pId) {
        const p = this.getPlayerById(pId)
        if (p) pname = p.nick
      }
      return `by ${pname}`
    },
    getFlag (p) {
      if (p) {
        const flag2 = p.profile.flag.toLowerCase()
        return `img:statics/flags/4x3/${flag2}.svg`
      }
      return null
    },
    isFriend (p) {
      return this.friends.indexOf(p) >= 0
    },
    setFriend (p) {
      if (this.isFriend(p)) {
        this.friends = this.friends.filter(n => n !== p)
        this.$q.notify(p + ' is removed from your friend list')
      } else {
        this.friends.push(p)
        this.$q.notify(p + ' has been added into your friend list')
      }
    },
    newMessage (p) {
      const i = this.jbT0.findIndex(p0 => p0 === p.id)
      return i >= 0
    },
    read (p) {
      this.setT04({ id: 0, t0: p.id })
    }
  },
  created () {
    try {
      this.friends = this.$q.localStorage.getItem('friends') || []
    } catch (err) {
      this.friends = []
    }
  },
  beforeDestroy () {
    this.$q.localStorage.set('friends', this.friends)
  }
}
</script>
