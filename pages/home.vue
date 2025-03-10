<template>
  <v-row>
    <v-col cols="12" md="6" sm="12">
      <v-card>
        <v-card-text>
          <client-only>
            <Dashboard />
          </client-only>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="6" sm="12">
      <v-card>
        <v-card-text>
          <client-only>
            <Dashboard />
          </client-only>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
import Dashboard from "~/components/Dashboard.vue";
export default {
  name: "HomePage",
  components: {
    Dashboard,
  },
  data() {
    return {};
  },
};
</script>

<style scoped>
.background_style {
}
</style>