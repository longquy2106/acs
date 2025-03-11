<template>
  <v-row dense>
    <v-col cols="12" md="4" sm="12">
      <v-card>
        <v-card-text>
          <client-only>
            <PolarAreaChart />
          </client-only>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="8" sm="12">
      <v-card>
        <v-card-text>
          <client-only>
            <LineChart />
          </client-only>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="8" sm="12">
      <v-card>
        <v-card-text>
          <client-only>
            <BarChart />
          </client-only>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" md="4" sm="12">
      <v-card>
        <v-card-text>
          <client-only>
            <PolarAreaChart />
          </client-only>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
<script>
import BarChart from "~/components/charts/BarChart.vue";
import LineChart from "~/components/charts/LineChart.vue";
import PolarAreaChart from "~/components/charts/PolarAreaChart.vue";

export default {
  name: "HomePage",
  components: {
    LineChart,
    PolarAreaChart,
    BarChart,
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