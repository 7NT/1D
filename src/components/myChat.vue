<template>
  <q-toolbar class="bg-primary text-white rounded-borders">
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
    chat: null,
    chatTo: null
  }),
  computed: {
    ...mapGetters('jstore', ['jsPlayer'])
  },
  methods: {
    onChat (event) {
      if (event.key === 'Enter') this.send()
    },
    send () {
      if (this.chat) {
        const chatData = {
          to: this.chatTo || '#Lobby',
          text: this.chat
        }
        chats$.create(chatData)
        this.chat = null
      }
    }
  },
  watch: {
    roomId (r) {
      try {
        this.chatTo = '#Lobby'
        if (r === 1) {
          this.chatTo = this.jsPlayer.seat.tId || '#Lobby'
        } else if (r.startsWith('@') || r.startsWith('#')) {
          this.chatTo = r
        }
      } catch (err) {
        this.chatTo = '#Lobby'
      }
    }
  },
  created () {}
}
</script>
