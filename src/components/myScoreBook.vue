<template>
  <q-list separator bordered dense>
    <q-item>
      <q-item-section>
        <q-btn-toggle
          v-model='model'
          push
          no-caps
          glossy
          toggle-color='primary'
          :options='[
            {label: "ScoreBook", value: 0},
            {label: "Tourney Points", value: 1}
          ]'
        />
      </q-item-section>
    </q-item>
    <q-separator />
    <template v-if='model===0'>
      <q-expansion-item v-for='r in jsResults' :key='r._id'>
        <template v-slot:header>
          <!--
          <q-item-section>
            <q-item-label overline>{{ getBoardInfo(r) }}</q-item-label>
            <q-item-label caption>
              {{ getContractInfo(r) }}
              <q-badge
                outline
                color='secondary'
                :text-color='getRScore(r) >= 0 ? "positive" : "negative"'
                :label='getScore(r)'
              />
            </q-item-label>
          </q-item-section>

          <q-item-section side top>
            <q-item-label caption>{{playedDate(r.played)}}</q-item-label>
          </q-item-section>
          -->
          <myScoreHeader :result='r' />
        </template>
        <q-card>
          <q-card-section>
            <myScoreList :result='r' />
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </template>
    <template v-else-if='model===1'></template>
  </q-list>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import myScoreHeader from 'src/components/myScoreHeader'
import myScoreList from 'src/components/myScoreList'

export default {
  name: 'myScoreBook',
  components: { myScoreHeader, myScoreList },

  data: () => ({
    model: 0
  }),
  computed: {
    ...mapState('jstore', ['jsResults'])
  },
  methods: {
    ...mapActions('jstore', ['resetResults']),

    scoreBookClose () {
      // this.resetResults()
      // this.$emit('onDrawer', 'scoreBook')
    },
    getPNick (r) {
      if (r.info.by < 1) return ''
      const nick = r.players[r.info.by - 1]
      if (nick) return 'by ' + nick
      else return 'by ' + this.seatName[r.info.by - 1]
    }
  }
}
</script>

<style scoped>
</style>
