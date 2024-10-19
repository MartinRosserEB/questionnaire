<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { PlotResult } from '$lib/custom-types';
	import Heading1 from '$lib/components/Heading1.svelte';
	import Heading2 from '$lib/components/Heading2.svelte';
	import { prepareAndDistributeResultSet } from '$lib/client-plot-functions';

    export let data: PageData;
    let evaluatedResultSets: PlotResult[] = [] as PlotResult[];

    onMount(() => {
        data.resultSets
            .filter(resultSet => { return resultSet.sumItems.length > 0 || resultSet.percentItems.length > 0; })
            .forEach(filteredResSet => { prepareAndDistributeResultSet(filteredResSet, evaluatedResultSets, data.categories); });
        evaluatedResultSets = evaluatedResultSets;
    });    
</script>
<Heading1 centered>Resultate</Heading1>
<div class="flex flex-wrap place-content-evenly flex-row">
    {#each evaluatedResultSets as evaluatedResultSet}
    <div class="w-full lg:w-2/5">
        <div class="p-3 border rounded mb-3">
            <Heading2 centered>{evaluatedResultSet.categoryLabel}</Heading2>
            {#await import('../../../lib/components/results/'+evaluatedResultSet.categoryLabel+'.svelte') then module}
            <div class="w-full">
                <svelte:component this={module.default} plotData={evaluatedResultSet.plotData} plotLabels={evaluatedResultSet.plotLabels} />
            </div>
            {/await}
        </div>
    </div>
    {/each}
    <div class="w-full inline-flex my-6">
        <div class="w-1/2 text-center">
            <a href="/">Zurück zur Hauptseite</a>
        </div>
        <div class="w-1/2 text-center">
            <a href="/questionnaire">Einen neuen Fragebogen ausfüllen</a>
        </div>
    </div>
</div>
