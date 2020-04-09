<template>
  <div class="column">
    <div class="row self-end no-wrap">
      <q-card flat v-if="isVisible" class="transparent">
        <div class="hand hhand-compact active-hand full-width">
          <img v-for="(c, i) of playedCards" :key="`${i}`" :src="cardback(c)" class="card" />
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'myTricks',
  data () {
    return {}
  },
  computed: {
    ...mapGetters('jstore', ['myPlayer', 'myTable']),
    isVisible () {
      return this.myTable.state > 1
    },
    playedCards () {
      return this.myTable.plays.data
    }
  },
  methods: {
    cardback (n) {
      return 'statics/cards/Blue_Back.svg'
    }
  }
}
</script>
<style scoped>
  img.card {
    max-width: 70px;
    margin: 0;
    padding: 0;
    border: 0;
    vertical-align: initial;
    box-sizing: initial;
  }
  /*
  * A hand is a div containing cards.
  */
  .hand {
    padding: 0;
    margin-bottom: 0;
  }

  .active-hand img.card {
    cursor: pointer;
  }

  /*
  * A horizontal hand, class='hand hhand'.  The enitire card is visible.
  */
  .hhand {
    display: inline-block;
  }
  .hhand img.card {
    padding-top: 10px;
  }

  .hhand.active-hand img.card:hover {
    padding-top: 0px;
    padding-bottom: 10px;
  }
</style>
