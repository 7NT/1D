<template>
  <q-toolbar class="bg-primary text-white rounded-borders" :v-show='isShow'>
    <q-space />
    <div class="full-width">
      <q-input
        dark
        dense
        standout
        autofocus
        clearable
        color="silver"
        label="Chat"
        v-model="chat"
        icon="chat"
        clear-icon="clear"
        @keypress="onChat"
      />
    </div>
  </q-toolbar>
</template>

<script>
import { mapGetters } from 'vuex'
import { chats$ } from 'src/api'

export default {
  name: 'myChat',
  props: ['roomId'],

  data: () => ({
    chat: null
  }),
  computed: {
    ...mapGetters('jstore', ['jsPlayer']),

    isShow () {
      if (this.roomId === 1 && this.$q.fullscreen.isActive) {
        return this.$q.screen.height > this.$q.screen.width
      } else return true
    }
  },
  methods: {
    onChat (event) {
      if (event.key === 'Enter') this.send()
    },
    send () {
      if (this.chat) {
        const chatData = {
          to: this.getSendTo(),
          text: this.chat
        }
        chats$.create(chatData)
        this.chat = null
      }
    },
    getSendTo () {
      if (!this.roomId) return '#Lobby'
      else if (this.roomId === 1) return this.jsPlayer.seat.tId
      else if (this.roomId.startsWith('@') || this.roomId.startsWith('#')) return this.roomId
      else return '#Lobby'
    }
  },
  created () {}
}
</script>
