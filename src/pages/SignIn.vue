<template>
  <q-page class="flex flex-center">
    <q-dialog
      v-model="show"
      persistent
    >
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ title }}:</div>
        </q-card-section>

        <q-card-section>
          <q-list
            dense
            bordered
            padding
          >
            <q-item>
              <q-item-section
                top
                avatar
              >
                <q-icon name="face" />
              </q-item-section>
              <q-item-section>
                <q-input
                  v-model="nick"
                  filled
                  type="text"
                  label="Nickname"
                  :rules="[ n => n.length > 1 || 'Nickname is required']"
                />
              </q-item-section>
            </q-item>
            <q-item v-if="isRegistration()">
              <q-item-section
                top
                avatar
              >
                <q-icon name="email" />
              </q-item-section>
              <q-item-section>
                <q-input
                  v-model="email"
                  filled
                  type="email"
                  label="Email"
                />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section
                top
                avatar
              >
                <q-icon name="fingerprint" />
              </q-item-section>
              <q-item-section>
                <q-input
                  v-model="password"
                  filled
                  :type="isPwd ? 'password' : 'text'"
                  label="Password"
                >
                  <template v-slot:append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>
              </q-item-section>
            </q-item>
            <q-item v-if="isRegistration()">
              <q-item-section
                top
                avatar
              >
                <q-icon :name="`img:flags/4x3/${flag.toLowerCase()}.svg`" />
              </q-item-section>
              <q-item-section>
                <q-input
                  v-model="flag"
                  square
                  filled
                  label="Country:"
                  mask="AA"
                  type="text"
                ></q-input>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions
          align="right"
          class="text-primary"
        >
          <div class='row'>
            <!--
            <q-btn
              dense
              type="a"
              href="http://localhost:3030/oauth/facebook"
              no-caps
              label="Facebook"
              icon="mdi-facebook"
              push
              color="blue"
            />
            <q-btn
              dense
              type="a"
              href="/api/oauth/google"
              no-caps
              label="Google"
              icon="mdi-google"
              push
              color="red"
            />
            <q-separator
              vertical
              spaced
            />
            -->
            <q-btn
              push
              label='Cancel'
              v-close-popup
              @click="onOk(true)"
            />
            <q-btn
              push
              :label="title"
              v-close-popup
              @click="onOk(false)"
            />
          </div>
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
      nick: '',
      email: null,
      password: '',
      isPwd: true,
      flag: 'US'
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
        const credential = this.getCredentials()
        if (this.isRegistration()) {
          credential.email = this.$data.email
          credential.profile = { flag: this.$data.flag, avatar: null }

          auth
            .register(credential)
            .then(user => {
              delete credential.email
              delete credential.profile
              return this.login(credential)
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
          this.login(credential)
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
    login (credential) {
      return auth.login(credential)
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
