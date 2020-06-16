<template>
  <q-page class="no-padding no-margin" v-if="myPlayer">
    <!-- content -->
    <div class="column">
      <div class="col-8">
        <q-card>
          <q-tabs
            v-model="rId"
            align="left"
            dense
            shrink
            no-caps
            inline-label
            indicator-color="yellow"
            class="bg-secondary text-white shadow-2"
          >
            <q-tab
              v-for="r in rooms"
              :key="r.value"
              :name="r.value"
              :icon="r.icon"
              :label="r.name"
              :disable="!isOpen(r)"
            />
          </q-tabs>
          <q-tab-panels keep-alive v-model="rId" animated class="bg-teal">
            <q-tab-panel :name="0">
              <div class="fit">
                <q-list dense bordered separator>
                  <myT1List
                    v-for="t1 in myTables"
                    :key="t1.id"
                    :myTable="t1"
                    v-on:onPlayer="onPlayer"
                  />
                </q-list>
              </div>
            </q-tab-panel>

            <q-tab-panel :name="1">
              <div class="fit">
                <myPlayTable :myPlayer="myPlayer" v-on:onPlayer="onPlayer" />
              </div>
            </q-tab-panel>

            <q-tab-panel :name="2">
              <div class="t2">
                <myTourney :myPlayer="myPlayer" />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
      <q-space />
      <div class="col-3 messages">
        <myMessages :sendTo="rooms[rId].id" />
      </div>
    </div>
    <q-footer elevated>
      <myChat :sendTo="rooms[rId].id" />
    </q-footer>
  </q-page>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { players$ } from 'src/api'
import myT1List from 'src/components/myT1List'
import myPlayTable from 'src/components/myPlayTable'
import myMessages from 'src/components/myMessages'
import myChat from 'src/components/myChat'
import myTourney from 'src/components/myTourney'

export default {
  name: 'Lobby',
  components: {
    myT1List,
    myPlayTable,
    myMessages,
    myChat,
    myTourney
  },
  data () {
    return {
      user: null,
      // splitterModel: 50, // start at 50%
      rId: 0,
      rooms: [
        {
          name: 'Lobby',
          value: 0,
          icon: 'people',
          id: '#Lobby'
        },
        {
          name: 'My Table',
          value: 1,
          icon: 'local_play',
          id: 't1'
        },
        {
          name: 'Tourney',
          value: 2,
          icon: 'emoji_events',
          id: '#Lobby'
        },
        {
          name: 'Team Game',
          value: 4,
          icon: 'group_add',
          id: '#Lobby'
        }
      ],
      MIX: ['MP', 'IMP', 'XIMP'],
      myBT: null
    }
  },
  computed: {
    ...mapState('jstore', ['players', 'tables']),
    ...mapGetters('jstore', ['myPlayer', 'getTableById']),

    mySeat () {
      return this.myPlayer.seat
    },
    myTables () {
      return this.tables
    }
  },
  methods: {
    ...mapActions('jstore', ['setT04']),
    onUser (user) {
      this.updateuser(user)
    },
    onPlayer (seat) {
      if (this.mySeat) {
        seat.tId0 = this.mySeat.tId
        seat.sId0 = this.mySeat.sId
      }
      players$.patch(this.myPlayer.id, { seat })
    },
    isOpen (r) {
      switch (r.value) {
        case 0: // lobby
        case 2:
          return true
        case 1:
          return !!this.mySeat
        default:
          return false
      }
    }
  },
  mounted () {
    this.$parent.page = 'Lobby'
    if (!this.myPlayer.profile.flag) this.$router.push({ name: 'profile' })
  },
  watch: {
    user (u) {
      if (!u) this.$router.push({ name: 'home' }).catch(e => {})
    },
    mySeat (n) {
      if (n) {
        this.rooms[1].id = n.tId
        this.rId = n.tId ? 1 : 0
      } else this.rId = 0
    },
    rId (r) {
      this.setT04({
        id: 1,
        t1: { id: this.rooms[r].id, name: this.rooms[r].name }
      })
    }
  },
  created () {
    this.user = this.$attrs.user
  }
}
</script>

<style scoped>
.q-panel {
  max-height: 400px;
  overflow-y: auto;
}
.messages {
  overflow-x: hidden;
}
.t2 {
  height: 60vh;
  width: 100%;
}
</style>
