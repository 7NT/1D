<template>
  <q-toolbar class='bg-primary text-white rounded-borders'>
    <q-btn
      round
      dense
      flat
      :icon='to.icon'
      class='q-mr-xs'
    />
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
  </q-toolbar>
</template>

<script>
import { chats$ } from 'src/api'

export default {
  name: 'myChat',
  props: ['to'],
  data () {
    return {
      chat: null
    }
  },
  computed: {},
  methods: {
    onChat (event) {
      if (event.key === 'Enter') {
        this.send()
      }
    },
    send () {
      if (this.chat) {
        const chatData = {
          to: this.to.name || this.to.nick,
          text: this.chat
        }
        chats$.create(chatData).then(() => {
          this.chat = null
        })
      }
    }
  }
}
</script>
