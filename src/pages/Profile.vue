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
                <q-badge :label='`Join: ${joinedDate(user.created)}`' />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section
                top
                avatar
              >
                <q-icon :name='getFlag()' />
                <q-tooltip>
                  2 letter ISO 3166 country flag codes
                </q-tooltip>
              </q-item-section>
              <q-item-section>
                <q-select filled v-model="country" :options="countries" label="Country:" />
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
import data from 'src/data/iso3166_2.json'

const gravatarUrl = 'http://www.gravatar.com'

export default {
  name: 'Profile',
  data () {
    return {
      countries: null,
      show: true,
      user: null,
      nick: null,
      flag: null,
      country: null
    }
  },
  computed: {},
  methods: {
    gavatar () {
      openURL(gravatarUrl)
    },
    getFlag () {
      return 'img:~assets/flags/4x3/' + this.flag.toLowerCase() + '.svg'
    },
    joinedDate (created) {
      return moment(created).format('MMMM Do YYYY')
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
    this.nick = this.user.nick
    this.flag = (this.user.profile.flag || 'US').toUpperCase()
    this.countries = data.map(d => d.name)
    const countryData = data.filter(d => d.code === this.flag)
    if (countryData) this.country = countryData[0].name
  }
}
</script>
