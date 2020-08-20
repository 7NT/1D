<template>
  <q-page class='flex flex-center'>
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
                  <q-avatar rounded>
                    <img :src='user.avatar' />
                    <q-tooltip>my avatar...</q-tooltip>
                  </q-avatar>
                </q-btn>
              </q-item-section>

              <q-item-section>
                <q-input
                  v-model='nick'
                  filled
                  autofocus
                  type='text'
                  label='Nickname'
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
                <q-tooltip>2 letter ISO 3166 country flag codes</q-tooltip>
              </q-item-section>
              <q-item-section>
                <q-select filled v-model='country' :options='countries' label='Country:' />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align='right' class='text-primary'>
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
import data from 'src/data/iso3166_2.json'

// const gravatarUrl = 'http://www.gravatar.com'

export default {
  name: 'Profile',
  data () {
    return {
      countries: data.map(c => c.name),
      show: true,
      user: null,
      nick: null,
      flag: 'us',
      country: 'United States'
    }
  },
  computed: {},
  methods: {
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
          const profile = { nick: this.nick, country: this.country, flag: this.flag }
          users$.patch(this.user._id, profile)
            .then(u => {
              players$.patch(this.user._id, profile)
              this.$router.go(-1)
            })
            .catch(err => {
              console.log(err)
              this.$q.notify({ type: 'negative', message: err })
            })
        } else {
          this.$q.notify({ type: 'info', message: 'Nickname is required' })
        }
      } else this.$router.go(-1)
    }
  },
  watch: {
    country (c) {
      if (c) {
        const countryData = data.filter(d => d.name === c)
        if (countryData) this.flag = countryData[0].code
      }
    }
  },
  created () {
    this.user = this.$attrs.user
    this.nick = this.user.nick || ''
    this.flag = this.user.flag || 'us'
    this.country = this.user.country || 'United States'
    console.log('profile', this.user)
  }
}
</script>
