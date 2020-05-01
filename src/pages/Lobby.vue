<template>
  <q-page
    class="no-padding no-margin"
    v-if='myPlayer'
  >
    <!-- content -->
    <div class='column'>
      <div class='col-8'>
        <q-card>
          <q-tabs
            v-model='rId'
            align='left'
            dense
            shrink
            no-caps
            inline-label
            indicator-color='yellow'
            class='bg-secondary text-white shadow-2'
          >
            <q-tab
              v-for='r in rooms'
              :key='r.value'
              :name='r.value'
              :icon='r.icon'
              :label='r.name'
              :disable='!r.open'
            />
          </q-tabs>
          <q-tab-panels
            keep-alive
            v-model='rId'
            animated
            class="bg-teal"
          >
            <q-tab-panel :name='0'>
              <div class='fit'>
                <q-list
                  dense
                  bordered
                  separator
                >
                  <myTableList
                    v-for='t in tables'
                    :key='t.id'
                    :myTable='t'
                    v-on:onPlayer='onPlayer'
                  />
                </q-list>
              </div>
            </q-tab-panel>

            <q-tab-panel :name='1' class='panel'>
              <div class='fit'>
                <myPlayTable
                  :myPlayer='myPlayer'
                  v-on:onPlayer='onPlayer'
                />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
      <div class='col-4'>
        <myMessages :to='rooms[rId]' />
      </div>
    </div>
    <q-footer elevated>
      <myChat :to='rooms[rId]' />
    </q-footer>
  </q-page>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { players$ } from 'src/api'
import myTableList from 'src/components/myTableList'
import myPlayTable from 'src/components/myPlayTable'
import myMessages from 'src/components/myMessages'
import myChat from 'src/components/myChat'

export default {
  name: 'Lobby',
  components: {
    myTableList,
    myPlayTable,
    myMessages,
    myChat
  },
  data () {
    return {
      user: null,
      splitterModel: 50, // start at 50%
      rId: 0,
      rooms: [
        {
          name: 'Lobby',
          value: 0,
          icon: 'people',
          open: true,
          id: '#Lobby'
        },
        {
          name: 'My Table',
          value: 1,
          icon: 'portrait',
          open: false,
          id: '#Lobby'
        },
        {
          name: 'Tourney',
          value: 2,
          icon: 'person_add',
          open: false,
          id: '#Lobby'
        },
        {
          name: 'Team Game',
          value: 4,
          icon: 'group_add',
          open: false,
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
    }
  },
  methods: {
    ...mapActions('jstore', ['setRoomId']),
    onPlayer (seat) {
      seat.tId0 = this.mySeat.tId
      seat.sId0 = this.mySeat.sId
      players$.patch(this.myPlayer.id, { seat })
    }
  },
  mounted () {
    this.$parent.page = 'Lobby'
    if (!this.myPlayer.profile.flag) this.$router.push({ name: 'profile' })
  },
  watch: {
    myPlayer (p) {
      if (!p) this.goTo('home')
    },
    mySeat (n, o) {
      this.rooms[1].open = !!n.tId
      this.rooms[1].id = n.tId
      this.rId = n.tId ? 1 : 0
      // this.$parent.player_filter = this.rId
    },
    rId (r) {
      console.log('r', r)
      this.setRoomId(r ? this.mySeat.tId : null)
    }
  },
  created () {
    this.user = this.$attrs.user
  }
}
</script>

<style scoped>
.panel {
  overflow-x: hidden;
}
.messages {
  min-height: 200px;
  max-height: 400px;
}
</style>
