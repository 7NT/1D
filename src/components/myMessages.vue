<template>
  <div
    class='fit'
    v-if='!!roomId'
    v-show='!$q.fullscreen.isActive'
  >
    <q-expansion-item
        expand-separator
        icon="message"
        v-model="newMsg"
        :label='msgHeader'
      >
      <q-card
        flat
        bordered
      >
        <q-chat-message
          v-for="chat in myChats"
          :key='chat.id'
          :name='chat.from.nick'
          :avatar='getAvatar(chat.from.id)'
          :text='[chat.text]'
          :stamp='chatDate(chat.created)'
          :sent='isSent(chat.from.id) ? true : false'
        />
      </q-card>
    </q-expansion-item>
  </div>
</template>

<script>
import * as moment from 'moment'
import { mapState, mapGetters } from 'vuex'
import { jbGetNick, jbAvatar } from 'src/jbPlayer'

export default {
  name: 'myMessages',
  props: ['roomId'],

  data: () => ({
    newMsg: false
  }),
  computed: {
    ...mapState('jstore', ['jsUser', 'jsChats']),
    ...mapGetters('jstore', ['jsPlayer', 'jsPlayerById']),

    myChats () {
      let chats = this.jsChats
      const room = this.getFrom()
      if (room.startsWith('@')) {
        chats = this.jsChats
          .filter(m0 => m0.to.startsWith('@'))
          .filter(m1 => m1.to === `@${this.jsUser._id}` || this.isSent(m1.from.id))
      } else chats = this.jsChats.filter(m => m.to === room)
      return chats.slice(-10).reverse()
    },
    msgHeader () {
      if (this.roomId.startsWith('@')) return '@Private Messages:'
      else if (this.roomId === '#Lobby') return '#Lobby Messages:'
      else return '#Table Messages:'
    }
  },
  methods: {
    isSent (from) {
      return from === this.jsUser._id
    },
    getFroom () {
      if (!this.roomId) return null
      else if (this.roomId === 1) return this.jsPlayer.seat.tId
      else if (this.roomId.startsWith('@') || this.roomId.startsWith('#')) return this.roomId
      else return null
    },
    getNick (pId) {
      return jbGetNick(this.jsPlayerById(pId))
    },
    getAvatar (pId) {
      return jbAvatar(this.jsPlayerById(pId))
    },
    chatDate (created) {
      return moment(created).fromNow()
    }
  },
  watch: {
    myChats (n) {
      this.newMsg = true
    }
  }
}
</script>
<style scoped>
.box {
  max-height: 25vh;
}
.messages {
  width: 100%;
  height: auto;
  overflow-y: hidden;
}
</style>
