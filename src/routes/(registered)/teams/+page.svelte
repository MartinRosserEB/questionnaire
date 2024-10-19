<script lang="ts">
	import { team, teamResults } from '../../../store';
    import { t } from '$lib/translations/i18n';
	import type { PageData } from './$types';
	import type { PlotResult, TeamResult } from '$lib/custom-types';
	import Heading1 from '$lib/components/Heading1.svelte';
	import ButtonBlue from '$lib/components/ButtonBlue.svelte';
	import Heading2 from '$lib/components/Heading2.svelte';
	import { prepareAndDistributeResultSet } from '$lib/client-plot-functions';

    export let data: PageData;

    let evaluatedResultSets: PlotResult[] = [] as PlotResult[];

    async function loadTeamResults(teamId: string, teamDesc: string) {
        $team.id = teamId;
        $team.name = teamDesc;
        const response = await fetch('/api/team/'+teamId+'/result');
        const teamData: {results: TeamResult[]} = await response.json();
        if (teamData) {
            $teamResults = teamData.results;
            evaluatedResultSets = [];
            teamData.results.forEach(resultSet => {
                prepareAndDistributeResultSet(resultSet, evaluatedResultSets, data.categories)
            });
        }
    }

    async function toggleResultInCurrentTeam(resId: string, resDesc: string) {
        const response = await fetch('/api/team/'+$team.id+'/result', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                result: resId
            })
        });
        if (response.status === 200) { 
            loadTeamResults($team.id, $team.name);
        }
    }
</script>

<Heading1>{$t('common.teams')}</Heading1>
<div class="flex flex-wrap">
    {#each data.teams as curTeam}
    <div class="flex-shrink px-1 py-1">
        <ButtonBlue selected={curTeam.id === $team.id} on:callback={() => loadTeamResults(curTeam.id, curTeam.name)}>{curTeam.name}</ButtonBlue>
    </div>
    {/each}
</div>
<div class="flex flex-wrap mt-3">
    {#if $team.id}
    <div class="w-1/3">{$t('teams.add_remove_results_team', { name: $team.name })}</div>
    {#each data.resultSets as resultSet}
    <div class="flex-shrink px-1 py-1">
        <ButtonBlue selected={typeof $teamResults.find(item => resultSet.id === item.id) !== 'undefined'} on:callback={() => toggleResultInCurrentTeam(resultSet.id, resultSet.name)}>{resultSet.name}</ButtonBlue>
    </div>
    {/each}
    {/if}
</div>

{#each evaluatedResultSets as evaluatedResultSet}
<div class="w-full pt-3">
    <Heading2>{evaluatedResultSet.categoryLabel}</Heading2>
</div>
{#await import('../../../lib/components/results/'+evaluatedResultSet.categoryLabel+'.svelte') then module}
<div class="w-full">
    <svelte:component this={module.default} plotData={evaluatedResultSet.plotData} plotLabels={evaluatedResultSet.plotLabels} />
</div>
{/await}
{/each}
