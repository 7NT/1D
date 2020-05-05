<template>
  <q-layout view='lHh Lpr lFf'>
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon='menu'
          aria-label='Menu'
          v-if='authenticated'
          @click='playerDrawer = !playerDrawer'
        />

        <q-toolbar-title>
          <q-icon name='img:statics/jbicon/seats/seat0.svg' />
          1D App
        </q-toolbar-title>

        <div>1D v{{ $q.version }}</div>
        <!--
          <a href="localhost:3030/oauth/google">Login with Google</a>
        -->
        <q-btn
          flat
          @click="goTo('signin')"
          v-show='!authenticated'
        >Sign In</q-btn>
        <q-btn
          flat
          @click="goTo('register')"
          v-show='!authenticated'
        >Register</q-btn>
        <q-btn
          flat
          round
          @click="goTo('lobby')"
          v-if='authenticated'
        >
          <q-icon name='home' />
          <q-tooltip
            anchor='bottom middle'
            self='top middle'
            :offset='[0, 20]'
          >Lobby</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          icon='menu_book'
          @click='scoreBook = !scoreBook'
          aria-label='ScoreBook'
          v-show='authenticated'
        />
        <q-btn
          flat
          round
          @click="goTo('profile')"
          v-if='authenticated'
        >
          <q-avatar class='gt-xs'>
            <img :src='user.profile.avatar' />
          </q-avatar>
          <q-tooltip
            anchor='bottom middle'
            self='top middle'
            :offset='[0, 20]'
          >Profile</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          @click='signout'
          v-show='authenticated'
        >
          <q-icon name='exit_to_app' />
          <q-tooltip
            anchor='bottom middle'
            self='top middle'
            :offset='[0, 20]'
          >Signout</q-tooltip>
        </q-btn>
        <q-btn
          color="secondary"
          @click="$q.fullscreen.toggle()"
          :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
        >
          <q-tooltip>
            Full Screen
          </q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model='playerDrawer'
      v-if='authenticated'
      bordered
      elevated
      content-class='bg-grey-1'
    >
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
          v-model="player_search"
          input-class="text-right"
          class="q-ml-md"
        >
          <template v-slot:append>
            <q-icon
              v-if="!player_search"
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
        <q-item-label header>{{room}} Players:</q-item-label>
        <q-separator />
        <q-expansion-item
          dense
          dense-toggle
          expand-separator
          v-for='p in myPlayers'
          :key='p.id'
        >
          <template v-slot:header>
            <q-item-section side>
              <div class="row items-center">
                <q-icon
                  :name='`img:statics/jbicon/seats/seat${p.seat.sId}.svg`'
                  size="24px"
                />
                <q-avatar size="24px">
                  <img :src='p.profile.avatar' />
                </q-avatar>
              </div>
            </q-item-section>

            <q-item-section>
              {{p.nick}}
            </q-item-section>

            <q-item-section
              avatar
              side
            >
              <q-icon
                dense
                :name='flag(p)'
                class="q-ml-md"
                size='sm'
              />
              <!--
                <q-badge
                  color="red"
                  floating
                  transparent
                >.</q-badge>
              </q-btn>
              -->
            </q-item-section>
          </template>
          <q-card>
            <q-card-actions>
              <q-btn
                dense
                flat
                disable
                size='sm'
              >Watch</q-btn>
              <q-btn
                dense
                flat
                disable
                size='sm'
              >Partner?</q-btn>
              <q-btn
                dense
                flat
                disable
                size='sm'
              >Join</q-btn>
            </q-card-actions>
            <q-separator dark />
            <q-card-section>
              <myMessages :to='p' />
            </q-card-section>
            <q-card-section>
              <div
                class='full-width'
                style='height:24px'
              >
                <myChat :to='p' />
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </q-drawer>
    <q-drawer
      side='right'
      overlay
      bordered
      elevated
      v-model='scoreBook'
      v-show='authenticated'
      :content-class="$q.theme === 'mat' ? 'bg-grey-3' : null"
      :content-style="{ fontSize: '16px' }"
    >
      <q-list
        separator
        bordered
        dense
      >
        <q-item-label
          header
          class='text-grey-8'
        >
          My ScoreBook:
        </q-item-label>
        <q-separator />
        <q-item
          v-for='r in results'
          :key='r._id'
        >
          <q-item-section>
            <q-item-label overline>
              {{r.board.bt}}#{{r.board.bn}}: by {{getPName(r)}}
            </q-item-label>
            <q-item-label>
              {{getContract(r)}}{{getResult(r)}}:
              <q-badge
                outline
                :color="getScore(r) >= 0 ? 'secondary' : 'warning'"
                :label='getScore(r)'
              />
            </q-item-label>
          </q-item-section>

          <q-item-section
            side
            top
          >
            <q-item-label caption>{{playedDate(r.playedAt)}}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view :user='user'></router-view>
    </q-page-container>
  </q-layout>
</template>

<script>
// import EssentialLink from 'components/EssentialLink'
import moment from 'moment'
import { mapState, mapGetters, mapActions } from 'vuex'
import { users$, players$, tables$, chats$, results$ } from 'src/api'
import auth from 'src/auth'

import myMessages from 'src/components/myMessages'
import myChat from 'src/components/myChat'

export default {
  name: 'MainLayout',

  components: {
    // EssentialLink,
    myMessages,
    myChat
  },

  data () {
    return {
      playerDrawer: false,
      // essentialLinks: [],
      scoreBook: this.$q.platform.is.desktop,
      page: '',
      user: null,
      room: '#Lobby',
      seatName: ['North', 'East', 'South', 'West'],
      player_search: null
    }
  },
  computed: {
    ...mapState('jstore', ['players', 'tables', 'results', 'roomId']),
    ...mapGetters('jstore', ['myPlayer', 'getTableById']),
    authenticated () {
      return this.user != null
    },
    myPlayers () {
      if (this.roomId) return this.players.filter(p => p.seat.tId === this.roomId)
      else return this.players
    }
  },
  methods: {
    ...mapActions('jstore', [
      'setUser',
      'setChat',
      'addPlayer',
      'addTable',
      'setPlayers',
      'setTables',
      'setResults',
      'addResult'
    ]),
    goTo (route) {
      if (this.$route.name !== route) this.$router.push({ name: route }).catch(e => { })
    },
    signin (user) {
      console.log('signin', user)
      this.updateUser(user)
      this.goTo('home')
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
        .catch((err) => {
          console.log(err)
          this.$q.notify({
            type: 'positive',
            message: 'Cannot logout, please check again in a few minutes'
          })
        })
    },
    getTName (p) {
      const t = this.getTableById(p.seat.tId)
      if (t) return t.name
      else return '#Lobby'
    },
    getPName (r) {
      const pId = r.players[r.bids.info.by - 1]
      if (pId) {
        const p = this.getPlayerById(pId)
        if (p) return p.nick
      }
      return this.seatName[r.bids.info.by - 1]
    },
    getContract (r) {
      if (r.bids.info.by === 0) return 'Passed hand'
      else {
        let c = r.bids.info.contract
        if (r.bids.info.XX) c += 'XX'
        else if (r.bids.info.X) c += 'X'
        // c += ' by ' + this.getPName(r)
        return c
      }
    },
    getResult (r) {
      if (r.result.result === 0) return '='
      else if (r.result.result > 0) return `+${r.result.result}`
      else return `-${r.result.result}`
    },
    getScore (r) {
      const by = (r.bids.info.by - 1) % 2
      return r.result.scores[by]
    },
    playedDate (playedAt) {
      return moment(playedAt).startOf('hour').fromNow()
    },
    updateUser (u) {
      this.user = u
      this.setUser(u)
    },
    updateChat (c) {
      this.setChat(c)
    },
    async onServices () {
      await tables$.find().then(response => {
        this.setTables(response.data)
      })
      tables$.on('created', t => {
        console.log('table created', t)
        this.addTable(t)
      })
      tables$.on('patched', t => {
        console.log('table patched', t)
        this.addTable(t)
      })
      tables$.on('removed', t => {
        console.log('table removed', t)
        t.state = -2
        this.addTable(t)
      })
      users$.on('patched', user => {
        if (user._id === this.user._id) {
          this.updateUser(user)
        }
      })
      await players$.find().then(response => {
        this.setPlayers(response.data)
      })
      players$.on('created', p => {
        // console.log('create player', p, this.user)
        if (p.id === this.user._id) {
          if (this.user.seat.tId) { // rejoin
            const t = this.getTableById(this.user.seat.tId) // if table still exists
            if (t) {
              const seat = {
                tId: this.user.seat.tId,
                sId: this.user.seat.sId,
                tId0: null
              }
              players$.patch(p.id, { seat })
            }
          }
          this.$data.myPlayer = p
        }
        this.addPlayer(p)
        if (!this.myPlayer.tId) {
          this.$q.notify({
            color: 'into',
            message: `[JOIN]: ${p.nick}`
          })
        }
      })
      players$.on('patched', p => {
        console.log('player patched', p)
        this.addPlayer(p)
      })
      players$.on('removed', p => {
        console.log('player removed', p)
        p.state = -1
        this.addPlayer(p)
        if (!this.myPlayer.tId) {
          this.$q.notify({
            color: 'into',
            message: `[EXIT]: ${p.nick}`
          })
        }
      })
      chats$.on('created', chat => {
        // if (chat.to === '#Lobby') this.myChats.unshift(chat)
        this.updateChat(chat)
      })
      results$.find({
        /*
        query: {
          players: { $in: this.user._id }
        }
        */
      }).then(response => {
        if (response.data.length > 0) this.setResults(response.data)
      })
      results$.on('created', r => {
        console.log('create result', r)
        if (r.players.includes(this.user._id)) this.addResult(r)
      })
    },
    flag (p) {
      if (p) {
        const f = p.profile.flag.toLowerCase()
        return `img:statics/flags/4x3/${f}.svg`
      }
      return null
    }
  },
  mounted () {
    // Check if there is already a session running
    auth
      .login()
      .then(user => {
        this.signin(user.user)
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
      this.signin(user)
    })

    // On logout
    auth.onLogout(() => {
      this.goTo('home')
      this.user = null
      this.myPlayer = null
    })
  },
  watch: {
    user (u, o) {
      if (u) {
        this.onServices()
        this.playerDrawer = true
      } else this.goTo('home')
    },
    myPlayer (p) {
      if (p) this.goTo('lobby')
      else this.goTo('home')
    },
    roomId (n, o) {
      this.room = n ? 'My Table' : '#Lobby'
    }
  },
  beforeDestroy () { }
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
