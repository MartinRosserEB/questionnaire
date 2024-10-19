<script lang="ts">
    import type { PageData } from './$types';
    import Select from 'svelte-select';
	import { onMount } from 'svelte';
	import ButtonBlue from '$lib/components/ButtonBlue.svelte';
	import type { Category, ResultSet } from '@prisma/client';

	export let data: PageData;
    const placeholder = 'Fragebogen laden';
    const placeholderCalSelect = 'Kategorien';
    let selectedResultSet: ResultSet | null;
    let selectedCategories: {value: string, label: string|null}[] = [];
    let hasUnansweredQuestions = false;
    let availableCategories: {value: string, label: string|null}[] = [];
    let selectedValue: {value: string, label: string, created: boolean|undefined}|null = null;
    let resultSets: {value: string, label: string|null, created: boolean|undefined}[] = []; // for select-component https://github.com/rob-balfre/svelte-select
    
    onMount(() => {
        populateResultSets();
        populateCategories();
        selectedCategories = availableCategories;
    });

    function populateResultSets() {
        data.resultSets.forEach(resultSet => {
            resultSets = [...resultSets, {
                value: resultSet.id,
                label: resultSet.name,
                created: false
            }];
        })
    }

    function populateCategories() {
        data.categories.forEach(cat => {
            availableCategories = [...availableCategories, {
                value: cat.id,
                label: cat.label
            }];
        })
    }

    function filterResultSets(event: CustomEvent) {
        resultSets = [];
        data.resultSets.forEach(resultSet => {
            let addResSet = false;
            resultSet.categories.forEach(cat => {
                if (selectedCategories !== null && typeof (selectedCategories.find(selCat => selCat.value === cat.id)) !== 'undefined') {
                    // Add to result set if any of the categories match
                    addResSet = true;
                }
            });
            if (addResSet) {
                resultSets = [...resultSets, {
                    value: resultSet.id,
                    label: resultSet.name,
                    created: false
                }];
            }
        });
    }

    function handleChange(event: CustomEvent) {
        const findSet = data.resultSets.find(resultSet => resultSet.id === event.detail.value);
        if (typeof findSet !== 'undefined') {
            selectedResultSet = findSet;
            hasUnansweredQuestions = false;
            selectedResultSet.categories.forEach(cat => {
                const qLen = data.questions.filter(q => q.categoryId === cat.id).length;
                const answLen = filterAnswersByCategory(cat).length;
                if (answLen < qLen) {
                    hasUnansweredQuestions = true;
                }
            });
        } else {
            selectedResultSet = null;
            hasUnansweredQuestions = false;
        }
    }

    function filterScaleItemsByCategory(category: Category) {
        return data.scaleItems.filter(elem => elem.categoryId === category.id);
    }

    function filterAnswersByCategory(category: Category) {
        return selectedResultSet.answers.filter(elem => {
            const curQ = data.questions.find(q => q.id === elem.questionId);
            if (typeof curQ !== 'undefined') {
                return curQ.categoryId === category.id;
            }
            return false;
        });
    }

    function extractQuestionById(qId: string) {
        return data.questions.find(q => q.id === qId);
    }
</script>

<div class="flex flex-wrap">
    <div class="w-full lg:w-1/4">
        <Select multiple={true} on:change={filterResultSets} on:clear={filterResultSets} bind:items={availableCategories} bind:value={selectedCategories} placeholder={placeholderCalSelect}>
            <div slot="item" let:item>{item.label}</div>
        </Select>
    </div>
    <div class="w-full lg:w-1/4">
        <Select on:change={handleChange} bind:items={resultSets} bind:value={selectedValue} placeholder={placeholder}>
            <div slot="item" let:item>{item.label}</div>
        </Select>
    </div>
    <div class="w-full lg:w-1/4 text-center place-content-center">
        {#if hasUnansweredQuestions === true}<a href="/questionnaire?id={selectedResultSet.id}">Fragebogen fertig beantworten</a>{/if}
    </div>
    <div class="w-full lg:w-1/4 text-center place-content-center">
        <a href="/questionnaire">Neuen Fragebogen ausfüllen</a>
    </div>
    <hr />
    {#if selectedResultSet}
    {#each selectedResultSet?.categories as category}
    <div class="w-full pt-3 pb-5">
        <p class="mx-1 text-center"><strong>{category.label}</strong>
            {#if filterScaleItemsByCategory(category).length > 0} Skala: 
            {#each filterScaleItemsByCategory(category) as scaleItem, i}
                {scaleItem.value}: {scaleItem.label};&nbsp;
            {/each}
            {/if}
        </p>
    </div>
    <div class="w-full pb-2"><hr /></div>
    {#if filterAnswersByCategory(category).length > 0}
    {#each filterAnswersByCategory(category) as answer}
    <div class="w-full pb-2 lg:w-2/3 content-center pr-2"><p class="mx-1 text-center lg:text-right">{@html extractQuestionById(answer.questionId).label}</p></div>
    <div class="w-full pb-2 lg:w-1/3 inline-flex flex-wrap place-content-center">
        {#if filterScaleItemsByCategory(category).length > 0}
        {#each filterScaleItemsByCategory(category) as scaleItem, i}
        <div class="flex-shrink px-3 pb-3 md:pb-0">
            <ButtonBlue selected={answer.scaleItem.id === scaleItem.id}>{scaleItem.value}</ButtonBlue>
        </div>
        {/each}
        {/if}
    </div>
    <div class="w-full pb-2"><hr /></div>
    {/each}
    {/if}
    {/each}
    {/if}
</div>
