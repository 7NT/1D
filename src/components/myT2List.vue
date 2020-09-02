<template>
  <q-item :class='getBorder(myPair)'>
    <q-item-section avatar class='col-2'>
      <q-chip>
        <q-avatar color='info' text-color='white'>{{myPair.pN}}</q-avatar>
        {{myPair.cc}}
      </q-chip>
    </q-item-section>

    <q-item-section class='col-6'>
      <div class='row'>
        <div class='col-6'>
          <template v-if='isOnline(myPlayer)'>
            <q-icon :name='myFlag(myPlayer)' size='sm' />
            <q-btn
              :icon='myAvatar(myPlayer)'
              :label='myNick(myPlayer)'
              class='pbar bg-secondary'
              align='around'
            />
          </template>
          <template v-else-if='myPair.player'>
            <q-btn :label='myPair.player' icon='person' class='pbar bg-info' align='around' />
            <q-tooltip>{{myPair.player}} is offline</q-tooltip>
          </template>
        </div>
        <div class='col-6'>
          <template v-if='isOnline(myPartner)'>
            <q-icon :name='myFlag(myPartner)' size='sm' />
            <q-btn
              :icon='myAvatar(myPartner)'
              :label='myNick(myPartner)'
              class='pbar bg-secondary'
              align='around'
            />
          </template>
          <template v-else-if='myPartner'>
            <q-btn :label='myPartner.nick' icon='person' class='pbar bg-info' align='around' />
            <q-tooltip>partner is offline</q-tooltip>
          </template>
          <template v-else>
            <q-btn
              label='Join...'
              icon='person_add'
              class='pbar bg-info'
              align='around'
              @click='onP2Join(myPair)'
            />
          </template>
        </div>
      </div>
    </q-item-section>

    <q-item-section class='col-2'>
      <q-chip square>
        <q-avatar color='green' text-color='white'>{{myPair.score}}</q-avatar>
        {{myPair.boards || 0}} / {{ getBoards ()}}
      </q-chip>
    </q-item-section>
    <q-item-section side top class='col-2'>
      <div class='col-2 q-mt-md'>
        <q-fab
          square
          :label='myT2State(myPair.state)'
          :color='myT2Color(myPair.state)'
          icon='keyboard_arrow_left'
          direction='left'
          padding='none sm'
          :v-show='isMyPair || isTD'
        >
          <q-fab-action
            square
            padding='3px'
            color='accent'
            @click='onP2Part(myPair)'
            icon='exit_to_app'
            label='Leave'
            v-show='isMyPair'
          />
          <q-fab-action
            square
            padding='3px'
            color='info'
            @click='onP2Change(myPair)'
            icon='cached'
            label='Change'
            v-show='isTD'
          />
          <q-fab-action
            square
            padding='3px'
            color='green'
            @click='onP2State(0)'
            icon='hourglass_full'
            label='Waiting'
            v-show='isTD'
          />
          <q-fab-action
            square
            padding='3px'
            color='warning'
            @click='onP2State(-1)'
            icon='hourglass_empty'
            label='Close'
            v-show='isTD'
          />
          <q-fab-action
            square
            padding='3px'
            color='negative'
            @click='onP2State(-2)'
            icon='close'
            label='Remove'
            v-show='isTD'
          />
        </q-fab>
      </div>
    </q-item-section>
  </q-item>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { jbT2State } from 'src/jbState'
import { jbIsAdmin, jbIsMyNick, jbAvatarImg } from 'src/jbPlayer'
import myT2Pair from 'src/components/myT2Pair'

export default {
  name: 'myT2List',
  props: ['t2', 'jsPlayer', 'myPair'],
  data () {
    return {}
  },
  computed: {
    ...mapGetters('jstore', ['jsPlayerByNick']),

    isTD () {
      return jbIsAdmin(this.jsPlayer)
    },
    myPlayer () {
      return this.jsPlayerByNick(this.myPair.player)
    },
    myPartner () {
      return this.jsPlayerByNick(this.myPair.partner)
    },
    isMyPair () {
      const players = new Set([this.myPair.player, this.myPair.partner])
      return players.has(this.jsPlayer.nick)
    },
    t2Stat () {
      return this.t2.state
    }
  },
  methods: {
    ...mapActions('jstore', ['setJsMap']),

    isOnline (p) {
      return p ? p.state >= 0 : false
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
        const flag = player.flag.toLowerCase()
        return `img:flags/4x3/${flag}.svg`
      } catch (err) { }
      return null
    },
    myAvatar (player) {
      return jbAvatarImg(player)
    },
    myT2State (s2) {
      return jbT2State(s2)
    },
    myT2Color (s2) {
      switch (s2) {
        case 1:
          return 'positive'
        case -1:
          return 'negative'
        default:
          return 'secondary'
      }
    },
    getBoards () {
      return this.t2.bN * this.t2.bR
    },
    onP2State (s) {
      const pair2 = JSON.parse(JSON.stringify(this.myPair))
      switch (s) {
        case 0:
        case 1:
        case -2:
          pair2.state = s
          break
        default:
      }
      this.onP2Update(pair2)
    },
    onP2Join (myPartner) {
      const p0 = JSON.parse(JSON.stringify(myPartner))
      p0.partner = this.jsPlayer
      this.onP2Update(p0)
    },
    onP2Part (myPartner) {
      const p0 = JSON.parse(JSON.stringify(myPartner))
      if (jbIsMyNick(p0.player, this.jsPlayer)) p0.player = null
      else if (jbIsMyNick(p0.partner, this.jsPlayer)) p0.partner = null
      this.onP2Update(p0)
    },
    onP2Change (pair) {
      const p0 = JSON.parse(JSON.stringify(pair))
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
          pair: p0
          // ...more.props...
        })
        .onOk(() => {
          // console.log('OK', pair0)
          const myPlayer = this.jsPlayerByNick(p0.player.nick)
          const myPartner = this.jsPlayerByNick(p0.partner.nick)
          if (p0 && myPlayer) {
            p0.player = myPlayer
            p0.partner = myPartner
            this.onP2Update(p0)
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
    onP2Update (p2) {
      switch (this.t2.state) {
        case 1: {
          this.$emit('onPairs', { _id: this.t2._id, pstate: p2 })
          break
        }
        case 0: {
          const pairs = []
          const myPN = this.jsT2 ? this.jsT2.myPair.pN : 0
          this.t2.pairs.forEach(p => {
            if (p.pN === p2.pN) {
              pairs.push(p2)
            } else if (p.pN === myPN) {
              // remove
              const p0 = JSON.parse(JSON.stringify(p))
              if (jbIsMyNick(p.player, this.jsPlayer.nick)) {
                p0.player = null
                if (!this.myPartner) p0.partner = null
              } else if (jbIsMyNick(p.partner, this.jsPlayer.nick)) {
                p0.partner = null
                if (!this.myPlayer) p0.player = null
              }
              pairs.push(p0)
            } else pairs.push(p)
          })
          // console.log(p2, pairs)
          this.$emit('onPairs', { _id: this.t2._id, pairs, state: this.t2.state })
          break
        }
        default:
      }
    }
  },
  mounted () {
    // console.log('p2', this.myPair)
  },
  watch: {
    isMyPair (p) {
      if (p) this.setJsMap({ key: 't2', value: { _id: this.t2._id, myPair: this.myPair } })
    },
    t2State (s) {
      if (!this.isMyPair) return
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
.pbar {
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

<style scoped>
</style>
