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
    this.$nextTick(() => {
      this.renderChart();
    });
  },
  methods: {
    renderChart() {
      const canvas = this.$refs.chartRef;

      if (!canvas) {
        console.error("Canvas element not found");
        return;
      }

      const ctx = canvas.getContext("2d");

      // Tạo Gradient dọc (top to bottom)
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, "rgba(54, 162, 235, 0.3)"); // Màu đậm ở gần
      gradient.addColorStop(1, "rgba(54, 162, 235, 0)"); // Mờ dần khi xa


      // Gradient cho đường thứ hai
      const gradient2 = ctx.createLinearGradient(0, 0, 0, 400);
      gradient2.addColorStop(0, "rgba(54, 214, 235, 0.3)"); // Đỏ đậm
      gradient2.addColorStop(1, "rgba(54, 214, 235, 0)"); // Mờ dần

      const randomNumbers = Array.from({ length: 10 }, () => Math.floor(Math.random() * (22 - 10 + 1)) + 11);
      const randomNumbers2 = Array.from({ length: 10 }, () => Math.floor(Math.random() * (22 - 10 + 1)) + 11);
      
      this.myChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October"],
          datasets: [
            {
              label: "Sales",
              data: randomNumbers,
              borderColor: "#36A2EB",
              borderWidth: 2,
              fill: "start", // Fill từ đường biểu đồ lên trên

              backgroundColor: gradient, // Áp dụng gradient cho fill
              tension: 0.4, // Đường cong mượt
              pointRadius: 2, // Ẩn các điểm trên đường
            },
            {
              label: "Sales 2025",
              data: randomNumbers2,
              borderColor: "#36d6eb",
              backgroundColor: gradient2,
              borderWidth: 2,
              fill: "start",
              tension: 0.4,
              pointRadius: 2,
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
  width: 100% !important;
  height: 200px !important;
  display: block;
}

.custom-card {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
