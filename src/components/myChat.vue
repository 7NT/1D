<template>
  <q-toolbar class="bg-primary text-white rounded-borders" v-show='!$q.fullscreen.isActive'>
    <q-btn round dense flat disable :icon='micIcon' @click='onMic' class="q-mr-xs" />
    <q-space />
    <div class="full-width">
      <q-input
        dark
        dense
        standout
        autofocus
        clearable
        color="silver"
        label="Chat"
        v-model="chat"
        icon="mic"
        clear-icon="clear"
        @keypress="onChat"
      />
    </div>
  </q-toolbar>
</template>

<script>
import { chats$ } from 'src/api'
// import SpeechToText from '../services/speech-to-text'

export default {
  name: 'myChat',
  props: ['sendTo'],

  data: () => ({
    chat: null,
    isSpeaking: false,
    speech: '',
    speechService: {}
  }),
  computed: {
    micIcon () {
      return this.isSpeaking ? 'mic' : 'mic_off'
    }
  },
  methods: {
    onChat (event) {
      if (event.key === 'Enter') this.send()
    },
    send () {
      if (this.chat) {
        const chatData = {
          to: this.sendTo,
          text: this.chat
        }
        chats$.create(chatData)
        console.log(chatData)
        this.chat = null
      }
    },
    onMic () {
      this.isSpeaking = true
      this.speechService.speak().subscribe(
        (result) => {
          this.speech = result
          this.$emit('speech', this.speech)
          this.isSpeaking = false
          console.log('Result', result)
        },
        (error) => {
          console.log('Error', error)
          this.isSpeaking = false
        },
        () => {
          this.isSpeaking = false
        }
      )
      console.log('speechService started')
    },
    offMic () {
      this.isSpeaking = false
    }
  },
  created () {
    // this.speechService = new SpeechToText()
  }
}
</script>
