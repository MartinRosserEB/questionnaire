<script lang="ts">
    import type { PageData } from '../../../routes/(registered)/configuration/$types';
    import Select from 'svelte-select';
    import { onMount } from 'svelte';
	import type { Question, ScaleItem } from '@prisma/client';
	import UnorderedList from '../UnorderedList.svelte';
    
    export let data: PageData;
    const placeholderCalSelect = 'Kategorien', placeholderSubCalSelect = 'Unterkategorien';;
    let availableCategories: {value: string, label: string|null}[] = [];
    let selectedCategory: {value: string, label: string|null}|null;
    let availableSubCategories: {value: string, label: string|null}[] = [];
    let selectedSubCategory: {value: string, label: string|null}|null;
    let filteredQuestions: Question[] = [];
    let filteredScaleItems: ScaleItem[] = [];

    onMount(() => {
        populateCategories();
    });

    function populateCategories() {
        data.categories.forEach(cat => {
            availableCategories = [...availableCategories, {
                value: cat.id,
                label: cat.label
            }];
        })
    }

    function updateSelectedCategory(event: CustomEvent) {
        const findCategory = data.categories.find(category => category.id === event.detail.value);
        if (typeof findCategory !== 'undefined') {
            selectedCategory = {
                "value": findCategory.id,
                "label": findCategory.label
            }
            availableSubCategories = [];
            findCategory.subCategories.forEach(subCat => {
                availableSubCategories = [...availableSubCategories, {
                    value: subCat.id,
                    label: subCat.label
                }];
            });
            filteredScaleItems = data.scaleItems.filter(scaleItem => scaleItem.categoryId === findCategory.id);
            selectedSubCategory = null;
            filteredQuestions = [];
        } else {
            selectedCategory = null;
            filteredScaleItems = [];
        }
    }

    function clearCategory() {
        selectedCategory = null;
        filteredScaleItems = [];
    }

    function updateSelectedSubCategory(event: CustomEvent) {
        filteredQuestions = data.questions.filter(question => question.subCategoryId === event.detail.value);
    }
</script>

<div class="w-full">
    <Select on:change={updateSelectedCategory} on:clear={clearCategory} bind:items={availableCategories} bind:value={selectedCategory} placeholder={placeholderCalSelect}>
        <div slot="item" let:item>{item.label}</div>
    </Select>
</div>
{#if selectedCategory}
<div class="w-full">
    <UnorderedList>
        {#each filteredScaleItems as scaleItem}
        <li><i>{scaleItem.label}</i> → {scaleItem.value}</li>
        {/each}
    </UnorderedList>
</div>
<div class="w-full">
    <Select on:change={updateSelectedSubCategory} on:clear={() => { filteredQuestions = []; }} bind:items={availableSubCategories} bind:value={selectedSubCategory} placeholder={placeholderSubCalSelect}>
        <div slot="item" let:item>{item.label}</div>
    </Select>
</div>
{/if}
<div class="w-full">
    <UnorderedList>
        {#each filteredQuestions as question}
        <li><i>{question.label}</i></li>
        {/each}
    </UnorderedList>
</div>