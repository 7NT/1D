<template>
  <q-item class="row">
    <q-item-section
      avatar
      class="col-2"
    >
      <q-chip>
        <q-avatar
          color="info"
          text-color="white"
        >{{myPair.pairN}}</q-avatar>
        {{myPair.cc}}
      </q-chip>
    </q-item-section>

    <q-item-section class="col-6">
      <div class="row">
        <div class="col-6">
          <q-btn
            :icon="myAvatar(myPair.player)"
            :label="myNick(myPair.player)"
            :icon-right="myFlag(myPair.player)"
            class="player bg-secondary"
            align="around"
            @click='onPair(myPair,1)'
          />
        </div>
        <div class="col-6">
          <template v-if="getPlayer(myPair.partner)">
            <q-btn
              :icon="myAvatar(myPair.partner)"
              :label="myNick(myPair.partner)"
              :icon-right="myFlag(myPair.partner)"
              class="player bg-secondary"
              align="around"
              @click='onPair(myPair.partner, 2)'
            />
          </template>
          <template v-else-if="myPair.partner">
            <q-btn
              :label="myPair.partner"
              icon="person"
              class="player bg-info"
              align="around"
              @click='onPair(myPair, 0)'
            />
          </template>
          <template v-else>
            <q-btn
              label="Join..."
              icon="person_add"
              class="player bg-info"
              align="around"
              @click='onPair(myPair, -1)'
            />
          </template>
        </div>
      </div>
    </q-item-section>

    <q-item-section class="col-2">
      <q-chip square>
        <q-avatar
          color="green"
          text-color="white"
        >{{myPair.score}}</q-avatar>
        {{myPair.boards}}
      </q-chip>
    </q-item-section>
    <q-item-section
      side
      top
      class="col-2"
    >
      <div class="col-2 q-mt-md">
        <q-fab
          square
          :label="myT2State(myPair.state)"
          :color="myT2Color(myPair.state)"
          icon="keyboard_arrow_left"
          direction="left"
          padding="none sm"
          :disable="!isTD"
        >
          <q-fab-action
            square
            padding="3px"
            color="green"
            @click="onPState(0)"
            icon="hourglass_full"
            label="Waiting"
          />
          <q-fab-action
            square
            padding="3px"
            color="warning"
            @click="onPState(-1)"
            icon="close"
            label="Close"
          />
        </q-fab>
      </div>
    </q-item-section>
  </q-item>
</template>

<script>
import { mapGetters } from 'vuex'
// import { getNick, getFlag, getAvatar } from 'src/jbPlayer'
import { getT2State } from 'src/jbState'

export default {
  name: 'myT2List',
  props: ['t2', 'myPlayer', 'myPair'],
  data () {
    return {}
  },
  computed: {
    ...mapGetters('jstore', ['getPlayerById']),
    isTD () {
      return this.myPlayer.status > 1
    }
  },
  methods: {
    getPlayer (pId) {
      return this.getPlayerById(pId)
    },
    myNick (pId) {
      const player = this.getPlayer(pId)
      return player ? player.nick : 'JOIN...'
    },
    myFlag (pId) {
      const player = this.getPlayer(pId)
      return player ? `img:statics/flags/4x3/${player.profile.flag}.svg` : null
    },
    myAvatar (pId) {
      const player = this.getPlayer(pId)
      return player ? 'img:' + player.profile.avatar : null
    },
    myT2State (s2) {
      return getT2State(s2)
    },
    myT2Color (s2) {
      switch (s2) {
        case 1:
          return 'secondary'
        case -1:
          return 'negative'
        default:
          return 'positive'
      }
    },
    onPState (p2) {
      console.log(p2, this.myPair)
    },
    onPair (pair, n) {
      let bCancel = false
      const pair2 = JSON.parse(JSON.stringify(pair))
      console.log(n, pair, pair2)
      switch (n) {
        case -1:
          pair2.partner = this.myPlayer.id
          break
        case 0:
          if (pair2.player === this.myPlayer.id) pair2.partner = null
          else bCancel = true
          break
        case 1:
          if (pair2.player === this.myPlayer.id) pair2.player = null
          else bCancel = true
          break
        case 2:
          if (pair2.partner === this.myPlayer.id) pair2.partner = null
          else bCancel = true
          break
        default:
      }
      if (bCancel) this.$q.notify({ type: 'info', message: 'You can not join this pair.' })
      else {
        const pairs2 = [...this.t2.pairs] // this.t2.pairs.slice(0)
        pairs2[pair.pairN - 1] = pair2
        this.$emit('onPair', { t2Id: this.t2._id, pairs: pairs2 })
      }
    }
  }
}
</script>

<style scoped>
.player {
  width: 125px;
  height: 34px;
  margin: auto;
  align-items: flex-start;
  text-overflow: ellipsis;
  text-transform: none;
}
.flag {
  width: 32px;
  height: 24px;
  margin-top: 2px;
}
.avatar {
  width: 24px;
  height: 24px;
  margin-top: 1px;
}
</style>
