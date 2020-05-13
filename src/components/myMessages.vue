<template>
  <div
    class='fit'
    v-if='to'
  >
    <q-card
      flat
      bordered
    >
      <div class="text-overline text-orange-9">{{to.name || 'Private'}} Messages:</div>
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
  props: ['to'],
  data () {
    return {}
  },
  computed: {
    ...mapState('jstore', ['myUser', 'chats']),
    myChats () {
      return this.chats.filter(m => m.to === (this.to.name || this.to.nick)).slice(-10).reverse()
    }
  },
  methods: {
    isSent (from) {
      return from._id === this.myUser._id
    },
    chatDate (createdAt) {
      return moment(createdAt).format('MMM Do, hh:mm:ss')
      // return moments(createdAt).formNow()
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
