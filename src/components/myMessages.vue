<template>
  <div
    class='fit'
    v-if='!!sendTo'
  >
    <q-card
      flat
      bordered
    >
      <div class="text-overline text-orange-9">{{msgFrom}} Messages:</div>
      <q-separator
        color="orange"
        inset
      />
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
  </div>
</template>

<script>
import * as moment from 'moment'
import { mapState, mapGetters } from 'vuex'
import { jbGetNick, jbAvatar } from 'src/jbPlayer'

export default {
  name: 'myMessages',
  props: ['sendTo'],

  data: () => ({}),
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
    msgFrom () {
      if (this.sendTo.startsWith('@')) return '@Private'
      else if (this.sendTo === '#Lobby') return '#Lobby'
      else return '#Table'
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
  }
}
</script>
<style scoped>
.box {
  max-height: 50vh;
}
.messages {
  width: 100%;
  height: auto;
  overflow-y: hidden;
}
</style>
