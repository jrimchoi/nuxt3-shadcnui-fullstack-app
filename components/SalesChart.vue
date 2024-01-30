<template>
  <section class="mt-5">
    <h3 class="font-bold text-primary">Sales over time</h3>
    <div class="mt-5 h-[300px] rounded-lg bg-background md:p-3">
      <Line :data="data" :options="options" />
    </div>
  </section>
</template>

<script lang="ts" setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from 'chart.js';
import { Line } from 'vue-chartjs';
import colors from '#tailwind-config/theme/colors';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const mode = useColorMode();

const options = computed<ChartOptions<'line'>>(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
      tooltip: {
        intersect: false,
      },
    },
    scales: {
      y: {
        grid: {
          color: mode.value === 'dark' ? colors.slate[900] : colors.slate[200],
        },
        ticks: {
          color: colors.slate[500],
        },
      },
      x: {
        grid: {
          color: mode.value === 'dark' ? colors.slate[800] : colors.slate[200],
        },
        ticks: {
          color: colors.slate[500],
        },
      },
    },
  };
});

const data = ref<ChartData<'line'>>({
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Sales over time',
      backgroundColor: colors.background,
      tension: 0.4,
      borderColor: colors.fuchsia[500],
      borderWidth: 2,
      fill: false,
      showLine: true,
      pointBackgroundColor: colors.fuchsia[500],
      data: [40, 39, 10, 40, 39, 80, 40],
    },
    {
      label: 'Sales over top',
      backgroundColor: colors.background,
      tension: 0.4,
      borderColor: colors.blue[500],
      borderWidth: 2,
      fill: false,
      showLine: true,
      pointBackgroundColor: colors.blue[500],
      data: [80, 69, 26, 40, 59, 80, 40],
    },
  ],
});
</script>
