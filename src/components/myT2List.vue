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
          <template v-if="isOnline(myPair.player)">
            <q-icon :name="myFlag(myPair.player)" size="sm" />
            <q-btn
              :icon="myAvatar(myPair.player)"
              :label="myNick(myPair.player)"
              class="player bg-secondary"
              align="around"
            />
          </template>
          <template v-else-if="myPair.player">
            <q-btn :label="myPair.player.nick" icon="person" class="player bg-info" align="around" />
            <q-tooltip>player is offline</q-tooltip>
          </template>
        </div>
        <div class="col-6">
          <template v-if="isOnline(myPair.partner)">
            <q-icon :name="myFlag(myPair.partner)" size="sm" />
            <q-btn
              :icon="myAvatar(myPair.partner)"
              :label="myNick(myPair.partner)"
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
            <q-tooltip>partner is offline</q-tooltip>
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
          :v-show="isMyPair || isTD"
        >
          <q-fab-action
            square
            padding="3px"
            color="accent"
            @click="onPairLeave(myPair)"
            icon="exit_to_app"
            label="Leave"
            v-show="isMyPair"
          />
          <q-fab-action
            square
            padding="3px"
            color="info"
            @click="onPairChange(myPair)"
            icon="cached"
            label="Change"
            v-show="isTD"
          />
          <q-fab-action
            square
            padding="3px"
            color="green"
            @click="onPairState(0)"
            icon="hourglass_full"
            label="Waiting"
            v-show="isTD"
          />
          <q-fab-action
            square
            padding="3px"
            color="warning"
            @click="onPairState(-1)"
            icon="hourglass_empty"
            label="Close"
            v-show="isTD"
          />
          <q-fab-action
            square
            padding="3px"
            color="negative"
            @click="onPairState(-2)"
            icon="close"
            label="Remove"
            v-show="isTD"
          />
        </q-fab>
      </div>
    </q-item-section>
  </q-item>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { getT2State } from 'src/jbState'
import { jbIsAdmin, jbIsMyNick } from 'src/jbPlayer'
import myT2Pair from 'src/components/myT2Pair'

export default {
  name: 'myT2List',
  props: ['t2', 'myPlayer', 'myPair'],
  data () {
    return {
      isMyPair: false
    }
  },
  computed: {
    ...mapState('jstore', ['jbT2']),
    ...mapGetters('jstore', ['getPlayerById', 'getPlayerByNick']),
    isTD () {
      return jbIsAdmin(this.myPlayer)
    },
    t2Stat () {
      return this.t2.state
    }
  },
  methods: {
    isOnline (p) {
      try {
        const player = this.getPlayerByNick(p.nick)
        return player.state >= 0
      } catch (err) {}
      return false
    },
    getBorder (pair) {
      if (this.isMyPair) return 'row rborder'
      else return 'row gborder'
    },
    myNick (player) {
      return player ? player.nick : 'JOIN...'
    },
    myFlag (player) {
      try {
        const flag = player.profile.flag.toLowerCase()
        return `img:statics/flags/4x3/${flag}.svg`
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
    onPairState (p2) {
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
      const pair0 = JSON.parse(JSON.stringify(pair))
      pair0.partner = this.myPlayer
      this.updatePairs(pair0, this.jbT2.myPair.pN)
    },
    onPairLeave (pair) {
      const pair0 = JSON.parse(JSON.stringify(pair))
      if (jbIsMyNick(pair0.player, this.myPlayer)) pair0.player = null
      else if (jbIsMyNick(pair0.partner, this.myPlayer)) pair0.partner = null
      this.updatePairs(pair0, this.jbT2.myPair.pN)
    },
    onPairChange (pair) {
      const pair0 = JSON.parse(JSON.stringify(pair))
      this.$q
        .dialog({
          component: myT2Pair,

          // optional if you want to have access to
          // Router, Vuex store, and so on, in your
          // custom component:
          parent: this, // becomes child of this Vue node
          // ("this" points to your Vue component)
          // (prop was called "root" in < 1.1.0 and
          // still works, but recommending to switch
          // to the more appropriate "parent" name)

          // props forwarded to component
          // (everything except "component" and "parent" props above):
          pair: pair0
          // ...more.props...
        })
        .onOk(() => {
          // console.log('OK', pair0)
          const p0 = this.getPlayerByNick(pair0.player.nick)
          const p1 = this.getPlayerByNick(pair0.partner.nick)
          if (p0 && p1) {
            pair0.player = p0
            pair0.partner = p1
            this.updatePairs(pair0, pair0.pN)
          } else {
            this.$q.notify({
              type: 'info',
              message: 'the sub player is not online'
            })
          }
        })
        .onCancel(() => {
          // console.log('Cancel', pair0)
        })
        .onDismiss(() => {
          // console.log('Called on OK or Cancel', pair0)
        })
    },
    updatePairs (pair, myPN) {
      const pairs = []
      this.t2.pairs.forEach(p => {
        if (p.pN === pair.pN) {
          pairs.push(pair)
        } else if (p.pN === myPN) {
          // remove
          const p0 = JSON.parse(JSON.stringify(p))
          if (jbIsMyNick(p.player, this.myPlayer)) {
            p0.player = null
            if (!this.isOnline(p.partner)) p0.partner = null
          } else if (jbIsMyNick(p.partner, this.myPlayer)) {
            p0.partner = null
            if (!this.isOnline(p.player)) p0.player = null
          }
          pairs.push(p0)
        } else pairs.push(p)
      })
      this.$emit('onPair', { _id: this.t2._id, pairs })
    }
  },
  mounted () {
    this.isMyPair = false
    if (jbIsMyNick(this.myPair.player, this.myPlayer)) {
      if (!this.myPair.player.state) {
        // offline
        const p0 = JSON.parse(JSON.stringify(this.myPair))
        p0.player = this.myPlayer
        this.updatePairs(p0, this.myPair.pN)
      }
      this.isMyPair = true
    } else if (jbIsMyNick(this.myPair.partner, this.myPlayer)) {
      if (!this.myPair.partner.state) {
        // offline
        const p0 = JSON.parse(JSON.stringify(this.myPair))
        p0.partner = this.myPlayer
        this.updatePairs(p0, this.myPair.pN)
      }
      this.isMyPair = true
    }

    if (this.isMyPair) {
      this.$emit('onT2', {
        id: 2,
        t2: { _id: this.t2._id, myPair: this.myPair }
      })
    }
  },
  watch: {
    t2State (s) {
      switch (s) {
        case 1:
          this.$q.notify({
            type: 'info',
            message: 'Tourney is about to start, please stay in #Lobby'
          })
          break
        default:
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
  overflow: hidden;
  white-space: nowrap;
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
