<template>
  <q-page class='flex flex-center'>
    <q-dialog
      v-model='show'
      persistent
    >
      <q-card style='min-width: 400px'>
        <q-card-section>
          <div class='text-h6'>Profile:</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model='user.nick'
            square filled
            label="Nick"
            type='text'
          />

          <q-input
            v-model='user.country'
            square filled
            label="Country"
            type='text'
          >
          </q-input>
        </q-card-section>

        <q-card-actions
          align='right'
          class='text-primary'
        >
          <q-btn
            push
            label='Cancel'
            v-close-popup
            @click="onUpdate(false)"
          />
          <q-btn
            push
            label='Update'
            v-close-popup
            @click="onUpdate(true)"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { userService } from 'src/api'

export default {
  name: 'Profile',
  data () {
    return {
      show: true,
      user: null
    }
  },
  methods: {
    onUpdate (update) {
      if (update) userService.patch(this.user._id, this.user)
      // this.$router.push({ name: this.page })
      this.$router.go(-1)
    }
  },
  created () {
    this.user = this.$attrs.user
    if (!this.user.country) this.user.country = navigator.language.split('-')[1]

    console.log('profile', this.user)
  }
}
</script>
