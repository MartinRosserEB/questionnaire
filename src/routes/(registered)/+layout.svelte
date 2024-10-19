<script lang="ts">
    import "../../app.css";
	import Navigation from "$lib/components/Navigation.svelte";
	export let data;
</script>

<Navigation session={data.session} />
<slot></slot>
