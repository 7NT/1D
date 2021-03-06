<template>
  <q-page
    class='no-padding no-margin'
    v-if='!!jsPlayer'
  >
    <!-- content -->
    <div class='column'>
      <div class='col'>
        <q-card class='fit'>
          <q-tabs
            v-model='rId'
            align='left'
            dense
            shrink
            no-caps
            inline-label
            indicator-color='yellow'
            class='bg-secondary text-white shadow-2'
            v-show='isVisible(false)'
          >
            <q-tab
              v-for='r in rooms'
              :key='r.id'
              :name='r.id'
              :icon='r.icon'
              :label='r.name'
              :disable='!isOpen(r)'
            />
          </q-tabs>
          <q-tab-panels
            keep-alive
            v-model='rId'
            animated
            class='bg-teal'
          >
            <q-tab-panel
              :name='0'
              class='no-margin no-padding'
            >
              <div class='fit'>
                <q-list
                  dense
                  bordered
                  separator
                >
                  <myT1List
                    v-for='t1 in myTables'
                    :key='t1.id'
                    :myTable='t1'
                    v-on:onPlayer='onPlayer'
                  />
                </q-list>
              </div>
            </q-tab-panel>

            <q-tab-panel
              :name='1'
              class='no-margin no-padding'
            >
              <myPlayTable
                :jsPlayer='jsPlayer'
                v-on:onPlayer='onPlayer'
                v-show='isVisible(true)'
              />
            </q-tab-panel>

            <q-tab-panel :name='2'>
              <div class='fit'>
                <myTourney :jsPlayer='jsPlayer' />
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
      <div
        col='col'
        v-show='isVisible(false)'
      >
        <myMessages :chatTo='myRoom' />
      </div>
    </div>
    <q-footer
      elevated
      v-show='isVisible(false)'
    >
      <myChat :chatTo='myRoom' />
    </q-footer>

    <q-page-sticky
      position='top-right'
      :offset='[18, 0]'
    >
      <q-btn
        round
        color='accent'
        @click='$q.fullscreen.toggle()'
        :icon='$q.fullscreen.isActive ? "fullscreen_exit" : "fullscreen"'
      >
        <q-tooltip>Full Screen</q-tooltip>
      </q-btn>
    </q-page-sticky>
    <q-page-sticky
      position='bottom-right'
      :offset='[18, 18]'
    >
      <SpeechToText />
    </q-page-sticky>
  </q-page>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

import { players$, tables$ } from 'src/api'
// import auth from 'src/auth'
import myT1List from 'src/components/myT1List'
import myPlayTable from 'src/components/myPlayTable'
import myMessages from 'src/components/myMessages'
import myChat from 'src/components/myChat'
import myTourney from 'src/components/myTourney'
import { jbV2C } from 'src/jbVoice'
import SpeechToText from 'src/components/SpeechToText'
// import myBottomSheet from 'src/components/myBottomSheet'
// https://capacitorjs.com/docs/guides/push-notifications-firebase
import { Plugins } from '@capacitor/core' // PushNotification, PushNotificationToken, PushNotificationActionPerformed
const { PushNotifications } = Plugins

// https://github.com/capacitor-community/fcm
// alternatively - without types
const { FCMPlugin } = Plugins

export default {
  name: 'Lobby',
  components: {
    myT1List,
    myPlayTable,
    myMessages,
    myChat,
    myTourney,
    SpeechToText
    // myBottomSheet
  },
  data () {
    return {
      user: null,
      rId: 0,
      rooms: [
        {
          name: 'Lobby',
          id: 0,
          icon: 'people'
        },
        {
          name: 'My Table',
          id: 1,
          icon: 'local_play'
        },
        {
          name: 'Tourney',
          id: 2,
          icon: 'emoji_events'
        },
        {
          name: 'Team Game',
          id: 4,
          icon: 'group_add'
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
      return this.jsPlayer ? this.jsPlayer.seat : { id: '#Lobby', sId: 0 }
    },
    myRoom () {
      switch (this.rId) {
        case 1: return { id: this.mySeat.tId }
        default: return { id: '#Lobby' }
      }
    },
    fullScreen () {
      if (this.$q.fullscreen.isActive && this.$q.screen.lt.md) {
        return this.$q.screen.height < this.$q.screen.width
      } else return false
    }
  },
  methods: {
    ...mapActions('jstore', ['setJsMap']),

    onJoin (b) {
      if (b) this.onPlayer({ sId: 0 })
    },
    onPlayer (seat) {
      // console.log('onPlayer', seat)
      if (!seat) {
        this.rId = 0
        seat = { action: 'part', tId: null, sId: 0 }
      }
      if (this.mySeat) {
        seat.tId0 = this.mySeat.tId
        seat.sId0 = this.mySeat.sId
      }
      if (seat.sId === -9) tables$.remove(seat.tId)
      else players$.patch(this.jsPlayer.id, { seat })
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
    isVisible (v) {
      if (this.$q.screen.lt.sm || this.$q.fullscreen.isActive) {
        if (v) return this.$q.screen.height < this.$q.screen.width // landscape
        else return this.$q.screen.height > this.$q.screen.width // portrait
      }
      return true
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
        console.err(err)
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
    // this.$parent.page = 'Lobby'
    this.user = this.$attrs.user
    if (this.user && !this.user.nick) this.$router.push({ name: 'profile' })
  },
  created () {
    // this.user = this.$attrs.user
    console.log('Initializing HomePage')

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    if (this.$q.platform.is.capacitor) {
      PushNotifications.requestPermission().then(result => {
        if (result.granted) {
          // Register with Apple / Google to receive push via APNS/FCM
          PushNotifications.register()
            .then(() => {
              //
              // Subscribe to a specific topic
              // you can use `FCMPlugin` or just `fcm`
              FCMPlugin.subscribeTo({ topic: 'Notifications' })
                .then((r) => console.log('subscribed to topic'))
                .catch((err) => {
                  // console.log(err)
                  this.$q.notify({
                    message: err,
                    icon: 'info'
                  })
                })
            })
            .catch((err) => {
              // alert(JSON.stringify(err))
              this.$q.notify({
                message: err,
                icon: 'info'
              })
            })
        } else {
          // Show some error
        }
      })

      PushNotifications.addListener('registration',
        (token) => { // : PushNotificationToken
          // console.log('Push registration success, token: ' + token.value)
        }
      )

      PushNotifications.addListener('registrationError',
        (error) => { // : any
          console.log('Error on registration: ' + JSON.stringify(error))
        }
      )

      PushNotifications.addListener('pushNotificationReceived',
        (notification) => { // : PushNotification
          // alert('Push received: ' + JSON.stringify(notification))
        }
      )

      PushNotifications.addListener('pushNotificationActionPerformed',
        (notification) => { // : PushNotificationActionPerformed
          // alert('Push action performed: ' + JSON.stringify(notification))
        }
      )
    }
  }
}
</script>

<style scoped>
.q-panel {
  overflow-y: auto;
}
</style>
