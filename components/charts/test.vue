<template>
  <div>
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script>
import { Chart, registerables } from 'chart.js'

export default {
  props: {
    chartData: {
      type: Object,
      required: true
    },
    chartType: {
      type: String,
      default: 'bar'
    }
  },
  data() {
    return {
      myChart: null
    }
  },
  mounted() {
    Chart.register(...registerables)
    this.renderChart()
  },
  methods: {
    renderChart() {
      if (this.myChart) {
        this.myChart.destroy()
      }

      this.myChart = new Chart(this.$refs.chartRef, {
        type: this.chartType,
        data: this.chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })
    }
  },
  watch: {
    chartData: {
      handler() {
        this.renderChart()
      },
      deep: true
    }
  },
  beforeUnmount() {
    if (this.myChart) {
      this.myChart.destroy()
    }
  }
}
</script>

<style scoped>
canvas {
  width: 100%;
  height: 400px;
}
</style>
