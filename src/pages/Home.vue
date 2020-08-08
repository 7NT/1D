<template>
  <div class="q-pa-md">
    <q-carousel
      arrows
      swipeable
      animated
      v-model="slide"
      :autoplay="autoplay"
      ref="carousel"
      infinite
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
