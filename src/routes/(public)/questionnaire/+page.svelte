<script lang="ts">
    import type { PageData } from './$types';
	import type { Category, Question } from '@prisma/client';
	import { onMount } from 'svelte';
    import { page } from '$app/stores';
	import ButtonGrey from '$lib/components/ButtonGrey.svelte';
	import { goto } from '$app/navigation';
	import Heading1 from '$lib/components/Heading1.svelte';
	import SelectCategory from '$lib/components/questionnaire/SelectCategory.svelte';
	import AnswerQuestions from '$lib/components/questionnaire/AnswerQuestions.svelte';
	import Paragraph from '$lib/components/Paragraph.svelte';
    import { PUBLIC_ADMIN_MAIL } from '$env/static/public';

	export let data: PageData;
    let allowSavingResultToTeam: boolean = true;
    let teamToSaveTo: string | null;
    let currentlyFinalizing = false;
    let categories: Category[] = [];
    let teamToSaveToInfo;
    let questionnaireId: string | null;
    let questions: Question[] = [];
    let allowCategorySelection = true;
    let state = 'SelectCategory';

    onMount(() => {
        let callNextState = false;
        if ($page.url.searchParams.has('id')) {
            questionnaireId = $page.url.searchParams.get('id');
            categories = data.resultSets[0].categories;
            callNextState = true;
        }
        else if ($page.url.searchParams.has('categories')) {
            $page.url.searchParams.get('categories')?.split(',').forEach(category => {
                const dataObj = data.categories.find(cat => cat.label.toLowerCase() === category);
                if (typeof dataObj !== 'undefined') {
                    categories = [...categories, dataObj];
                    allowCategorySelection = false; // only allow category selection if not available in query params
                }
            });
        }
        if ($page.url.searchParams.has('team')) {
            teamToSaveTo = $page.url.searchParams.get('team');
        }
        if (callNextState) {
            toNextState();
        }
    });

    function toNextState (event?: Event): void {
        switch (state) {
            case 'SelectCategory':
                state = 'AnswerQuestions';
                break;
            case 'AnswerQuestions':
                switchToFinalizeResultSetState();
                state ='FinalizeResultSet';
                break;
            case 'FinalizeResultSet':
                finalizeForm();
                break;
        }
    }

    async function finalizeForm(): Promise<void> {
        if (!currentlyFinalizing) {
            currentlyFinalizing = true;
            await fetch('/api/public/resultset/'+questionnaireId+'/evaluate/', {
                method: 'POST'
            });
            if (allowSavingResultToTeam && teamToSaveTo && questionnaireId) {
                await fetch('/api/public/team/'+teamToSaveTo+'/resultset/'+questionnaireId+'/', {
                    method: 'POST'
                });
            }
            goto('/result?id='+questionnaireId, {
                replaceState: true,
                invalidateAll: true
            });
        }
    }

    async function switchToFinalizeResultSetState(): Promise<void> {
        if (teamToSaveTo && allowSavingResultToTeam) {
            const response = await fetch('/api/public/team/'+teamToSaveTo+'/');
            const resJson = await response.json();
            if (resJson.status === 200) {
                teamToSaveToInfo = resJson.data;
            }
        }
    }
</script>

<Heading1 centered>Fragebogen</Heading1>
{#if state === 'SelectCategory'}
<SelectCategory
    loadedCategories={data.categories}
    loggedInUser={data.user}
    allowCategorySelection={allowCategorySelection}
    bind:categories={categories}
    bind:questionnaireId={questionnaireId}
    on:proceed={toNextState} />
{:else if state ==='AnswerQuestions'}
{#if questionnaireId}
<AnswerQuestions
    initialScaleItems={data.scaleItems}
    questions={data.questions}
    categories={categories}
    questionnaireId={questionnaireId}
    on:proceed={toNextState}/>
{:else}
<Paragraph>Da ist etwas schief gelaufen. Tut mir leid. Bitte melden Sie dies an: <a href="mailto:{PUBLIC_ADMIN_MAIL}">{PUBLIC_ADMIN_MAIL}</a>.</Paragraph>
{/if}
{:else if state ==='FinalizeResultSet'}
<form class="w-full place-content-center px-3 mb-2">
{#if teamToSaveTo}
    <div class="w-full lg:w-1/2 mx-auto mb-3 text-center">
        <label>
            <input type="checkbox" checked={allowSavingResultToTeam} />
            Mein Resultat darf dem Team {#if teamToSaveToInfo}{teamToSaveToInfo.name} (Administrierende: {#each teamToSaveToInfo.users as admin, i}{admin.user.name}{#if i + 1 < teamToSaveToInfo.users.length }, {/if}{/each}){/if} hinzugefügt werden.
        </label>
    </div>
{/if}
</form>
<div class="w-full text-center mb-3">
    <ButtonGrey on:callback={toNextState}>Zur Auswertung</ButtonGrey>
</div>
{/if}
