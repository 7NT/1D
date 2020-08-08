<template>
  <div class="q-pa-md">
    <div class="text-h2">Guideline:</div>
    <div class="column justify-around">
      <div class='col-2'>
        <div class="row justify-center">
          <q-btn-toggle
            glossy
            v-model="slide"
            :options="[
          { label: 'Register', value: 'register' },
          { label: 'Sign In', value: 'signin' },
          { label: 'Lobby', value: 'lobby' },
          { label: 'Play Table', value: 'playtable' },
          { label: 'Bidding', value: 'bidding' },
          { label: 'Playing', value: 'playing' },
          { label: 'Tourney', value: 'tourney' },
          { label: 'Player List', value: 'players' },
          { label: 'Score Book', value: 'scorebook' }
        ]"
          />
        </div>
      </div>
      <div class='col-10'>
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
              <div class="text-h2">Player List</div>
              <div class="text-subtitle1">Swipe right</div>
            </div>
          </q-carousel-slide>
          <q-carousel-slide
            name="scorebook"
            img-src="~assets/imgs/scorebook.png"
          >
            <div class="absolute-bottom custom-caption">
              <div class="text-h2">Score Book</div>
              <div class="text-subtitle1">Swipe left</div>
            </div>
          </q-carousel-slide>
        </q-carousel>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      slide: 1,
      autoplay: true
    }
  }
}
</script>

<style lang="sass" scoped>
.custom-caption
  text-align: center
  padding: 12px
  color: white
  background-color: rgba(0, 0, 0, .3)
</style>
