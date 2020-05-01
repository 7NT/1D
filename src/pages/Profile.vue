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
          <q-list
            bordered
            padding
          >
            <q-item>
              <q-item-section
                top
                avatar
              >
                <q-btn
                  round
                  color="info"
                  @click='gavatar()'
                >
                  <q-avatar rounded>
                    <img :src='user.profile.avatar'>
                    <q-tooltip>
                      click to update my avatar...
                    </q-tooltip>
                  </q-avatar>
                </q-btn>
              </q-item-section>

              <q-item-section>
                <q-input
                  v-model='nick'
                  square
                  filled
                  label="Nick:"
                  type='text'
                />
              </q-item-section>
              <q-item-section
                side
                top
              >
                <q-badge :label='`Join: ${joinedDate(user.createdAt)}`' />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section
                top
                avatar
              >
                <q-icon :name='`img:statics/flags/4x3/${flag}.svg`' />
                <q-tooltip>
                  2 letter ISO 3166 country flag codes
                </q-tooltip>
              </q-item-section>
              <q-item-section>
                <q-input
                  v-model='flag'
                  square
                  filled
                  label="Country:"
                  mask="AA"
                  type='text'
                >
                </q-input>
              </q-item-section>
            </q-item>
          </q-list>
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
import moment from 'moment'
import { openURL } from 'quasar'
import { users$, players$ } from 'src/api'

const gravatarUrl = 'http://www.gravatar.com'

export default {
  name: 'Profile',
  data () {
    return {
      show: true,
      user: null,
      nick: null,
      flag: null
    }
  },
  methods: {
    gavatar () {
      openURL(gravatarUrl)
    },
    joinedDate (createdAt) {
      return moment(createdAt).format('MMMM Do YYYY')
    },
    onUpdate (update) {
      if (update) {
        const profile = { nick: this.nick, profile: { flag: this.flag, avatar: this.user.profile.avatar } }
        users$.patch(this.user._id, profile)
        players$.patch(this.user._id, profile)
        // .then(p => { console.log(p) })
      }
      // this.$router.push({ name: this.page })
      this.$router.go(-1)
    }
  },
  created () {
    this.user = this.$attrs.user
    this.nick = this.user.nick
    this.flag = (this.user.profile.flag || 'us').toLowerCase()

    // console.log('profile', this.user)
  }
}
</script>
