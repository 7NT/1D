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
          icon='contacts'
          @click='playerList = !playerList'
          aria-label='Player List...'
          v-show='authenticated'
        />
        <q-btn
          flat
          round
          @click="goTo('profile')"
          v-if='authenticated'
        >
          <q-avatar class='gt-xs'>
            <img :src='user.avatar' />
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
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model='playerDrawer'
      bordered
      elevated
      content-class='bg-grey-1'
    >
      <q-toolbar class="bg-primary text-white rounded-borders">
        <q-btn round dense flat icon="group" class="q-mr-xs" />

        <q-space />

        <q-input dark dense standout v-model="playerWho" input-class="text-right" class="q-ml-md">
          <template v-slot:append>
            <q-icon v-if="playerWho === ''" name="search" />
            <q-icon v-else name="clear" class="cursor-pointer" @click="text = ''" />
          </template>
        </q-input>
      </q-toolbar>

      <q-list bordered>
        <q-item
          v-for='p in players'
          :key='p.id'
          class='q-my-sm'
          clickable
          v-ripple
        >
          <q-item-section avatar>
            <q-icon :name='`img:statics/jbicon/seats/seat${p.sId}.svg`' class='seat' />
          </q-item-section>
          <q-item-section avatar>
            <q-avatar
              color='secondary'
              text-color='white'
            >
              <img :src='p.avatar' />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ p.nick }}</q-item-label>
            <q-item-label
              caption
              lines='1'
            >@{{ p.tId }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon
              name='chat_bubble'
              color='green'
            />
          </q-item-section>
        </q-item>
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
          Essential Links
        </q-item-label>
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
import { mapState, mapActions } from 'vuex'
import { userService, playerService, tableService } from 'src/api'
import auth from 'src/auth'

export default {
  name: 'MainLayout',

  components: {
    EssentialLink
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
      playerWho: null
    }
  },
  computed: {
    ...mapState('jstore', ['players', 'tables']),
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
        .catch(() => {
          this.$q.notify({
            type: 'positive',
            message: 'Cannot logout, please check again in a few minutes'
          })
        })
    },
    updateUser (user) {
      this.user = user
      this.setUser(user)
    },
    updatePlayer (player) {
      this.setPlayer(player)
    },
    updateTable (table) {
      this.setTable(table)
    },
    updateChat (chat) {
      this.setChat(chat)
    },
    onServices () {
      userService.on('update', user => {
        this.updateUser(user)
      })
      playerService.find().then(response => {
        // console.log('players', response)
        this.setPlayers(response.data)
      })
      playerService.on('created', player => {
        // console.log('create player', player)
        this.updatePlayer(player)
      })
      playerService.on('patched', player => {
        console.log('player patched', player)
        this.updatePlayer(player)
      })
      playerService.on('removed', player => {
        // console.log('player removed', player)
        player.state = -1
        this.updatePlayer(player)
      })
      tableService.find().then(response => {
        this.setTables(response.data)
      })
      tableService.on('created', table => {
        console.log('table created', table)
        this.updateTable(table)
      })
      tableService.on('patched', table => {
        console.log('table patched', table)
        this.updateTable(table)
      })
      tableService.on('removed', table => {
        console.log('table remove', table)
        table.state = -1
        this.updateTable(table)
      })
      /*
      chatService.on('created', chat => {
        // if (chat.to === '#Lobby') this.myChats.unshift(chat)
        this.updateChat(chat)
      })
      */
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
