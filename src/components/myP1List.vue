<template>
  <div>
    <q-toolbar class="bg-primary text-white rounded-borders">
      <q-btn round dense flat icon="group" class="q-mr-xs" />

      <q-space />

      <q-input dark dense standout v-model="player" input-class="text-right" class="q-ml-md">
        <template v-slot:append>
          <q-icon v-if="!player" name="search" />
          <q-icon v-else name="clear" class="cursor-pointer" @click="player_search = null" />
        </template>
      </q-input>
    </q-toolbar>

    <q-list bordered>
      <q-item-label header>{{room}} Players:</q-item-label>
      <q-separator />
      <q-expansion-item dense dense-toggle expand-separator v-for="p in myPlayers" :key="p.id">
        <template v-slot:header>
          <q-item-section side>
            <div class="row items-center">
              <q-icon :name="`img:statics/jbicon/seats/seat${p.seat.sId}.svg`" size="24px" />
              <q-avatar size="24px">
                <img :src="p.profile.avatar" />
              </q-avatar>
            </div>
          </q-item-section>

          <q-item-section>{{p.nick}}</q-item-section>

          <q-item-section avatar side>
            <q-icon dense :name="getFlag(p)" class="q-ml-md" size="sm">
              <q-badge v-if='from === p.nick' color="red" floating transparent>.</q-badge>
            </q-icon>
          </q-item-section>
        </template>
        <q-card>
          <q-card-actions>
            <q-btn dense flat disable size="sm">Watch</q-btn>
            <q-btn dense flat disable size="sm">Partner?</q-btn>
            <q-btn dense flat disable size="sm">Join</q-btn>
          </q-card-actions>
          <q-separator dark />
          <q-card-section>
            <myMessages :sendTo='`@${p.id}`' />
          </q-card-section>
          <q-card-section>
            <div class="full-width" style="height:24px">
              <myChat :sendTo='`@${p.id}`' />
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import myMessages from 'src/components/myMessages'
import myChat from 'src/components/myChat'

export default {
  name: 'myP1List',

  components: {
    // EssentialLink,
    myMessages,
    myChat
  },
  props: ['from'],
  data () {
    return {
      player: null,
      room: '#Lobby'
    }
  },
  computed: {
    ...mapState('jstore', ['players', 't1Id']),
    ...mapGetters('jstore', ['getPlayerById', 'getTableById']),
    myPlayers () {
      let players = this.players
      if (this.t1Id && this.t1Id !== '#Lobby') players = players.filter(p => p.seat.tId === this.t1Id)
      return players
    }
  },
  methods: {
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
    }
  },
  watch: {
    t1Id (n, o) {
      this.room = n ? '#My Table' : '#Lobby'
    }
  }
}
</script>
