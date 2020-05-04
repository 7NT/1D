<template>
  <div
    class="q-ma-md fit"
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
import moment from 'moment'
import { mapState } from 'vuex'

export default {
  name: 'myMessages',
  props: ['to'],
  data () {
    return {}
  },
  computed: {
    ...mapState('jstore', ['user', 'chats']),
    myChats () {
      return this.chats.filter(m => m.to === (this.to.name || this.to.nick)).reverse()
    }
  },
  methods: {
    isSent (from) {
      return from._id === this.user._id
    },
    chatDate (createdAt) {
      return moment(createdAt).format('MMM Do, hh:mm:ss')
    }
  }
}
</script>
<style scoped>
.messages {
  min-width: auto;
  min-height: auto;
  align-items: stretch;
  flex: 1 1 auto;
  overflow-y: hidden;
}
</style>
