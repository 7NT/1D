<template>
  <div class="fit">
    <q-card flat bordered>
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">{{ room.header }}</div>
        <div class="text-subtitle2">{{ room.type }}</div>
      </q-card-section>
      <q-chat-message
        v-for="chat in myChats"
        :key="chat.id"
        :name="chat.from.nick"
        :avatar="getAvatar(chat.from.id)"
        :text="[chat.text]"
        :stamp="chatDate(chat.created)"
        :sent="isSent(chat.from.id) ? true : false"
      />
    </q-card>
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
    room: { name: '#Lobby', header: 'Lobby Messages', type: 'Public' }
  }),
  computed: {
    ...mapState('jstore', ['jsUser', 'jsChats']),
    ...mapGetters('jstore', ['jsPlayer', 'jsPlayerById']),

    myChats () {
      let chats = this.jsChats

      if (this.room.name.startsWith('@')) {
        chats = this.jsChats
          .filter((m0) => m0.to.startsWith('@'))
          .filter(
            (m1) => m1.to === `@${this.jsUser._id}` || this.isSent(m1.from.id)
          )
      } else chats = this.jsChats.filter((m) => m.to === this.room.name)

      return chats.slice(-10).reverse()
    }
  },
  methods: {
    isSent (from) {
      return from === this.jsUser._id
    },
    getNick (pId) {
      return jbGetNick(this.jsPlayerById(pId))
    },
    getAvatar (pId) {
      if (pId === '@info') return '/jbicon/seats/seat0.svg'
      else return jbAvatar(this.jsPlayerById(pId))
    },
    chatDate (created) {
      return moment(created).fromNow()
    }
  },
  watch: {
    roomId (r) {
      try {
        if (r === 1) {
          this.room = { name: this.jsPlayer.seat.tId || '#Lobby', header: 'Table Messages', type: 'Public' }
        } else if (r.startsWith('@')) {
          this.room = { name: r, header: 'Player Messages', type: 'Private' }
        } else if (r.startsWith('#')) {
          this.room = { name: r, header: 'Table Messages', type: 'Public' }
        }
      } catch (err) {
        this.room = { name: '#Lobby', header: 'Lobby Messages', type: 'Public' }
      }
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
