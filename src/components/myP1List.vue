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
      <q-item-label header>{{jbT1}} Players:</q-item-label>
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
          <q-card-actions>
            <q-btn
              dense
              flat
              disable
              size="sm"
            >Watch</q-btn>
            <q-btn
              dense
              flat
              disable
              size="sm"
            >Partner?</q-btn>
            <q-btn
              dense
              flat
              disable
              size="sm"
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
      room: '#Lobby'
    }
  },
  computed: {
    ...mapState('jstore', ['players', 'jbT0', 'jbT1']),
    ...mapGetters('jstore', ['getPlayerById', 'getTableById']),
    myPlayers () {
      let players = this.players
      if (this.jbT1 && this.jbT1 !== '#Lobby') players = players.filter(p => p.seat.tId === this.jbT1)
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
    newMessage (p) {
      // if (this.jbT0.length > 0) {
      const i = this.jbT0.findIndex(p0 => p0 === p.id)
      return i >= 0
      // } return false
    },
    read (p) {
      this.setT04({ id: 0, t0: p.id })
    }
  }
}
</script>
