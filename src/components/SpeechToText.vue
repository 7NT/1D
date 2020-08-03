<template>
  <div v-if='!$q.platform.is.mac'>
    <q-btn
      fab
      color="red"
      @click="onMic"
      :icon="isSpeaking ? 'mic' : 'mic_off'"
    />
  </div>
</template>

<script>
import SpeechToText from '../services/speech-to-text'
import { mapActions } from 'vuex'

export default {
  name: 'SpeechToText',
  data () {
    return {
      isSpeaking: false,
      speech: '',
      speechService: {}
    }
  },
  methods: {
    ...mapActions('jstore', ['setJsMap']),

    onMic () {
      this.isSpeaking = true
      this.speechService.speak().subscribe(
        result => {
          this.speech = result
          // this.$emit('speech', this.speech)
          this.isSpeaking = false
          // console.log('Result', result);
          if (result) {
            this.$q.notify({ type: 'info', caption: 'Speech:', message: result })
            this.setJsMap({ key: 'speech', value: result.toLowerCase() })
          }
        },
        error => {
          console.log('Error', error)
          this.isSpeaking = false
        },
        () => {
          this.isSpeaking = false
        }
      )
      console.log('speechService started')
    }
  },
  props: {
    msg: String
  },
  created () {
    if (!this.$q.platform.is.mac) this.speechService = new SpeechToText()
  }
}
</script>

<style lang="sass">
</style>
