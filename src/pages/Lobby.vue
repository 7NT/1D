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

            <q-tab-panel :name='1'>
              <div class='fit'>
                <myPlayTable
                  :myPlayer='myPlayer'
                  v-on:onPlayer='onPlayer'
                  class='jbtable'
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
import { mapState, mapGetters } from 'vuex'
import { playerService } from 'src/api'
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
    // ...mapActions('jstore', ['setChat']),
    onPlayer (seat) {
      seat.tId0 = this.mySeat.tId
      seat.sId0 = this.mySeat.sId
      playerService.patch(this.user._id, { seat })
    }
  },
  mounted () {
    if (!this.user.profile.flag) this.$router.push({ name: 'profile' })
  },
  watch: {
    mySeat (n, o) {
      this.rooms[1].open = !!n.tId
      this.rooms[1].id = n.tId
      this.rId = n.tId ? 1 : 0
    }
  },
  created () {
    this.$parent.page = 'Lobby'
    this.user = this.$attrs.user
  }
}
</script>

<style scoped>
.jbtable > div {
  border: 1px solid yellow;
}
.messages {
  min-height: 200px;
  max-height: 400px;
}
</style>
