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
      chartType: "line",
    };
  },
  mounted() {
    Chart.register(...registerables);
    this.renderChart();
  },
  methods: {
    renderChart() {
      const ctx = this.$refs.chartRef.getContext("2d");

      // Tạo Gradient dọc (top to bottom)
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, "rgba(54, 162, 235, 0.8)"); // Màu đậm ở gần
      gradient.addColorStop(1, "rgba(54, 162, 235, 0)"); // Mờ dần khi xa

      this.myChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["January", "February", "March", "April"],
          datasets: [
            {
              label: "Sales",
              data: [10, 20, 15, 25],
              borderColor: "#36A2EB",
              borderWidth: 2,
              fill: "start", // Fill từ đường biểu đồ lên trên

              backgroundColor: gradient, // Áp dụng gradient cho fill
              tension: 0.4, // Đường cong mượt
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
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
  beforeUnmount() {
    if (this.myChart) {
      this.myChart.destroy();
    }
  },
};
</script>

<style scoped>
canvas {
  width: 100%;
  height: 400px;
}

.custom-card {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
