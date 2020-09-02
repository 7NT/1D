<template>
  <q-page padding class='fit'>
    <!-- content -->
    <div class='column container'>
      <div class='col-10 tops'>
        <q-markup-table flat bordered>
          <thead class='bg-teal'>
            <tr>
              <th colspan='5'>
                <div class='row no-wrap items-center'>
                  <q-img
                    style='width: 70px'
                    :ratio='1'
                    class='rounded-borders'
                    src='jbIcon/seats/seat0.svg'
                  />

                  <div class='text-h4 q-ml-md text-white'>🏆Top Players:</div>
                </div>
              </th>
            </tr>
            <tr>
              <th>XIMP</th>
              <th>IMP</th>
              <th>MP</th>
              <th>Tourney</th>
              <th>Team</th>
            </tr>
          </thead>
          <tbody class='bg-grey-3'></tbody>
        </q-markup-table>
        <q-space />
      </div>
      <div class='col-2'>
        <EssentialLink v-for='link in essentialLinks' :key='link.title' v-bind='link' />
      </div>
    </div>
    <q-footer reveal elevated bordered class='bg-grey-1 text-primary fixed-bottom'>
      ✉ Contact:
      <a href='mailto:help@jbridge.net'>Email Us</a>
    </q-footer>
  </q-page>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'

const linkData = [
  {
    title: 'Convention Card Editor',
    caption: 'bridgewinners.com',
    icon: 'bookmark_border',
    link: 'https://bridgewinners.com/convention-card/'
  },
  {
    title: 'UI Avatars',
    caption: 'Generate avatars with initials from names',
    icon: 'bookmark_border',
    link: 'https://ui-avatars.com/'
  }
]
export default {
  name: 'Home',
  components: { EssentialLink },

  data () {
    return {
      essentialLinks: linkData
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 85vh;
}
.tops {
  flex: 1;
}
</style>
