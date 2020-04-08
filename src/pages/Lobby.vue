<template>
  <q-page class="no-padding no-margin">
    <!-- content -->
    <div class="no-padding no-margin">
      <q-splitter
        v-model='splitterModel'
        horizontal
        :separator-style="{ backgroundColor: '#ff0000' }"
        :unit="'px'"
        :limits='[460, Infinity]'
      >
        <template v-slot:before>
          <div class='q-pa-md'>
            <q-card>
              <q-tabs
                v-model='model_RID'
                align='left'
                dense
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
                  :label='r.label'
                  :disable='!r.open'
                />
              </q-tabs>

              <q-separator />

              <q-tab-panels
                keep-alive
                v-model='model_RID'
                animated
              >
                <q-tab-panel :name='0'>
                  <q-list
                    dense
                    bordered
                    separator
                  >
                    <myTableList
                      v-for='t in tables'
                      :key='t.id'
                      :myTable='t'
                      v-on:onSit='onSit'
                    />
                  </q-list>
                </q-tab-panel>

                <q-tab-panel
                  :name='1'
                  class="no-margin no-padding"
                >
                  <myPlayTable
                    v-on:onSit='onSit'
                    class='myTable'
                  />
                </q-tab-panel>
              </q-tab-panels>
            </q-card>
          </div>
        </template>

        <template v-slot:after>
          <div class='q-pa-md'>
            <q-expansion-item
              default-opened
              dense
              icon='chat'
              :label='chatTo'
              header-class='myChats'
            >
              <q-separator />
              <q-card class='full-width myChats'>
                <q-chat-message
                  v-for="chat in roomChats"
                  :key='chat._id'
                  :name='chat.from.nick'
                  :avatar='chat.from.avatar'
                  :text='[chat.text]'
                  :stamp='chatDate(chat.createdAt)'
                  :sent='isSent(chat.from) ? true : false'
                />
              </q-card>
            </q-expansion-item>
          </div>
        </template>
      </q-splitter>
    </div>
    <q-footer elevated>
      <q-toolbar class='bg-primary text-white rounded-borders'>
        <q-btn
          round
          dense
          flat
          icon='menu'
          class='q-mr-xs'
        />
        <q-avatar class='gt-xs'>
          <img :src='user.avatar' />
        </q-avatar>
        <q-space />
        <div class='full-width'>
          <q-input
            dark
            autofocus
            standout
            v-model='chat'
            @keypress='onChat'
          >
            <template v-slot:append>
              <q-icon
                v-if='!chat'
                name='chat'
              />
              <q-icon
                v-else
                name='clear'
                class='cursor-pointer'
                @click='chat = null'
              />
            </template>
          </q-input>
        </div>
        <q-btn
          flat
          round
          dense
          icon='menu'
          @click='right = !right'
          aria-label='Toggle menu on right side'
        />
      </q-toolbar>
    </q-footer>
  </q-page>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import moment from 'moment'
import { playerService, chatService } from 'src/api'
import myTableList from 'src/components/myTableList'
import myPlayTable from 'src/components/myPlayTable'

export default {
  name: 'Lobby',
  components: {
    myTableList,
    myPlayTable
  },
  data () {
    return {
      user: null,
      splitterModel: 50, // start at 50%
      model_RID: 0,
      rooms: [
        {
          label: 'Lobby',
          value: 0,
          icon: 'people',
          open: true
        },
        {
          label: 'My Table',
          value: 1,
          icon: 'portrait',
          open: true
        },
        {
          label: 'Tourney',
          value: 2,
          icon: 'person_add',
          open: false
        },
        {
          label: 'Team Game',
          value: 4,
          icon: 'group_add',
          open: false
        }
      ],
      MIX: ['MP', 'IMP', 'XIMP'],
      myBT: null,
      chat: null,
      chatTo: '#Lobby',
      myChats: []
    }
  },
  computed: {
    ...mapState('jstore', ['players', 'tables']),
    ...mapGetters('jstore', ['myPlayer', 'getChats']),
    getChat () {
      const c = this.getChats(this.chatTo)
      console.log('c', this.chatTo, c)
      return c
    },
    roomChats: function () {
      return this.myChats.filter(chat => chat.to === this.chatTo)
    }
  },
  methods: {
    onChat (event) {
      if (event.key === 'Enter') {
        this.send()
      }
    },
    send () {
      if (this.chat) {
        const _chat = {
          to: this.chatTo || '#Lobby',
          text: this.chat
        }

        chatService.create(_chat).then(() => {
          this.chat = null
        })
      }
    },
    isSent (from) {
      // return from.userId === this.user._id
      return from._id === this.user._id
    },
    chatDate (createdAt) {
      return moment(createdAt).format('MMM Do, hh:mm:ss')
    },
    onSit (seat) {
      // console.log(this.user, seat)
      playerService.patch(this.user._id, seat)
    }
  },
  mounted () {
    console.log(this.user)
    if (!this.user.country) this.$router.push({ name: 'profile' })
    chatService.on('created', chat => {
      // if (chat.to === '#Lobby')
      this.myChats.unshift(chat)
      // this.updateChat(chat)
      console.log('c', this.myChats)
    })
  },
  watch: {
    model_RID (n) {
      if (n === 1) {
        if (this.myPlayer.tId) this.chatTo = `#${this.myPlayer.tId}`
        else this.onSit({ tId: this.myPlayer.id, sId: 0 })
      } else {
        this.chatTo = '#Lobby'
      }
      // this.myChats = this.getChats(this.chatTo)
    },
    myPlayer (n, o) {
      if (n.tId) this.model_RID = 1
    }
  },
  created () {
    this.$parent.page = 'Lobby'
    this.user = this.$attrs.user
  }
}
</script>
