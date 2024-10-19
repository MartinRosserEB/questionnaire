<script lang="ts">
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    export let selected: boolean = false, disabled: boolean = false;
    const selectedClasses = 'text-white bg-blue-500 border hover:bg-blue-700';
    const unselectedClasses = 'bg-transparent hover:bg-blue-500 text-blue-700 hover:text-white border border-blue-500 hover:border-transparent';

    function callback() {
        dispatch('callback');
    }
</script>

<button class="py-2 px-4 rounded {selected ? selectedClasses : unselectedClasses}" on:click={callback} disabled="{disabled}">
    <slot />
</button>