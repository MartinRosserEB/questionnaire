<script lang="ts">
    import autocolors from 'chartjs-plugin-autocolors';
    import type { ResultGraphDataSets, ResultGraphLabel } from '$lib/custom-types';
    import { Bar } from 'svelte-chartjs';
    import {
      Chart,
      Title,
      Tooltip,
      Legend,
      BarElement,
      CategoryScale,
      LinearScale,
    } from 'chart.js';

    export let datasets: ResultGraphDataSets;
    export let labels: ResultGraphLabel;
    
    $: valueChanged(datasets);
    function valueChanged(datasets: ResultGraphDataSets) {
        chartdata.datasets = datasets;
    }

    const chartdata = {
        labels: labels,
        datasets: datasets,
    };

    Chart.register(
      Title,
      Tooltip,
      Legend,
      BarElement,
      CategoryScale,
      LinearScale,
      autocolors
    );
  </script>
  
  <Bar data={chartdata} options={{ responsive: true, maintainAspectRatio: false }} />
  