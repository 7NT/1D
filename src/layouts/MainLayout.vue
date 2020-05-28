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
          <q-icon name="img:statics/jbicon/seats/seat0.svg" />1D App
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
      elevated
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
    ...mapState('jstore', ['jbP1']),
    ...mapGetters('jstore', [
      'getPlayerById',
      'getTableById',
      'getT2ById'
    ]),
    authenticated () {
      return this.user != null
    }
  },
  methods: {
    ...mapActions('jstore', [
      'setMyUser',
      'updateMyUser',
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
      'setT04'
    ]),
    goTo (route) {
      if (this.$route.name !== route) {
        this.$router.push({ name: route }).catch(e => {})
      }
    },
    signin (user) {
      // console.log('signin', user)
      this.user = user
      this.setMyUser(user)
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
      this.setMyUser(u)
    },
    async onServices () {
      // find
      await tables$.find().then(response => {
        this.setTables(response.data)
      })
      await players$.find().then(response => {
        this.setPlayers(response.data)
      })
      results$
        .find({
          // query: { players: { $in: this.user._id }}
        })
        .then(response => {
          if (response.data.length > 0) this.setResults(response.data)
        })
      tourneys$.find().then(response => {
        this.setTourneys(response.data)
      })
      teams$.find().then(response => {
        this.setTeams(response.data)
      })

      // creation
      tables$.on('created', t => {
        console.log('table created', t)
        this.addTable(t)
      })
      players$.on('created', p => {
        console.log('create player', p, this.user)
        this.addPlayer(p)
        if (p.id === this.user._id) {
          const { seat0 } = this.user
          if (seat0 && seat0.tId) {
            // rejoin
            const t = this.getTableById(seat0.tId) // if table still exists
            if (t) {
              const seat = {
                tId: seat0.tId,
                sId: seat0.sId,
                tId0: null
              }
              players$.patch(p.id, { seat })
            }
          }
        } else {
          this.$q.notify({
            color: 'into',
            message: `[JOIN]: ${p.nick}`
          })
        }
      })
      chats$.on('created', chat => {
        // if (chat.to === '#Lobby') this.myChats.unshift(chat)
        if (chat.to === `@${this.user._id}`) {
          if (chat.request) {
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
            notification.timeout = 5000
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
          } else {
            this.$q.notify({
              type: 'info',
              message: 'You received a message from: ' + chat.from.nick
            })
          }
        }
        this.setChat(chat)
      })
      results$.on('created', r => {
        console.log('create result', r)
        if (r.players.includes(this.user._id)) this.addResult(r)
      })
      tourneys$.on('created', t2 => {
        console.log('tourney created', t2)
        this.addTourney(t2)
      })

      // update
      users$.on('patched', user => {
        console.log('user patched', user)
        if (user._id === this.$data.user._id) {
          this.setUser(user)
        }
      })
      tables$.on('patched', t => {
        console.log('table patched', t)
        this.addTable(t)
      })
      players$.on('patched', p => {
        console.log('player patched', p)
        this.addPlayer(p)

        if (p.id === this.jbP1) {
          let sId = 9
          if (jbIsPlayer(p.seat.sId)) sId = -p.seat.sId
          const seat = {
            tId: p.seat.tId,
            sId: sId
          }
          players$.patch(this.user._id, { seat })
        }
      })
      results$.on('patched', r => {
        console.log('patched result', r)
        if (r.players.includes(this.user._id)) this.addResult(r)
      })
      tourneys$.on('patched', t2 => {
        console.log('tourney patched', t2)
        this.addTourney(t2)
      })

      // removed
      tables$.on('removed', t => {
        console.log('table removed', t)
        t.state = -1
        this.addTable(t)
      })
      players$.on('removed', p => {
        console.log('player removed', p)
        p.state = -1
        this.addPlayer(p)
        this.$q.notify({
          color: 'into',
          message: `[EXIT]: ${p.nick}`
        })
      })
      tourneys$.on('removed', t => {
        t.state = -1
        this.addTourney(t)
        console.log('t2 removed', t)
      })
    },
    onRequestR (chat) {
      if (chat) {
        const { request } = chat
        if (request) {
          const t2 = this.getT2ById(request.id)
          const pairs = JSON.parse(JSON.stringify(t2.pairs))
          const player = this.getPlayerById(chat.from._id)
          const partner = this.getPlayerById(chat.to.substring(1))
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
      this.user = null
    })
  },
  watch: {
    user (user) {
      if (user) {
        this.onServices()
        this.goTo('lobby')
      } else this.goTo('home')
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
.seat {
  width: 24px;
  height: 30px;
  margin: 0px;
}
</style>
