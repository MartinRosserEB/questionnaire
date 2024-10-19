<script lang="ts">
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    function callback() {
        dispatch('callback');
    }
</script>

<button class="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded" on:click={callback}>
    <slot />
</button>