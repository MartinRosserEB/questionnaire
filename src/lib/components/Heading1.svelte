<script type="ts">
    export let centered = false;
</script>

<h1 class="text-3xl font-bold leading-loose {centered ? 'text-center' : ''}">
    <slot />
</h1>