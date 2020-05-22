<template>
  <div class='fit'>
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
          :key='chat._id'
          :name='chat.from.nick'
          :avatar='chat.from.profile.avatar'
          :text='[chat.text]'
          :stamp='chatDate(chat.createdAt)'
          :sent='isSent(chat.from) ? true : false'
        />
      </div>
    </q-card>
  </div>
</template>

<script>
import * as moment from 'moment'
import { mapState } from 'vuex'

export default {
  name: 'myMessages',
  props: ['sendTo'],
  data () {
    return {}
  },
  computed: {
    ...mapState('jstore', ['myUser', 'chats']),
    myChats () {
      if (this.sendTo.startsWith('@')) {
        return this.chats.filter(m => {
          return m.to === `@${this.myUser._id}` || m.userId === this.myUser._id
        }).slice(-10).reverse()
      } else return this.chats.filter(m => m.to === this.sendTo).slice(-10).reverse()
    },
    msgFrom () {
      if (this.sendTo.startsWith('@')) return '@Private'
      else if (this.sendTo === '#Lobby') return '#Lobby'
      else return '#Table'
    }
  },
  methods: {
    isSent (from) {
      return from._id === this.myUser._id
    },
    chatDate (createdAt) {
      // return moment(createdAt).format('MMM Do, hh:mm:ss')
      return moment(createdAt).fromNow()
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
