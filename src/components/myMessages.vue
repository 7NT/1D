<template>
  <div class="fit" v-if='!!chatTo'>
    <q-card
      flat
      bordered
    >
      <q-card-section class="bg-primary text-white">
        <div class="overline">{{ myRoom }}</div>
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
  props: ['chatTo'],

  data: () => ({}),
  computed: {
    ...mapState('jstore', ['jsUser', 'jsChats']),
    ...mapGetters('jstore', ['jsPlayer', 'jsPlayerById']),

    myChats () {
      let chats = this.jsChats
      if (this.chatTo.id.startsWith('#')) {
        chats = this.jsChats.filter((m) => m.to === this.chatTo.id)
      } else { // private
        chats = this.jsChats
          .filter((m0) => m0.to.startsWith('@'))
          .filter((m1) => m1.to === `@${this.jsUser._id}` || this.isSent(m1.from.id))
      }

      return chats.slice(-10).reverse()
    },
    myRoom () {
      try {
        if (this.chatTo.id === '#Lobby') {
          return 'Public Lobby Messages'
        } else if (this.chatTo.id.startsWith('#')) {
          return 'Public Table Messages'
        } else {
          return `${this.chatTo.nick}: Private Messages`
        }
      } catch (err) { }
      return this.chatTo.id
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
      if (pId === '@info') return '/jbIcon/seats/seat0.svg'
      else return jbAvatar(this.jsPlayerById(pId))
    },
    chatDate (created) {
      return moment(created).fromNow()
    }
  }
}
</script>

<style scoped>
</style>
