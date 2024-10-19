<script lang="ts">
	import ButtonGrey from "$lib/components/ButtonGrey.svelte";
	import ButtonBlue from "$lib/components/ButtonBlue.svelte";
    import Paragraph from "$lib/components/Paragraph.svelte";
    import ParagraphRedForm from "$lib/components/ParagraphRedForm.svelte";
    import { createEventDispatcher, onMount } from "svelte";
	import { signIn } from '@auth/sveltekit/client';
	import type { Category } from "@prisma/client";

    const dispatch = createEventDispatcher();

    export let loadedCategories: Category[];
    export let categories: Category[] = [];
    export let questionnaireId: string | null;
    export let loggedInUser: string | undefined;
    export let allowCategorySelection = true;

    let resultSetName: string | null = null;
    let resultSetNameDefined: boolean | null;
    let categoriesDefined: boolean | null;

    function proceed() {
        let allowContinuation = true;
        if (resultSetName === null || resultSetName === '') {
            resultSetNameDefined = false;
            allowContinuation = false;
        } else {
            resultSetNameDefined = true;
        }
        if (categories.length === 0) {
            categoriesDefined = false;
            allowContinuation = false;
        } else {
            categoriesDefined = true;
        }
        if (allowContinuation) {
            storeQuestionnaireAndProceed();
        }
    }

    async function storeQuestionnaireAndProceed() {
        let body = {
            categories: categories.map(elem => { return {id: elem.id, label: elem.label}; }),
            name: resultSetName,
            user: loggedInUser
        }
        const response = await fetch('/api/public/resultset/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });
        const resJson = await response.json();
        if (resJson.status === 201) {
            questionnaireId = resJson.data.id;
            dispatch('proceed');
        } else {
            console.error('Could not create questionnaire. Likely server communication error.');
            console.log(response, resJson);
        }
    }

    function toggleCategory(cat: Category) {
        const catObj = categories.find(item => cat.id === item.id);
        if (typeof catObj !== 'undefined') {
            categories = categories.filter(item => item.id !== cat.id);
        } else {
            const dataCatObj = loadedCategories.find(item => cat.id === item.id);
            if (typeof dataCatObj !== 'undefined') {
                categories = [...categories, dataCatObj];
            }
        }
    }
</script>

<form class="w-full place-content-center px-3 mb-2 mt-2">
    <div class="flex flex-wrap pb-3 place-content-center">
        <div class="w-full lg:w-1/2 mx-auto mb-3">
            <label>
                <input
                    bind:value={resultSetName}
                    class="appearance-none mb-2 block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    type="text"
                    placeholder="Name des Fragebogens, z.B. Datum" />
            </label>
            {#if resultSetNameDefined === false && !resultSetName}
            <ParagraphRedForm>Bitte wählen Sie einen Namen für Ihren Fragebogen.</ParagraphRedForm>
            {/if}
        </div>
        {#if allowCategorySelection}
        <div class="w-full text-center">
            <p>Bitte wählen Sie die Kategorien aus für Ihren Fragebogen.</p>
        </div>
        <div class="w-full inline-flex place-content-center flex-wrap">
            {#each loadedCategories as category, i}
            <div class="shrink py-2" class:pr-2={i + 1 < loadedCategories.length }>
                <ButtonBlue
                    on:callback={() => toggleCategory(category)}
                    selected={typeof categories.find(item => item.id === category.id) !== 'undefined'}>
                    {category.label}</ButtonBlue>
            </div>
            {/each}
        </div>
        {#if categoriesDefined === false && categories.length===0}
        <ParagraphRedForm>Bitte wählen Sie mindestens eine Kategorie.</ParagraphRedForm>
        {/if}
        {/if}
    </div>
</form>
{#if !loggedInUser && questionnaireId}
<div class="w-full text-center my-2">
    <div class="w-full">
        <Paragraph>Der Fragebogen mit der gewünschten ID wurde nicht gefunden.</Paragraph>
        <Paragraph>Falls Sie ihn unter Ihrem Benutzerkonto gespeichert haben, dann loggen Sie sich bitte ein:</Paragraph>
    </div>
    <div class="w-full py-2">
        <ButtonBlue on:callback={() => signIn(
            'auth0', {
                redirect: false
            },
            {
                scope: 'api openid profile email'
            }
            )}>Login</ButtonBlue>
    </div>
</div>
{/if}
<div class="flex place-content-center my-2">
    <ButtonGrey on:callback={proceed}>Weiter</ButtonGrey>
</div>
