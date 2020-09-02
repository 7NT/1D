<template>
  <q-page class='flex flex-center'>
    <q-dialog v-model='show' persistent>
      <q-card style='min-width: 400px'>
        <q-card-section>
          <div class='text-h6'>{{ title }}:</div>
        </q-card-section>

        <q-card-section>
          <q-list dense bordered padding>
            <q-item dense>
              <q-item-section top avatar>
                <q-icon name='face' />
              </q-item-section>
              <q-item-section top>
                <q-input
                  v-model='nick'
                  dense
                  filled
                  type='text'
                  label='Nick'
                  :rules='[ n => n.length > 1 || "Nick is required"]'
                />
              </q-item-section>
              <q-item-section top side v-if='isRegistration()'>
                <q-input v-model='name' dense filled type='text' label='Name' />
              </q-item-section>
            </q-item>
            <q-item dense v-if='isRegistration()'>
              <q-item-section top avatar>
                <q-icon name='email' />
              </q-item-section>
              <q-item-section>
                <q-input v-model='email' dense filled type='email' label='Email' />
              </q-item-section>
            </q-item>
            <q-item dense>
              <q-item-section top avatar>
                <q-icon name='fingerprint' />
              </q-item-section>
              <q-item-section>
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
              </q-item-section>
            </q-item>
            <q-item dense v-if='isRegistration()'>
              <q-item-section top avatar>
                <q-icon :name='`img:flags/4x3/${flag.toLowerCase()}.svg`' />
              </q-item-section>
              <q-item-section>
                <q-select dense filled v-model='country' :options='countries' label='Country:' />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align='right' class='text-primary'>
          <div class='row'>
            <div v-if='$q.platform.is.desktop'>
              <q-btn
                dense
                type='a'
                href='http://www.jbridge.net:3030/oauth/google'
                no-caps
                label='Google'
                icon='mdi-google'
                push
                color='red'
              />
            </div>
            <q-separator vertical spaced />
            <div>
              <q-btn push dense label='Cancel' v-close-popup @click='onOk(true)' />
              <q-btn push dense :label='title' v-close-popup @click='onOk(false)' />
            </div>
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import auth from 'src/auth'
import data from 'src/data/iso3166_2.json'

export default {
  data () {
    return {
      show: true,
      title: null,
      nick: '',
      name: null,
      email: null,
      password: '',
      isPwd: true,
      countries: data.map(c => c.name),
      flag: 'us',
      country: 'United States'
    }
  },
  computed: {},
  methods: {
    goTo (route) {
      this.$router.push({ name: route })
    },
    getCredentials () {
      const user = {
        // email: this.$data.email,
        nick: this.$data.nick,
        password: this.$data.password
      }
      return user
    },
    isRegistration () {
      return this.$route.name === 'register'
    },
    onOk (cancel) {
      if (cancel) {
        this.$router.go(-1)
      } else {
        if (this.isRegistration()) {
          const credential = this.getCredentials()
          credential.email = this.$data.email
          credential.name = this.$data.name
          credential.country = this.$data.country
          credential.flag = this.$data.flag

          auth
            .register(credential)
            .then(user => {
              console.log('register', user)
              return this.login()
            })
            .then(user => {
              this.$q.notify({
                color: 'positive',
                message: 'You are now logged in'
              })
              this.goTo('lobby')
            })
            .catch(err => {
              console.error(err)
              this.$q.notify({
                color: 'positive',
                message: 'Cannot register, please check your nickname or password'
              })
              this.goTo('home')
            })
        } else {
          this.login()
            .then(() => {
              this.$q.notify({
                color: 'positive',
                message: 'You are now logged in'
              })
            })
            .catch(err => {
              console.error(err)
              this.$q.notify({
                color: 'positive',
                message: 'Cannot sign in, please check your nickname or password'
              })
              this.goTo('home')
            })
        }
      }
    },
    login () {
      const credential = this.getCredentials()
      console.log('login', credential)
      return auth.login(credential)
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
  mounted () {
    this.title = this.isRegistration() ? 'Register' : 'Sign In'
  },
  beforeDestroy () { }
}
</script>

<style lang='styl'>
</style>
