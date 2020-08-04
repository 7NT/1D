<template>
  <div v-if='!!player'>
    <q-dialog
      auto-close
      no-focus
      no-refocus
      seamless
      v-model="dialog"
      :position="position"
    >
      <q-card style="width: 350px">
        <q-card-section class="row items-center no-wrap">
          <myMessages :roomId='`@${player.id}`' />
          <q-space />
          <myChat :roomId='`@${player.id}`' />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
export default {
  name: 'myPChat',
  props: ['player'],
  data () {
    return {
      dialog: false,
      position: 'standard'
    }
  },

  methods: {
    open (position) {
      this.position = position
      this.dialog = true
    }
  }
}
</script>
