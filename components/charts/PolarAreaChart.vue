<template>
  <v-container>
    <v-row>
      <v-col cols="12" style="text-align: center">
        <div>
          <canvas ref="chartRef"></canvas>
        </div>
        <!-- <h2>Phần mềm đặt lịch hẹn</h2> -->
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { Chart, registerables } from "chart.js";

export default {
  data() {
    return {
      myChart: null,
      chartData: null,
      chartType: "polarArea",
    };
  },
  async mounted() {
    await Chart.register(...registerables);
    await this.$nextTick(async () => {
      await this.renderChart();
    });
  },
  methods: {
    async renderChart() {
      const ctx = this.$refs.chartRef.getContext("2d");

      const colors = [
        "#36d6eb50",
        "#4edcf050",
        "#66e2f550",
        "#7ee8fa50",
        "#96eeff50",
      ];

      const randomNumbers = Array.from(
        { length: 5 },
        () => Math.floor(Math.random() * (15 - 10 + 1)) + 11
      );

      this.myChart = await new Chart(ctx, {
        type: "polarArea",
        data: {
          labels: ["January", "February", "March", "April", "May"],
          datasets: [
            {
              label: "Sales",
              data: randomNumbers,
              backgroundColor: colors,
              borderColor: "#36d6eb",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          resizeDelay: 200, // Giảm giật khi resize
          scales: {
            r: {
              beginAtZero: true,
            },
          },
        },
      });
    },
  },
  watch: {
    chartData: {
      handler() {
        this.renderChart();
      },
      deep: true,
    },
  },
  async beforeUnmount() {
    if (this.myChart) {
      await this.myChart.destroy();
    }
  },
};
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: 250px !important;
  display: block;
}

.custom-card {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
