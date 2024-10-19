<script type="ts">
    export let centered = false;
    export let customClass = '';
</script>

<h2 class="text-xl font-bold leading-loose {centered ? 'text-center' : ''} {customClass}">
    <slot />
</h2>