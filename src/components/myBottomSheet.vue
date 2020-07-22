<template>
  <div class="q-mt-lg" style='position: relative; z-index:500'>
    <q-fab
      v-model="fab2"
      label="Views"
      vertical-actions-align="left"
      color="purple"
      padding="none xl"
      icon="keyboard_arrow_up"
      direction="up"
    >
      <q-fab-action padding="3px" external-label color="primary" @click="onClick" icon="chat" label="Chat Messages" />
      <q-fab-action padding="3px" external-label color="secondary" @click="onClick" icon="menu_book" label="Score Book" />
      <q-fab-action padding="3px" external-label color="orange" @click="onClick" icon="group" label="Players" />
      <q-fab-action padding="3px" external-label color="accent" @click="onClick" icon="emoji_events" label="Tourney" />
    </q-fab>
  </div>
</template>

<script>
export default {
  name: 'myBottomSheet',
  data () {
    return {}
  }
}
</script>
