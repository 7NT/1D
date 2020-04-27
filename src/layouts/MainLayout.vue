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
          Quasar App
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
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
          @click="goTo('home')"
          v-if='authenticated'
        >
          <q-icon name='home' />
          <q-tooltip
            anchor='bottom middle'
            self='top middle'
            :offset='[0, 20]'
          >Home</q-tooltip>
        </q-btn>
        <q-btn
          flat
          round
          dense
          icon='menu_book'
          @click='playerList = !playerList'
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
          v-model="who"
          input-class="text-right"
          class="q-ml-md"
        >
          <template v-slot:append>
            <q-icon
              v-if="who === ''"
              name="search"
            />
            <q-icon
              v-else
              name="clear"
              class="cursor-pointer"
              @click="who = ''"
            />
          </template>
        </q-input>
      </q-toolbar>

      <q-list bordered>
        <q-expansion-item
          dense
          dense-toggle
          expand-separator
          v-for='p in players'
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
      v-model='playerList'
      v-show='authenticated'
      :content-class="$q.theme === 'mat' ? 'bg-grey-3' : null"
      :content-style="{ fontSize: '16px' }"
    >
      <q-list>
        <q-item-label
          header
          class='text-grey-8'
        >
          My ScoreBook:
        </q-item-label>
        <q-separator />
        <EssentialLink
          v-for='link in essentialLinks'
          :key='link.title'
          v-bind='link'
        />
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view :user='user'></router-view>
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink'
import { mapState, mapGetters, mapActions } from 'vuex'
import { userService, playerService, tableService, chatService } from 'src/api'
import auth from 'src/auth'

import myMessages from 'src/components/myMessages'
import myChat from 'src/components/myChat'

export default {
  name: 'MainLayout',

  components: {
    EssentialLink,
    myMessages,
    myChat
  },

  data () {
    return {
      playerDrawer: false,
      essentialLinks: [],
      /*
        {
          title: 'Docs',
          caption: 'quasar.dev',
          icon: 'school',
          link: 'https://quasar.dev'
        },
        {
          title: 'Github',
          caption: 'github.com/quasarframework',
          icon: 'code',
          link: 'https://github.com/quasarframework'
        },
        {
          title: 'Discord Chat Channel',
          caption: 'chat.quasar.dev',
          icon: 'chat',
          link: 'https://chat.quasar.dev'
        },
        {
          title: 'Forum',
          caption: 'forum.quasar.dev',
          icon: 'record_voice_over',
          link: 'https://forum.quasar.dev'
        },
        {
          title: 'Twitter',
          caption: '@quasarframework',
          icon: 'rss_feed',
          link: 'https://twitter.quasar.dev'
        },
        {
          title: 'Facebook',
          caption: '@QuasarFramework',
          icon: 'public',
          link: 'https://facebook.quasar.dev'
        }
      ],
      */
      playerList: this.$q.platform.is.desktop,
      page: '',
      user: null,
      player: null,
      who: ''
    }
  },
  computed: {
    ...mapState('jstore', ['players', 'tables']),
    ...mapGetters('jstore', ['getTableById']),
    authenticated () {
      return this.user != null
    }
  },
  methods: {
    ...mapActions('jstore', [
      'setUser',
      'setChat',
      'setPlayer',
      'setTable',
      'setPlayers',
      'setTables'
    ]),
    goTo (route) {
      if (this.$route.name !== route) this.$router.push({ name: route }).catch(e => { })
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
    updateUser (u) {
      this.user = u
      this.setUser(u)
    },
    updatePlayer (p) {
      this.setPlayer(p)
    },
    updateTable (t) {
      this.setTable(t)
    },
    updateChat (c) {
      this.setChat(c)
    },
    async onServices () {
      await tableService.find().then(response => {
        this.setTables(response.data)
      })
      tableService.on('created', t => {
        console.log('table created', t)
        this.updateTable(t)
      })
      tableService.on('patched', t => {
        console.log('table patched', t)
        this.updateTable(t)
      })
      tableService.on('removed', t => {
        console.log('table removed', t)
        t.state = -1
        this.updateTable(t)
      })
      userService.on('patched', user => {
        if (user._id === this.user._id) {
          this.updateUser(user)
        }
      })
      await playerService.find().then(response => {
        this.setPlayers(response.data)
      })
      playerService.on('created', p => {
        console.log('create player', p, this.user)
        if (p.id === this.user._id) {
          this.player = p
          if (this.user.seat.tId) { // rejoin
            const t = this.getTableById(this.user.seat.tId) // if table still exists
            console.log('rejoin player', p, t)
            if (t) {
              const seat = {
                tId: this.user.seat.tId,
                sId: this.user.seat.sId,
                tId0: null
              }
              playerService.patch(p.id, { seat })
              return
            }
          }
        }
        this.updatePlayer(p)
        this.$q.notify({
          color: 'into',
          message: `[JOIN]: ${p.nick}`
        })
      })
      playerService.on('patched', p => {
        console.log('player patched', p)
        this.updatePlayer(p)
      })
      playerService.on('removed', p => {
        console.log('player removed', p)
        p.state = -1
        this.updatePlayer(p)
        this.$q.notify({
          color: 'into',
          message: `[EXIT]: ${p.nick}`
        })
      })
      chatService.on('created', chat => {
        // if (chat.to === '#Lobby') this.myChats.unshift(chat)
        this.updateChat(chat)
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
      this.updateUser(user)
      this.onServices()
      this.playerDrawer = true
      this.goTo('lobby')
    })

    // On logout
    auth.onLogout(() => {
      this.goTo('home')
      this.user = null
    })
  },
  watch: {},
  beforeDestroy () { }
}
</script>
<style scoped>
.seat {
  width: 24px;
  height: 30px;
  margin: 0px;
}
</style>
