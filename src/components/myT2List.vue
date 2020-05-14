<template>
  <q-item :class="getBorder(myPair)">
    <q-item-section avatar class="col-2">
      <q-chip>
        <q-avatar color="info" text-color="white">{{myPair.pN}}</q-avatar>
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
          />
        </div>
        <div class="col-6">
          <template v-if="isOnline(myPair.partner)">
            <q-btn
              :icon="myAvatar(myPair.partner)"
              :label="myNick(myPair.partner)"
              :icon-right="myFlag(myPair.partner)"
              class="player bg-secondary"
              align="around"
            />
          </template>
          <template v-else-if="myPair.partner">
            <q-btn
              :label="myPair.partner.nick"
              icon="person"
              class="player bg-info"
              align="around"
            />
          </template>
          <template v-else>
            <q-btn
              label="Join..."
              icon="person_add"
              class="player bg-info"
              align="around"
              @click="onPair(myPair)"
            />
          </template>
        </div>
      </div>
    </q-item-section>

    <q-item-section class="col-2">
      <q-chip square>
        <q-avatar color="green" text-color="white">{{myPair.score}}</q-avatar>
        {{myPair.boards || 0}} / {{ getBoards ()}}
      </q-chip>
    </q-item-section>
    <q-item-section side top class="col-2">
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
            icon="hourglass_empty"
            label="Close"
          />
          <q-fab-action
            square
            padding="3px"
            color="negative"
            @click="onPState(-2)"
            icon="close"
            label="Remove"
          />
        </q-fab>
      </div>
    </q-item-section>
  </q-item>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { getT2State } from 'src/jbState'

export default {
  name: 'myT2List',
  props: ['t2', 'myPlayer', 'myPair'],
  data () {
    return {
      isMyPair: false
    }
  },
  computed: {
    ...mapState('jstore', ['t2Id']),
    ...mapGetters('jstore', ['getPlayerById']),
    isTD () {
      return this.myPlayer.status > 1
    }
  },
  methods: {
    getBorder (pair) {
      if (this.isMyPair) return 'row rborder'
      else return 'row gborder'
    },
    isMyPlayer (p) {
      return p ? p.id === this.myPlayer.id : null
    },
    isOnline (player) {
      return player ? !!player.id : false
    },
    myNick (player) {
      return player ? player.nick : 'JOIN...'
    },
    myFlag (player) {
      try {
        return `img:statics/flags/4x3/${player.profile.flag}.svg`
      } catch (err) {}
      return null
    },
    myAvatar (player) {
      try {
        return `img:${player.profile.avatar}`
      } catch (err) {}
      return null
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
    getBoards () {
      return this.t2.bN * this.t2.bR
    },
    onPState (p2) {
      const pair2 = JSON.parse(JSON.stringify(this.myPair))
      switch (p2) {
        case 0:
        case 1:
        case -2:
          pair2.state = p2
          break
        default:
      }
      this.updatePairs(pair2, 0)
    },
    onPair (pair) {
      pair.partner = this.myPlayer
      this.updatePairs(pair, this.t2Id.myPair.pN)
    },
    updatePairs (pair, myPN) {
      const pairs = []
      this.t2.pairs.forEach(p => {
        if (p.pN === pair.pN) {
          pairs.push(pair)
        } else {
          if (p.pN === myPN) { // remove
            if (this.isMyPlayer(p.player)) p.player = null
            else if (this.isMyPlayer(p.partner)) p.partner = null
          }
          pairs.push(p)
        }
      })
      this.$emit('onPair', { t2: this.t2, pairs })
    }
  },
  mounted () {
    if (
      this.isMyPlayer(this.myPair.player) ||
      this.isMyPlayer(this.myPair.partner)
    ) {
      this.$emit('onRoomId', {
        id: 2,
        t2Id: { _id: this.t2._id, myPair: this.myPair }
      })
      this.isMyPair = true
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
.rborder {
  border: 1px solid red;
}
.gborder {
  border: 1px solid green;
}
</style>
