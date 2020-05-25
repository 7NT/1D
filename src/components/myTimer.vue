<template>
  <div>
    <q-badge>
      {{mmss}}
    </q-badge>
  </div>
</template>

<script>
export default {
  name: 'myTimer',
  props: ['timer'],
  data () {
    return {
      mmss: ''
    }
  },
  methods: {
    updateTimer () {
      let dt = new Date().getTime() - this.timer
      dt = Math.round(dt / 1000)
      const mm = Math.round(dt / 60)
      const ss = dt % 60
      this.mmss = ('0' + mm).slice(-2) + ':' + ('0' + ss).slice(-2)
    }
  },
  mounted () {
    this.$options.interval = setInterval(this.updateTimer, 1000)
  },
  beforeDestroy () {
    clearInterval(this.$options.interval)
  }
}
</script>
