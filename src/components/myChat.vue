<template>
  <q-toolbar class="bg-primary text-white rounded-borders" v-show='!$q.fullscreen.isActive'>
    <q-btn round dense flat icon="chat" class="q-mr-xs" />
    <q-space />
    <div class="full-width">
      <q-input
        dark
        dense
        standout
        autofocus
        color="silver"
        label="Chat"
        v-model="chat"
        @keypress="onChat"
      >
        <template v-slot:append>
          <q-icon v-if="!chat" name="chat" />
          <q-icon v-else name="clear" class="cursor-pointer" @click="!chat" />
        </template>
      </q-input>
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
        console.log(chatData)
        this.chat = null
      }
    }
  }
}
</script>
