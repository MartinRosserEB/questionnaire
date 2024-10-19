<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { PlotResult } from '$lib/custom-types';
	import Heading2 from '$lib/components/Heading2.svelte';
	import { prepareAndDistributeResultSet } from '$lib/client-plot-functions';

    export let data: PageData;
    let evaluatedResultSets: PlotResult[] = [] as PlotResult[];
    let triggerResultVisible: {label: string, visible: boolean}[] = [];

    function toggleVisible(label: string) {
        console.log(label);
        if (typeof triggerResultVisible.find(elem => elem.label === label) !== 'undefined') {
            triggerResultVisible = triggerResultVisible.filter(item => item.label !== label);
        } else {
            triggerResultVisible = [...triggerResultVisible, {
                label: label,
                visible: true
            }];
        }
    }

    onMount(() => {
        data.resultSets
            .filter(resultSet => { return resultSet.sumItems.length > 0 || resultSet.percentItems.length > 0; })
            .forEach(filteredResSet => { prepareAndDistributeResultSet(filteredResSet, evaluatedResultSets, data.categories); });
        evaluatedResultSets = evaluatedResultSets;
    });
</script>

{#each evaluatedResultSets as evaluatedResultSet}
<div class="w-full">
    <Heading2><button on:click={() => toggleVisible(evaluatedResultSet.categoryLabel)}>{evaluatedResultSet.categoryLabel}</button></Heading2>
</div>
{#await import('../../../lib/components/results/'+evaluatedResultSet.categoryLabel+'.svelte') then module}
{#if typeof triggerResultVisible.find(elem => elem.label === evaluatedResultSet.categoryLabel) !== 'undefined'}
<div class="w-full">
    <svelte:component this={module.default} plotData={evaluatedResultSet.plotData} plotLabels={evaluatedResultSet.plotLabels} />
</div>
{/if}
{/await}
{/each}
