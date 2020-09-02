<template>
  <q-page class='flex flex-center' v-if='user'>
    <q-dialog v-model='show' persistent>
      <q-card style='min-width: 400px'>
        <q-card-section>
          <div class='text-h6'>Profile:</div>
        </q-card-section>

        <q-card-section>
          <q-list bordered padding>
            <q-item>
              <q-item-section top avatar>
                <q-btn round>
                  <q-avatar>
                    <img :src='userAvatar' />
                    <q-tooltip>my avatar...</q-tooltip>
                  </q-avatar>
                </q-btn>
              </q-item-section>

              <q-item-section>
                <q-input
                  v-model='nick'
                  filled
                  type='text'
                  label='Nickname'
                  :disable='!!user.nick'
                  :rules='[ n => n.length > 1 || "Nickname is required"]'
                />
              </q-item-section>
              <q-item-section side top>
                <q-badge :label='`Join: ${joinedDate(user.createdAt)}`' />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section top avatar>
                <q-icon :name='getFlag()' />
              </q-item-section>
              <q-item-section>
                <q-select filled v-model='country' :options='countries' label='Country:' />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align='right' class='text-primary'>
          <q-btn
            dense
            round
            size='xs'
            type='a'
            :href='authLink("google")'
            icon='mdi-google'
            color='red'
          >
            <q-tooltip
              anchor='bottom middle'
              self='top middle'
              :offset='[0, 10]'
            >Link/unlink to Google</q-tooltip>
          </q-btn>
          <q-btn dense no-caps label='Reset Password' @click='pwd=true' />
          <q-dialog v-model='pwd'>
            <q-card>
              <q-card-section>
                <div class='text-h6'>New Password:</div>
              </q-card-section>

              <q-card-section class='q-pt-none'>
                <q-input
                  v-model='password'
                  dense
                  filled
                  :type='isPwd ? "password" : "text"'
                  label='Password'
                >
                  <template v-slot:append>
                    <q-icon
                      :name='isPwd ? "visibility_off" : "visibility"'
                      class='cursor-pointer'
                      @click='isPwd = !isPwd'
                    />
                  </template>
                </q-input>
              </q-card-section>

              <q-card-actions align='right'>
                <q-btn flat label='Cancel' color='primary' v-close-popup @click='password=null' />
                <q-btn flat label='OK' color='primary' v-close-popup :disable='!password' />
              </q-card-actions>
            </q-card>
          </q-dialog>
          <q-btn push label='Cancel' v-close-popup @click='onUpdate(false)' />
          <q-btn push label='Update' v-close-popup @click='onUpdate(true)' />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import moment from 'moment'
// import { openURL } from 'quasar'
import { users$, players$ } from 'src/api'
import auth from 'src/auth'
import { jbAvatar } from 'src/jbPlayer'
import data from 'src/data/iso3166_2.json'

// const gravatarUrl = 'http://www.gravatar.com'
// const avatarUrl = 'https://ui-avatars.com/'
export default {
  name: 'Profile',
  data () {
    return {
      countries: data.map(c => c.name),
      show: true,
      user: null,
      password: null,
      accessToken: null,
      nick: null,
      flag: 'us',
      country: 'United States',
      link: null,
      pwd: false,
      isPwd: true
    }
  },
  computed: {
    userAvatar () {
      return jbAvatar(this.user)
    }
  },
  methods: {
    authLink (social) {
      if (this.link && this.link.provider === 'google') {
        this.link.provider = null
        const message = 'Your account is now unlinked to Google'
        this.$q.notify({ type: 'positive', message })
        return null
      } else {
        return `http://localhost:3030/oauth/${social}?feathers_token=${this.accessToken}`
      }
    },
    getFlag () {
      const flag2 = (this.flag).toLowerCase()
      return 'img:flags/4x3/' + flag2 + '.svg'
    },
    joinedDate (created) {
      return moment(created).format('MMMM Do YYYY')
    },
    onUpdate (update) {
      if (update) {
        if (this.nick) {
          const profile = { nick: this.nick, country: this.country, flag: this.flag, link: this.link }
          if (this.password) profile.password = this.password
          users$.patch(this.user._id, profile)
            .then(u => {
              players$.patch(this.user._id, profile)
            })
            .then(p => {
              this.$router.go(-1)
            })
            .catch(err => console.error(err))
        } else {
          this.$q.notify({ type: 'info', message: 'Nickname is required' })
        }
      } else this.$router.go(-1)
    }
  },
  watch: {
    country (c) {
      if (c) {
        const countryData = data.filter(d => d.name.toLowerCase() === c.toLowerCase())
        console.log(c, countryData)
        if (countryData) this.flag = countryData[0].code
      }
    }
  },
  mounted () {
    // this.user = auth.getUser()
    this.user = this.$attrs.user
    this.accessToken = auth.getAccessToken()
    this.nick = this.user.nick || null
    this.flag = this.user.flag || 'us'
    this.country = this.user.country || 'United States'
    this.link = this.user.link

    console.log('profile', this.user, this.accessToken)
  }
}
</script>
