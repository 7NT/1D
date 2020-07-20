<template>
  <div
    class='fit'
    v-if='!!sendTo'
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
        <div class='messages'>
          <q-chat-message
            v-for="chat in myChats"
            :key='chat.id'
            :name='chat.from.nick'
            :avatar='getAvatar(chat.from.id)'
            :text='[chat.text]'
            :stamp='chatDate(chat.created)'
            :sent='isSent(chat.from.id) ? true : false'
          />
        </div>
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
  props: ['sendTo'],

  data: () => ({
    newMsg: false
  }),
  computed: {
    ...mapState('jstore', ['jsUser', 'jsChats']),
    ...mapGetters('jstore', ['jsPlayerById']),

    myChats () {
      if (this.sendTo.startsWith('@')) {
        return this.jsChats
          .filter(m0 => m0.to.startsWith('@'))
          .filter(m1 => m1.to === `@${this.jsUser._id}` || this.isSent(m1.from.id))
          .slice(-10).reverse()
      } else return this.jsChats.filter(m => m.to === this.sendTo).slice(-10).reverse()
    },
    msgHeader () {
      if (this.sendTo.startsWith('@')) return '@Private Messages:'
      else if (this.sendTo === '#Lobby') return '#Lobby Messages:'
      else return '#Table Messages:'
    }
  },
  methods: {
    isSent (from) {
      // return jbSameId(from, this.jsUser._id)
      return from === this.jsUser._id
    },
    getNick (pId) {
      return jbGetNick(this.jsPlayerById(pId))
    },
    getAvatar (pId) {
      return jbAvatar(this.jsPlayerById(pId))
    },
    chatDate (created) {
      // return moment(created).format('MMM Do, hh:mm:ss')
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
