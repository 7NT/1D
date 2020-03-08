<template>
  <q-page class='flex flex-center'>
    <q-dialog
      v-model='show'
      persistent
    >
      <q-card style='min-width: 400px'>
        <q-card-section>
          <div class='text-h6'>{{ title }}:</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model='email'
            filled
            type='email'
            hint='Email'
          />

          <q-input
            v-model='password'
            filled
            :type="isPwd ? 'password' : 'text'"
            hint='Password'
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class='cursor-pointer'
                @click='isPwd = !isPwd'
              />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions
          align='right'
          class='text-primary'
        >
          <q-btn
            push
            :label=title
            v-close-popup
            @click="onOk()"
          />
          <a
            class="button button-primary block"
            href="localhost:3030/oauth/google"
          >
            Login with Google
          </a>
          <a
            class="button button-primary block"
            href="localhost:3030/oauth/facebook"
          >
            Login with Facebook
          </a>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import auth from 'src/auth'

export default {
  data () {
    return {
      show: true,
      title: null,
      email: null,
      password: '',
      isPwd: true
    }
  },
  computed: {},
  methods: {
    goTo (route) {
      this.$router.push({ name: route })
    },
    getCredentials () {
      const user = {
        email: this.$data.email,
        password: this.$data.password
      }
      return user
    },
    isRegistration () {
      return this.$route.name === 'register'
    },
    onOk () {
      const credential = this.getCredentials()
      if (this.isRegistration()) {
        auth.register(credential)
          .then((user) => {
            return this.login(credential)
          })
          .then((user) => {
            this.$q.notify({
              color: 'positive',
              message: 'You are now logged in'
            })
            this.goTo('lobby')
          })
          .catch((err) => {
            console.error(err)
            this.$q.notify({
              color: 'positive',
              message: 'Cannot register, please check your e-mail or password'
            })
            this.goTo('home')
          })
      } else {
        this.login(credential)
          .then(() => {
            this.$q.notify({
              color: 'positive',
              message: 'You are now logged in'
            })
          })
          .catch((err) => {
            console.error(err)
            this.$q.notify({
              color: 'positive',
              message: 'Cannot sign in, please check your e-mail or password'
            })
            this.goTo('home')
          })
      }
    },
    register (credential) {
      return auth.register(credential)
    },
    login (credentials) {
      return auth.login(credentials)
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
