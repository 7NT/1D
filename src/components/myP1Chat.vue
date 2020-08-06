<template>
  <div v-if='!!chatTo'>
    <q-btn
      fab
      color="red"
      @click="onPChat"
      :icon="mail"
    />
    <q-dialog auto-close v-model='show'>
      <q-card class="q-dialog-plugin">
        <q-card-section>
          <myMessages :chatTo='chatTo' />
        </q-card-section>

        <q-card-actions align="right">
          <myChat :chatTo='chatTo' />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import myMessages from 'src/components/myMessages'
import myChat from 'src/components/myChat'

export default {
  name: 'myPChat',
  props: ['chatTo'],
  components: {
    myMessages,
    myChat
  },
  data () {
    return {
      show: false
    }
  },
  method: {
    onPChat () {
      // if (this.chatTo)
    }
  }
}
</script>

<style scoped>
</style>
