<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="group"
          aria-label="Players"
          v-if="authenticated"
          @click="playerList = !playerList"
        />

        <q-toolbar-title>
          <q-icon name="img:statics/jbicon/seats/seat0.svg" />1♦ App
        </q-toolbar-title>

        <div>1D v{{ $q.version }}</div>
        <!--
          <a href="localhost:3030/oauth/google">Login with Google</a>
        -->
        <q-btn flat @click="goTo('signin')" v-show="!authenticated">Sign In</q-btn>
        <q-btn flat @click="goTo('register')" v-show="!authenticated">Register</q-btn>
        <q-btn flat round @click="goTo('lobby')" v-if="authenticated">
          <q-icon name="home" />
          <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 20]">Lobby</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          icon="menu_book"
          @click="scoreBook = !scoreBook"
          aria-label="ScoreBook"
          v-show="authenticated"
        />
        <q-btn flat round @click="goTo('profile')" v-if="authenticated">
          <q-avatar class="gt-xs">
            <img :src="user.profile.avatar" />
          </q-avatar>
          <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 20]">Profile</q-tooltip>
        </q-btn>
        <q-btn flat round @click="signout" v-show="authenticated">
          <q-icon name="exit_to_app" />
          <q-tooltip anchor="bottom middle" self="top middle" :offset="[0, 20]">Signout</q-tooltip>
        </q-btn>
        <q-btn
          color="secondary"
          @click="$q.fullscreen.toggle()"
          :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
        >
          <q-tooltip>Full Screen</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="playerList" v-if="authenticated" bordered elevated content-class="bg-grey-1">
      <myP1List />
    </q-drawer>

    <q-drawer
      side="right"
      overlay
      bordered
      mini-to-overlay
      v-model="scoreBook"
      v-show="authenticated"
      :content-class="$q.theme === 'mat' ? 'bg-grey-3' : null"
      :content-style="{ fontSize: '16px' }"
    >
      <myScoreBook />
    </q-drawer>
    <q-page-container>
      <router-view :user="user"></router-view>
    </q-page-container>
  </q-layout>
</template>

<script>
// import EssentialLink from 'components/EssentialLink'
import { mapState, mapGetters, mapActions } from 'vuex'
import myP1List from 'src/components/myP1List'
import myScoreBook from 'src/components/myScoreBook'

import {
  users$,
  players$,
  tables$,
  chats$,
  results$,
  tourneys$,
  teams$
} from 'src/api'
import auth from 'src/auth'
import { jbIsPlayer } from 'src/jbPlayer'

export default {
  name: 'MainLayout',

  components: {
    // EssentialLink,
    myP1List,
    myScoreBook
  },

  data () {
    return {
      // essentialLinks: [],
      playerList: true,
      scoreBook: false,
      page: '',
      user: null,
      following: null
    }
  },
  computed: {
    ...mapState('jstore', ['jsPF']),
    ...mapGetters('jstore', ['jsTableById', 'jsPlayerbyId', 'jsTourneyById']),
    authenticated () {
      return this.user != null
    }
  },
  methods: {
    ...mapActions('jstore', [
      'setJsUser',
      'setChat',
      'setPlayers',
      'setTables',
      'setResults',
      'setTourneys',
      'setTeams',
      'addPlayer',
      'addTable',
      'addResult',
      'addTourney',
      'setJsSet',
      'setJsMap'
    ]),
    goTo (route) {
      if (this.$route.name !== route) {
        this.$router.push({ name: route }).catch(e => {})
      }
    },
    async signin (user) {
      // console.log('signin', user)
      this.setUser(user)
      await this.onServices()
    },
    signout () {
      auth
        .signout()
        .then(() => {
          this.$q.notify({
            type: 'positive',
            message: 'You are now logged out, sign in again to continue to play'
          })
        })
        .catch(err => {
          console.log(err)
          this.$q.notify({
            type: 'positive',
            message: 'Cannot logout, please check again in a few minutes'
          })
        })
    },
    setUser (u) {
      this.$data.user = u
      this.setJsUser(u)
    },
    async onServices () {
      // find
      await players$.find().then(response => {
        this.setPlayers(response.data)
      })
      await tables$.find().then(response => {
        console.log('tabales', response)
        this.setTables(response.data)
        response.data.forEach(t => this.onTable(t))
      })
      /*
      results$
        .find({
          // query: { players: { $in: this.user._id }}
        })
        .then(response => {
          if (response.data.length > 0) this.setResults(response.data)
        })
      */
      tourneys$.find().then(response => {
        this.setTourneys(response.data)
      })
      teams$.find().then(response => {
        this.setTeams(response.data)
      })

      chats$.on('created', chat => {
        // if (chat.to === '#Lobby') this.myChats.unshift(chat)
        if (chat.to === `@${this.user._id}`) {
          if (chat.request) {
            this.onRequest(chat)
          } else {
            this.$q.notify({
              type: 'info',
              message: 'You received a message from: ' + chat.from.nick
            })
          }
        }
        this.setChat(chat)
      })

      users$.on('patched', u0 => {
        console.log('user patched', u0)
        if (u0._id === this.user._id) this.setUser(u0)
      })

      tables$.on('created', t1 => {
        console.log('table created', t1)
        this.addTable(t1)
        this.onTable(t1)
      })
      tables$.on('patched', t1 => {
        console.log('table patched', t1)
        this.addTable(t1)
      })
      tables$.on('removed', t1 => {
        console.log('table removed', t1)
        t1.state = -1
        this.addTable(t1)
      })

      players$.on('created', p1 => {
        console.log('create player', p1, this.user)
        this.addPlayer(p1)
        if (p1.id === this.user._id) {
          const { seat0 } = this.user
          if (seat0 && seat0.tId) {
            // rejoin
            const t1 = this.jsTableById(seat0.tId) // if table still exists
            if (t1) {
              const seat = {
                tId: seat0.tId,
                sId: seat0.sId,
                tId0: null
              }
              this.onTableSit(p1.id, { seat })
            }
          }
        } else {
          this.$q.notify({
            color: 'into',
            message: `[JOIN]: ${p1.nick}`
          })
        }
      })
      players$.on('patched', p1 => {
        console.log('player patched', p1)
        this.addPlayer(p1)

        if (p1.id === this.jsPF) {
          let sId = 9
          if (jbIsPlayer(p1.seat.sId)) sId = -p1.seat.sId
          const seat = {
            tId: p1.seat.tId,
            sId: sId
          }
          this.onTableSit(this.user._id, { seat })
        }
      })
      players$.on('removed', p1 => {
        console.log('player removed', p1)
        p1.state = -1
        this.addPlayer(p1)
        this.$q.notify({
          color: 'into',
          message: `[EXIT]: ${p1.nick}`
        })
      })

      results$.on('created', r1 => {
        console.log('create result', r1)
        // if (r1.players.includes(this.user.nick))
        this.addResult(r1)
      })
      results$.on('patched', r1 => {
        console.log('patched result', r1)
        // if (r1.players.includes(this.user.nick))
        this.updateResult(r1)
      })

      tourneys$.on('created', t2 => {
        console.log('tourney created', t2)
        this.addTourney(t2)
      })
      tourneys$.on('patched', t2 => {
        console.log('tourney patched', t2)
        this.addTourney(t2)
      })
      tourneys$.on('updated', t2 => {
        console.log('tourney updated', t2)
        this.addTourney(t2)
      })
      tourneys$.on('removed', t2 => {
        t2.state = -1
        this.addTourney(t2)
        console.log('t2 removed', t2)
      })
    },
    onTable (t1) {
      if (!t1.id) return
      if (t1.id.startsWith('#@') && t1.seats.includes(this.user.nick)) {
        // tourney table
        const sId = t1.seats.indexOf(this.user.nick)
        const p = this.jsPlayerById(this.user.nick)

        const seat = {
          tId: t1.id,
          sId: sId + 1,
          tId0: p.tId,
          sId0: p.sId
        }
        this.onTableSit(this.user._id, { seat })
      }
    },
    onTableSit (pId, seat) {
      players$.patch(pId, seat)
    },
    onRequest (chat) {
      if (chat.request.q === 't2') {
        // tourney request
        this.$q.notify({
          type: 'info',
          message: 'You received a request from: ' + chat.from.nick
        })
        const notification = {
          message: `Tourney Request from: ${chat.from.nick}`,
          caption: chat.text,
          color: 'primary',
          icon: 'live_help'
        }
        notification.timeout = 10000
        notification.actions = [
          {
            label: 'Accept',
            color: 'yellow',
            handler: () => {
              this.onRequestR(chat)
            }
          },
          {
            label: 'Decline',
            color: 'white',
            handler: () => {
              this.onRequestR(null)
            }
          }
        ]
        this.$q.notify(notification)
      }
    },
    onRequestR (chat) {
      if (chat) {
        const { request } = chat
        if (request) {
          const t2 = this.getT2ById(request.id)
          const pairs = JSON.parse(JSON.stringify(t2.pairs))
          const player = this.tsPlayerById(chat.from._id)
          const partner = this.tsPlayerById(chat.to.substring(1))
          const pair = {
            player,
            partner,
            cc: request.cc,
            boards: 0,
            score: null,
            state: 0
          }
          pairs.push(pair)

          this.setT04({ id: 2, t2: { _id: t2._id, myPair: pair } })
          tourneys$.patch(t2._id, { pairs })
        }
      }
    }
  },
  beforeMount () {
    // this.user = null
  },
  mounted () {
    // Check if there is already a session running
    auth
      .login()
      .then(user => {
        // this.signin(user.user)
        this.$q.notify({
          type: 'positive',
          message: 'Restoring previous session'
        })
      })
      .catch(_ => {
        this.goTo('home')
      })

    // On successful login
    auth.onAuthenticated(user => {
      console.log('onAuthenticated', user)
      this.signin(user)
    })

    // On logout
    auth.onLogout(() => {
      this.goTo('home')
      this.setUser(null)
    })

    window.onbeforeunload = function () {
      this.signout()
    }
  },
  watch: {
    user (user) {
      if (user) {
        this.goTo('lobby')
      } else {
        this.signout()
        this.goTo('home')
      }
    }
  },
  beforeDestroy () {
    this.signout()
  }
}
</script>
<style scoped>
.container {
  height: 100vh;
}
</style>
