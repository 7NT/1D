<template>
  <q-page
    class="no-padding no-margin"
    v-if="jsPlayer"
  >
    <!-- content -->
    <div class="column">
      <div
        class='col'
        v-show="isVisible(true)"
      >
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
            <q-tab-panel
              :name="0"
              class='no-margin no-padding'
            >
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
      <div
        col='col'
        v-show="isVisible(false)"
      >
        <myMessages :roomId="rId" />
      </div>
    </div>
    <q-footer
      elevated
      v-show="isVisible(false)"
    >
      <myChat :roomId="rId" />
    </q-footer>

    <q-page-sticky position="top-right" :offset="[18, 18]">
      <q-btn
        round
        color="accent"
        @click="$q.fullscreen.toggle()"
        :icon="
          $q.fullscreen.isActive
            ? 'fullscreen_exit'
            : 'fullscreen'
        "
      >
        <q-tooltip>Full Screen</q-tooltip>
      </q-btn>
    </q-page-sticky>
    <!--
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
    >
      <SpeechToText />
    </q-page-sticky>
    -->
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
import { jbV2C } from 'src/jbVoice'
// import SpeechToText from 'src/components/SpeechToText'
// import myBottomSheet from 'src/components/myBottomSheet'

export default {
  name: 'Lobby',
  components: {
    myT1List,
    myPlayTable,
    myMessages,
    myChat,
    myTourney
    // SpeechToText,
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

    onJoin (b) {
      if (b) this.onPlayer({ sId: 0 })
    },
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
    },
    /*
    handleOrientationChange () {
      const orientation = window.screen.orientation.type
      if (orientation === 'portrait-primary') {
        // portrait mode
        // Exiting fullscreen mode:
      } else if (orientation === 'landscape-primary') {
        // landscape mode
      }
    },
    */
    isVisible (v) {
      let b = true
      if (this.$q.platform.is.mobile || this.$q.screen.lt.md) {
        // if (this.$q.fullscreen.isActive) {
        if (v) b = this.$q.screen.height < this.$q.screen.width
        else b = this.$q.screen.height > this.$q.screen.width
      }
      return b
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
          if (s !== c) {
            this.$q.notify({
              message: 'Do you want to JOIN a table?',
              color: 'primary',
              icon: 'login',
              actions: [
                { label: 'Dismiss', color: 'white', handler: () => { this.onJoin(false) } }
              ]
            })
          } else this.onJoin(true)
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
