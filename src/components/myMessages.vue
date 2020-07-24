<template>
  <div
    class='fit'
    :v-show='isShow()'
  >
    <q-expansion-item
      class="shadow-1 overflow-hidden"
      header-class="bg-primary text-white"
      expand-icon-class="text-white"
      expand-separator
      icon="message"
      color="info"
      :label='msgHeader()'
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

  data: () => ({}),
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
    }
  },
  methods: {
    isSent (from) {
      return from === this.jsUser._id
    },
    getFrom () {
      if (!this.roomId) return '#Lobby'
      else if (this.roomId === 1) return this.jsPlayer.seat.tId
      else if (this.roomId.startsWith('@') || this.roomId.startsWith('#')) return this.roomId
      else return '#Lobby'
    },
    msgHeader () {
      const room = this.getFrom()
      if (room === '#Lobby') return '#Lobby Messages:'
      else if (room.startsWith('#')) return '#Table Messages:'
      else if (room.startsWith('@')) return '@Private Messages:'
      else return '#Lobby Messages:'
    },
    getNick (pId) {
      return jbGetNick(this.jsPlayerById(pId))
    },
    getAvatar (pId) {
      return jbAvatar(this.jsPlayerById(pId))
    },
    chatDate (created) {
      return moment(created).fromNow()
    },
    isShow () {
      if (this.roomId === 1 && this.$q.fullscreen.isActive) {
        return this.$q.screen.height > this.$q.screen.width
      } else return true
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
