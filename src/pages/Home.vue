<template>
  <div class="q-pa-md">
    <div class="text-h2">Guideline:</div>
    <div class="row justify-center">
      <q-btn-toggle
        glossy
        dense
        no-caps
        v-model="slide"
        :options="[
      { label: 'Register', value: 'register' },
      { label: 'SignIn', value: 'signin' },
      { label: 'Lobby', value: 'lobby' },
      { label: 'Table', value: 'playtable' },
      { label: 'Bidding', value: 'bidding' },
      { label: 'Playing', value: 'playing' },
      { label: 'Tourney', value: 'tourney' },
      { label: 'Player', value: 'players' },
      { label: 'Scorebook', value: 'scorebook' },
      { label: 'Icons', value: 'icons' },
      { label: 'Voice', value: 'voice' }
    ]"
      />
    </div>
    <q-carousel
      arrows
      swipeable
      animated
      padding
      v-model="slide"
      :autoplay="autoplay"
      ref="carousel"
    >
      <q-carousel-slide
        name="register"
        img-src="~assets/imgs/register.png"
      >
        <div class="absolute-bottom custom-caption">
          <div class="text-h2">Register</div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide
        name="signin"
        img-src="~assets/imgs/signin.png"
      >
        <div class="absolute-bottom custom-caption">
          <div class="text-h2">Signin</div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide
        name="lobby"
        img-src="~assets/imgs/lobby.png"
      >
        <div class="absolute-bottom custom-caption">
          <div class="text-h2">Lobby</div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide
        name="playtable"
        img-src="~assets/imgs/playtable.png"
      >
        <div class="absolute-bottom custom-caption">
          <div class="text-h2">Play Table</div>
          <div class="text-subtitle1">Fullscreen on</div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide
        name="bidding"
        img-src="~assets/imgs/bidding.png"
      >
        <div class="absolute-bottom custom-caption">
          <div class="text-h2">Bidding</div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide
        name="playing"
        img-src="~assets/imgs/playing.png"
      >
        <div class="absolute-bottom custom-caption">
          <div class="text-h2">Playing</div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide
        name="tourney"
        img-src="~assets/imgs/tourney.png"
      >
        <div class="absolute-bottom custom-caption">
          <div class="text-h2">Tourney</div>
          <div class="text-subtitle1">sign up</div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide
        name="players"
        img-src="~assets/imgs/players.png"
      >
        <div class="absolute-bottom custom-caption">
          <div class="text-h2">Players</div>
          <div class="text-subtitle1">Swipe right</div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide
        name="scorebook"
        img-src="~assets/imgs/scorebook.png"
      >
        <div class="absolute-bottom custom-caption">
          <div class="text-h2">Scorebook</div>
          <div class="text-subtitle1">Swipe left</div>
        </div>
      </q-carousel-slide>
      <q-carousel-slide name="icons">
        <div class="q-mt-md q-gutter-md">
          <q-chip
            class="glossy"
            color="primary"
            text-color="white"
            square
            size="lg"
            v-for='i in icons'
            :key="i.name"
          >
            <q-icon
              :color="i.color"
              :name="i.icon"
            />
            : {{i.name}}
          </q-chip>
        </div>
      </q-carousel-slide>
      <q-carousel-slide name="voice">
        <div class="row q-mt-md q-gutter-md">
          <q-card
            dark
            bordered
            class="my-card bg-secondary text-white"
            v-for='v in voices'
            :key="v.name"
          >
            <q-card-section>
              <div class="text-h6">{{v.name}}</div>
              <div class="text-subtitle2">English Commands...</div>
            </q-card-section>

            <q-separator
              dark
              inset
            />

            <q-card-section>
              {{ v.commands }}
            </q-card-section>
          </q-card>
        </div>
      </q-carousel-slide>
    </q-carousel>
  </div>
</template>

<script>
export default {
  data () {
    return {
      slide: 1,
      autoplay: true,
      icons: [
        { icon: 'home', name: 'Home', color: 'white' },
        { icon: 'account_box', name: 'Register', color: 'white' },
        { icon: 'login', name: 'Sign In', color: 'white' },
        { icon: 'exit_to_app', name: 'Sign Out', color: 'white' },
        { icon: 'local_play', name: 'Lobby', color: 'white' },
        { icon: 'emoji_events', name: 'Tourney', color: 'white' },
        { icon: 'group_add', name: 'Team game', color: 'white' },
        { icon: 'group', name: 'Players', color: 'white' },
        { icon: 'img:jbIcon/svg/mix.svg', name: 'Board type', color: 'white' },
        { icon: 'menu_book', name: 'Score book', color: 'white' },
        { icon: 'alarm', name: 'Timer', color: 'white' },
        { icon: 'live_help', name: 'Help', color: 'white' },
        { icon: 'close', name: 'Quit', color: 'red' },
        { icon: 'fullscreen', name: 'Full screen', color: 'accent' },
        { icon: 'mic', name: 'Micphone', color: 'red' }
      ],
      voices: [
        { icon: 'mic', name: 'Lobby', commands: 'Join, Sit, Tourney...' },
        { icon: 'mic', name: 'Sitting', commands: 'North, East, South, West...' },
        { icon: 'mic', name: 'Bidding', commands: 'Pass, Double, Re-double, [1,2,3,4,5,6,7] [Club(s), Diamond(s), Heart(s), Spade(s), No-Trump(s)' },
        { icon: 'mic', name: 'Playing', commands: '(coming soon)' }
      ]
    }
  }
}
</script>

<style lang="sass" scoped>
img
  max-width: 100%
  width: auto   9
  height: auto
  vertical-align: middle
  border: 0
  -ms-interpolation-mode: bicubic

.custom-caption
  text-align: center
  padding: 12px
  color: white
  background-color: rgba(0, 0, 0, .3)

.my-card
  width: 100%
  max-width: 250px
</style>
