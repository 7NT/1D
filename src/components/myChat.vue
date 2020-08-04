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
        :disable="!canChat"
        @keypress="onChat"
      />
    </div>
  </q-toolbar>
</template>

<script>
import { mapGetters } from 'vuex'
import { chats$ } from 'src/api'

import { jbIsPlayer } from 'src/jbPlayer'

export default {
  name: 'myChat',
  props: ['chatTo'],

  data: () => ({
    chat: null
  }),
  computed: {
    ...mapGetters('jstore', ['jsPlayer']),

    canChat () {
      if (this.chatTo.id.startsWith('#')) return true
      else if (this.chatTo.seat.tId === this.jsPlayer.seat.tId) {
        const s0 = this.chatTo.seat.sId || 0
        const s1 = this.jsPlayer.seat.sId || 0
        if (jbIsPlayer(s0) || jbIsPlayer(s1)) {
          return (this.chatTo.seat.sId % 2) !== (this.jsPlayer.seat.sId % 2)
        }
      }
      return true
    },
    chatWho () {
      if (this.chatTo.id.startsWith('#')) return this.chatTo.id
      return `@${this.chatTo.id}`
    }
  },
  methods: {
    onChat (event) {
      if (event.key === 'Enter') this.send()
    },
    send () {
      if (this.chat) {
        const chatData = {
          to: this.chatWho,
          text: this.chat
        }
        chats$.create(chatData)
        this.chat = null
      }
    }
  },
  created () {}
}
</script>
