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
        v-model="searchPlayer"
        input-class="text-right"
        class="q-ml-md"
      >
        <template v-slot:append>
          <q-icon
            v-if="!searchPlayer"
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
      <q-item-label header>{{getRoomName()}} Players:</q-item-label>
      <q-separator />
      <q-expansion-item
        dense
        dense-toggle
        expand-separator
        v-for="p in myPlayers"
        :key="p.id"
        group='players'
        @input='readMessage(p)'
      >
        <template v-slot:header>
          <q-item-section side>
            <div class="row items-center">
              <q-icon
                :name="seatIcon(p)"
                size="24px"
              />
              <q-avatar size="24px">
                <img :src="playerAvatar(p)" />
              </q-avatar>
            </div>
          </q-item-section>

          <q-item-section>
            <div>
              <template v-if="p.status==2">
                <span style="color:red;">@</span>
              </template>
              <template v-else-if="p.status==1">
                <span style="color:white;">&#xf3a5;</span>
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
              :name="playerFlag(p)"
              class="q-ml-md"
              size="sm"
            />
          </q-item-section>
        </template>
        <q-card v-if='!isMyPlayer(p)'>
          <q-card-actions>
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
              v-if='!isMyTable(p)'
              @click='onWatch(p)'
            >Watch</q-btn>
            <q-btn
              dense
              flat
              size="sm"
              icon='mdi-account-multiple-plus'
              v-if='!isMyTable(p)'
              @click='onJoin(p, 0)'
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
import { players$ } from 'src/api'
import { jbIsPlayer, jbSameId, jbPlayerSIcon, jbAvatar, jbFlag } from 'src/jbPlayer'

export default {
  name: 'myP1List',

  components: {
    // EssentialLink,
    myMessages,
    myChat
  },
  data () {
    return {
      searchPlayer: null,
      friends: [],
      room: '#Lobby'
    }
  },
  computed: {
    ...mapState('jstore', ['jsPlayers', 'jsT1', 'jsPM']),
    ...mapGetters('jstore', ['jsPlayer', 'jsTableById']),

    myRoom () {
      return this.jsT1
    },
    myPlayers () {
      switch (this.jsT1) {
        case null:
        case '#Lobby':
          return this.jsPlayers
        default:
          return this.jsPlayers.filter(p => p.seat.tId === this.jsT1)
      }
    }
  },
  methods: {
    ...mapActions('jstore', ['setJsMap']),

    getRoomName () {
      return this.getT1Name(this.jsT1)
    },
    getT1Name (t) {
      if (t) {
        const t1 = this.jsTableById(t)
        if (t1) return t1.name
      }
      return '#Lobby'
    },
    playerAvatar (p) {
      return jbAvatar(p)
    },
    playerFlag (p) {
      return jbFlag(p)
    },
    seatIcon (p) {
      return jbPlayerSIcon(p)
    },
    isPlayer (p) {
      return p.seat ? jbIsPlayer(p.seat.sId) : false
    },
    isMyPlayer (p) {
      return jbSameId(p.id, this.jsPlayer.id)
    },
    isMyTable (p) {
      return jbSameId(p.seat.tId, this.jsPlayer.seat.tId)
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
      if (!this.isMyPlayer(p)) return this.jsPM.indexOf(p.id) >= 0
      else return false
    },
    readMessage (p) {
      if (!this.isMyPlayer(p)) this.setJsMap({ key: 'pm', value: p.id }) // reset PM
    },
    onJoin (p, sId) {
      const seat = {
        tId: p.seat.tId,
        sId: sId
      }
      players$.patch(this.jsPlayer.id, { seat })
    },
    onWatch (p) {
      if (p.seat && jbIsPlayer(p.seat.sId)) this.onJoin(p, -p.seat.sId)
      else this.onJoin(p, 9)
      this.setJsMap({ key: 'pf', value: p.id })
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
