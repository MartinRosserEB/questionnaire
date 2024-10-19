<script lang="ts">
    import { page } from '$app/stores';
	import { CONFIGURATION_ROLE } from '$lib/common';
    import { t } from '$lib/translations/i18n';
    import { signIn, signOut } from '@auth/sveltekit/client';
    export let session;
    let showMenu = false;
</script>

<nav class="py-8 mx-auto md:flex md:justify-between md:items-center">
    <div class="flex items-center justify-between">
        <a class="text-xl font-bold text-gray-800 md:text-2xl hover:text-blue-400" href="/">Persönlichkeitsanalyse</a>
        <!-- Mobile menu button -->
        <button
            type="button"
            on:click={() => { showMenu = !showMenu}}
            class="flex md:hidden text-gray-800 hover:text-gray-400 focus:outline-none focus:text-gray-400"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
        </button>
    </div>
    <div
        class="flex-col mt-8 space-y-4 md:flex md:space-y-0 md:flex-row md:items-center md:space-x-10 md:mt-0 {showMenu
        ? 'flex'
        : 'hidden'}"
    >
        {#if session?.user}
        <a class="text-gray-800 hover:text-blue-400 text-center {$page.url.pathname==='/questions'?'font-bold':''}" href="/questions">{$t('common.questions')}</a>
        <a class="text-gray-800 hover:text-blue-400 text-center {$page.url.pathname==='/results'?'font-bold':''}" href="/results">{$t('common.results')}</a>
        <a class="text-gray-800 hover:text-blue-400 text-center {$page.url.pathname==='/teams'?'font-bold':''}" href="/teams">{$t('common.teams')}</a>
        {#if session.user.roles.find(item => item.name === CONFIGURATION_ROLE)}
        <a class="text-gray-800 hover:text-blue-400 text-center {$page.url.pathname==='/configuration'?'font-bold':''}" href="/configuration">{$t('common.configuration')}</a>
        {/if}
        <button class="text-gray-800 hover:text-blue-400" on:click={() => signOut()}>{$t('common.signout')}</button>
        {:else}
        <button class="text-gray-800 hover:text-blue-400" on:click={() => signIn(
            'auth0', {
                redirect: false
            },
            {
                scope: 'api openid profile email'
            }
            )}>{$t('common.signin')}
        </button>
        {/if}
    </div>
</nav>
