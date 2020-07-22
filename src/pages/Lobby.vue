<template>
  <q-page
    class="no-padding no-margin"
    v-if="jsPlayer"
  >
    <!-- content -->
    <div class="column">
      <div class="col">
        <q-card class='fit'>
          <q-tabs
            v-model="rId"
            align="left"
            dense
            shrink
            no-caps
            inline-label
            indicator-color="yellow"
            class="bg-secondary text-white shadow-2"
            v-show='!$q.fullscreen.isActive'
          >
            <q-tab
              v-for="r in rooms"
              :key="r.id"
              :name="r.id"
              :icon="r.icon"
              :label="r.name"
              :disable="!isOpen(r)"
            />
          </q-tabs>
          <q-tab-panels
            keep-alive
            v-model="rId"
            animated
            class="bg-teal"
          >
            <q-tab-panel :name="0">
              <div class="fit">
                <q-list
                  dense
                  bordered
                  separator
                >
                  <myT1List
                    v-for="t1 in myTables"
                    :key="t1.id"
                    :myTable="t1"
                    v-on:onPlayer="onPlayer"
                  />
                </q-list>
              </div>
            </q-tab-panel>

            <q-tab-panel
              :name="1"
              class='no-margin no-padding'
            >
              <myPlayTable
                :jsPlayer="jsPlayer"
                v-on:onPlayer="onPlayer"
              />
            </q-tab-panel>

            <q-tab-panel :name="2">
              <div class='fit'>
                <myTourney :jsPlayer="jsPlayer" />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
      <div class="col-auto">
        <q-space />
        <myMessages :sendTo="rooms[rId].room" />
      </div>
    </div>
    <q-footer elevated>
      <myChat :sendTo="rooms[rId].room" />
    </q-footer>
    <!--
    <q-page-sticky
      position="bottom-left"
      :offset="[18, 18]"
    >
      <myBottomSheet />
    </q-page-sticky>
    -->
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
    >
      <SpeechToText />
    </q-page-sticky>
  </q-page>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

import { players$ } from 'src/api'
import myT1List from 'src/components/myT1List'
import myPlayTable from 'src/components/myPlayTable'
import myMessages from 'src/components/myMessages'
import myChat from 'src/components/myChat'
import SpeechToText from 'src/components/SpeechToText'
import myTourney from 'src/components/myTourney'
import { jbV2C } from 'src/jbVoice'
// import myBottomSheet from 'src/components/myBottomSheet'

export default {
  name: 'Lobby',
  components: {
    myT1List,
    myPlayTable,
    myMessages,
    myChat,
    SpeechToText,
    myTourney
    // myBottomSheet
  },
  data () {
    return {
      // splitterModel: 50, // start at 50%
      user: null,
      rId: 0,
      rooms: [
        {
          name: 'Lobby',
          id: 0,
          icon: 'people',
          room: '#Lobby'
        },
        {
          name: 'My Table',
          id: 1,
          icon: 'local_play',
          room: null
        },
        {
          name: 'Tourney',
          id: 2,
          icon: 'emoji_events',
          room: '#Lobby'
        },
        {
          name: 'Team Game',
          id: 4,
          icon: 'group_add',
          room: '#Lobby'
        }
      ]
      // MIX: ['MP', 'IMP', 'XIMP'],
      // myBT: null
    }
  },
  computed: {
    ...mapState('jstore', ['jsPlayers', 'jsTables', 'jsSpeech']),
    ...mapGetters('jstore', ['jsPlayer', 'jsTableById']),

    myTables () {
      return this.jsTables
    },
    mySeat () {
      return this.jsPlayer ? this.jsPlayer.seat : { sId: 0 }
    }
  },
  methods: {
    ...mapActions('jstore', ['setJsMap']),

    onPlayer (seat) {
      if (!seat) {
        this.rId = 0
        seat = { action: 'part', tId: null, sId: 0 }
      }
      if (this.mySeat) {
        seat.tId0 = this.mySeat.tId
        seat.sId0 = this.mySeat.sId
      }
      players$.patch(this.jsPlayer.id, { seat })
    },
    isOpen (r) {
      switch (r.id) {
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
  watch: {
    user (u) {
      if (!u) this.$router.push({ name: 'home' }).catch(e => { })
    },
    mySeat (n, o) {
      try {
        if (n.tId) {
          this.rooms[1].room = n.tId
          this.rId = 1
        } else this.rId = 0
      } catch (err) {
        // console.err(err)
      }
    },
    rId (r) {
      this.setJsMap({
        key: 't1',
        value: this.rooms[r].room || this.mySeat.tId
      })
      if (r !== 1) {
        // Exiting fullscreen mode:
        if (this.$q.fullscreen.isActive) {
          this.$q.fullscreen
            .exit()
            .then(() => {
              // v1.5.0+
              // success!
            })
            .catch(err => {
              // v1.5.0+
              console.error(err)
            })
        }
      }
    },
    jsSpeech (s) {
      if (this.mySeat.tId) return
      const c = jbV2C(s)
      console.log(s, c)
      switch (c) {
        case 'table':
        case 'my table':
          this.rId = 1
          break
        case 'tourney':
          this.rId = 2
          break
        case 'join':
        case 'sit':
          this.onPlayer({ sId: 0 })
          break
        case 'sit north':
        case 'north':
          this.onPlayer({ sId: 1 })
          break
        case 'sit east':
        case 'east':
          this.onPlayer({ sId: 2 })
          break
        case 'sit south':
        case 'south':
          this.onPlayer({ sId: 3 })
          break
        case 'sit west':
        case 'west':
          this.onPlayer({ sId: 4 })
          break
        default:
      }
    }
  },
  mounted () {
    this.$parent.page = 'Lobby'
    if (!this.jsPlayer.profile.flag) this.$router.push({ name: 'profile' })
  },
  created () {
    this.user = this.$attrs.user
  }
}
</script>

<style scoped>
.q-panel {
  overflow-y: auto;
}
</style>
