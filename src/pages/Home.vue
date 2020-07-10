<template>
  <q-page padding>
    <!-- content -->
    <q-markup-table flat bordered>
      <thead class="bg-teal">
        <tr>
          <th colspan="5">
            <div class="row no-wrap items-center">
              <q-img
                style="width: 70px"
                :ratio="1"
                class="rounded-borders"
                src="jbicon/seats/seat0.svg"
              />

              <div class="text-h4 q-ml-md text-white">🏆Top Players:</div>
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
      <tbody class="bg-grey-3">
      </tbody>
    </q-markup-table>
  </q-page>
</template>

<script>
export default {
  name: 'Home'
}
</script>
