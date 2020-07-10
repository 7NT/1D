<template>
  <q-item dense class="boardItem">
    <q-item-section>
      <q-item-label caption>System:</q-item-label>
    </q-item-section>
    <q-item-section side top>
      <div class="q-pa-xs q-gutter-xs no-wrap">
        <q-btn dense size="xs" icon="img:jbicon/seats/seat13.svg">
          <q-badge color="orange" align="top" :label="cc[0]"></q-badge>
          <q-menu dense auto-close>
            <q-list>
              <q-item clickable v-for="c in CCs" :key="c" @click="onCC(0,c)">
                <q-item-section>{{c}}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn dense size="xs" icon="img:jbicon/seats/seat24.svg">
          <q-badge color="orange" align="top" :label="cc[1]"></q-badge>
          <q-menu dense auto-close>
            <q-list dense>
              <q-item clickable v-for="c in CCs" :key="c" @click="onCC(1,c)">
                <q-item-section>{{c}}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'myCC',
  data () {
    return {
      CCs: ['SAYC', '2/1', 'Prec', 'Norway', 'my CC'],
      cc: ['SAYC', 'SAYC']
    }
  },
  methods: {
    onCC (n, c) {
      this.cc.splice(n, 1, c)
    }
  }
}
</script>
