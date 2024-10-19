<script lang="ts">
	import ButtonBlue from "$lib/components/ButtonBlue.svelte";
    import { createEventDispatcher, onMount } from "svelte";
	import { filterQuestionsByCategoryInCategories } from "$lib/common";
    import { page } from '$app/stores';
	import Paragraph from "$lib/components/Paragraph.svelte";
    import { PUBLIC_ADMIN_MAIL } from '$env/static/public';
    import type { Category } from "@prisma/client";
    import type { Answer, Question, ScaleItem } from "@prisma/client";

    const dispatch = createEventDispatcher();
    const maxNbrOfQuestionsInSet = 5;

    export let initialScaleItems: ScaleItem[];
    export let questions: Question[];
    export let categories: Category[];
    export let questionnaireId: string;

    let curQuestionSet: Question[] = [];
    let curAnswerSet: Answer[] = [];
    let curScaleItems: ScaleItem[] = [];
    let totalAmountOfQuestions: number = 0;
    let showReturnUrl = false;

    onMount(() => {
        initializeQuestionnaire();
    })

    async function initializeQuestionnaire() {
        questions = filterQuestionsByCategoryInCategories(questions, categories);
        totalAmountOfQuestions = questions.length;
        if (questionnaireId) {
            const response = await fetch('/api/public/resultset/'+questionnaireId+'/');
            const resJson = await response.json();
            if (resJson.status === 200) {
                const answeredQuestionIds = resJson.data.answers.map(elem => { return elem.question.id; });
                questions = questions.filter(elem => {
                    const questionIsAnswered = answeredQuestionIds.find(aqid => aqid === elem.id);
                    return typeof questionIsAnswered === 'undefined';
                });
            }
        }
        updateCategoryBasedOnFirstQuestion(questions, categories);
    }

    function updateCategoryBasedOnFirstQuestion(questions: Question[], categories: Category[]) {
        if (questions.length > 0) {
            const curCategory = categories.find(elem => elem.id === questions[0].categoryId);
            if (typeof curCategory !== 'undefined') {
                curQuestionSet = prepareQuestionSet(curCategory);
                curScaleItems = prepareScale(curCategory);
            }
        } else {
            dispatch('proceed');
        }
    }

    function prepareQuestionSet(curCategory: Category): Question[] {
        let filteredQuestions = filterQuestionsByCategoryInCategories(questions, [curCategory]);
        if (filteredQuestions.length > maxNbrOfQuestionsInSet) {
            filteredQuestions = filteredQuestions.slice(0, maxNbrOfQuestionsInSet);
        }
        return filteredQuestions;
    }

    function prepareScale(curCategory: Category): ScaleItem[] {
        return initialScaleItems.filter(elem => elem.categoryId === curCategory.id);
    }

    async function selectValue(q: Question, si: ScaleItem) {
        const existingAnswer = curAnswerSet.find(elem => elem.questionId === q.id);
        if (typeof existingAnswer !== 'undefined') {
            existingAnswer.scaleItemId = si.id;
            curAnswerSet = curAnswerSet;
        } else {
            curAnswerSet = [...curAnswerSet, {
                resultSetId: questionnaireId ? questionnaireId : '',
                questionId: q.id,
                scaleItemId: si.id
            }];
        }
        if (curAnswerSet.length === curQuestionSet.length) {
            const response = await fetch('/api/public/resultset/'+questionnaireId+'/answers/', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    answers: curAnswerSet.map(elem => { return {questionId: elem.questionId, scaleItemId: elem.scaleItemId}})
                })
            });
            questions = questions.filter(elem => { 
                const isAnswered = curAnswerSet.find(cas => cas.questionId === elem.id);
                return typeof isAnswered === 'undefined';
            });
            curAnswerSet = [];
            updateCategoryBasedOnFirstQuestion(questions, categories);
        }
    }
</script>

<svelte:window on:beforeunload|preventDefault={() => { showReturnUrl = true; }} />
{#if totalAmountOfQuestions > 0}
<div class="flex flex-wrap">
    {#if showReturnUrl}
    <div class="w-full pt-3 pb-5">
        <p class="mx-1 text-center">Sie können den Fragebogen unter folgendem Link später fertigstellen: <a href="https://{$page.url.host}/questionnaire?id={questionnaireId}">{$page.url.host}/questionnaire?id={questionnaireId}</a></p>
    </div>
    {/if}
    <div class="w-full pt-3 pb-5">
        <p class="mx-1 text-center">
            Skala: {#each curScaleItems as scaleItem, i}{scaleItem.value}: {scaleItem.label}{#if i + 1 < curScaleItems.length}; {/if}{/each}.
        </p>
    </div>
    <div class="w-full pb-2"><hr /></div>
    {#each curQuestionSet as question}
    <div class="w-full pb-2 lg:w-1/2 xl:w-2/3 content-center pr-2">
        <p class="mx-1 text-center lg:text-right">{@html question.label}</p>
    </div>
    <div class="w-full pb-2 lg:w-1/2 xl:w-1/3 inline-flex flex-wrap place-content-center">
        {#each curScaleItems as scaleItem}
        <div class="flex-shrink px-3 pb-3 md:pb-0">
            <ButtonBlue on:callback={() => selectValue(question, scaleItem)} selected={curAnswerSet.find(elem => elem.questionId === question.id)?.scaleItemId === scaleItem.id}>{scaleItem.value}</ButtonBlue>
        </div>
        {/each}
    </div>
    <div class="w-full pb-2"><hr /></div>
    {/each}
    <div class="w-full bg-gray-200 h-2.5 dark:bg-gray-700 mb-3">
        <div class="bg-blue-600 h-2.5" style="width: {(1 - questions.length/totalAmountOfQuestions) * 100}%"></div>
    </div>
</div>
{:else}
<Paragraph>Die Fragen konnten nicht geladen werden. Bitte melden Sie dies an <a href="mailto:{PUBLIC_ADMIN_MAIL}">{PUBLIC_ADMIN_MAIL}</a>.</Paragraph>
{/if}