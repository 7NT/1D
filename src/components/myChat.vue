<template>
  <q-toolbar class="bg-primary text-white rounded-borders" v-show='!$q.fullscreen.isActive'>
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
import { chats$ } from 'src/api'

export default {
  name: 'myChat',
  props: ['sendTo'],

  data: () => ({
    chat: null
  }),
  computed: {},
  methods: {
    onChat (event) {
      if (event.key === 'Enter') this.send()
    },
    send () {
      if (this.chat) {
        const chatData = {
          to: this.sendTo,
          text: this.chat
        }
        chats$.create(chatData)
        // console.log(chatData)
        this.chat = null
      }
    }
  },
  created () {
    // this.speechService = new SpeechToText()
  }
}
</script>
