<script lang="ts">
    import { onMount } from 'svelte';
    import { t } from '$lib/translations/i18n';
    import { invalidateAll } from '$app/navigation';
    import { MAIL_SENDER_ROLE } from '$lib/common';
	import type { PageData } from './$types';
	import type { Category } from '@prisma/client';
	import Heading1 from '$lib/components/Heading1.svelte';
	import Heading2 from '$lib/components/Heading2.svelte';
	import Paragraph from '$lib/components/Paragraph.svelte';
	import ButtonBlue from '$lib/components/ButtonBlue.svelte';
	import ShowQuestionnaire from '$lib/components/questionnaire/ShowQuestionnaire.svelte';
	
    export let data: PageData;
    let teamName: string;
    let localTeam: {id: string|null, description: string|null} = {id: null, description: null};
    let localTeamUsers: {invitationAccepted: boolean, sendMail: boolean, user: {id: string, email: string, name: string}}[] = [];
    let email: string;
    let emailNotFound: string | null;
    let invites: { id: string, createdAt: string, updatedAt: string, name: string}[] = [];
    let categories: string[] = [];

    function toggleCategory(category: Category) {
        if (typeof categories.find(cat => cat === category.label.toLowerCase()) !== 'undefined') {
            categories = categories.filter(cat => cat !== category.label.toLowerCase());
        } else {
            categories = [...categories, category.label.toLowerCase()];
        }
    }

    async function setSendMailForUser(teamId: string, userId: string) {
        await fetch('/api/team/'+teamId+'/user/'+userId+'/',{
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sendMail: !localTeamUsers.find(ltu => ltu.user.id === userId)?.sendMail
            })
        });
    }

    async function sendMail(teamId: string) {
        await fetch('/api/team/'+teamId+'/sendmail/',{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                categories: categories
            })
        });
    }

    function isInitVal(teamName: string) {
        return teamName === $t('configuration.team_name');
    }

    async function createTeam() {
        if (!isInitVal(teamName)) {
            const response = await fetch('/api/team', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    team: teamName
                })
            });
            let httpresp = await response.json();
            if (typeof httpresp !== 'undefined' && response.status === 201) {
                teamName = $t('configuration.team_name');
            } else {
                console.error(httpresp);
            }
        }
        invalidateAll();
    }

    async function deleteTeam(teamId: string) {
        const response = await fetch('/api/team/'+teamId, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        if (response.status === 204) {
            invalidateAll();
        } else {
            console.error(response);
        }
    }

    async function loadUsersForTeam(teamId: string) {
        const response = await fetch('/api/team/'+teamId+'/users');
        const resJson = await response.json();
        if (response.status === 200) {
            localTeamUsers = resJson.results;
            localTeam.id = teamId;
        }
    }

    async function getOpenInvitations() {
        const response = await fetch('/api/user/invite');
        const resJson = await response.json();
        if (response.status === 200) {
            invites = resJson.results;
        }
    }

    async function acceptInvite(teamId: string) {
        const response = await fetch('/api/user/invite/'+teamId+'/accept', {
            method: 'POST'
        });
        if (response.status === 200) {
            getOpenInvitations();
        } else {
            console.error(response);
        }
    }

    async function removeUserFromTeam(userId: string, teamId: string) {
        const response = await fetch('/api/team/'+teamId+'/user/'+userId, {
            method: 'DELETE'
        });
        if (response.status === 200) {
            invalidateAll();
        } else {
            console.error(response);
        }
    }

    function isInvalidEmail(emailToCheck: string | undefined) {
        if (typeof emailToCheck === 'undefined' || !emailToCheck.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
            return true;
        } else {
            return false;
        }
    }

    async function addUserToTeam(email: string, teamId: string) {
        emailNotFound = null;
        const response = await fetch('/api/team/'+teamId+'/user', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email
            })
        });
        if (response.status === 200) {
            loadUsersForTeam(teamId);
            email = $t('configuration.email');
        } else if (response.status === 400) {
            emailNotFound = $t('configuration.no_user_found_with_email_address');
        } else {
            console.error(response);
        }
    }

    onMount(() => {
        getOpenInvitations();
    });
</script>

<div class="flex flex-row flex-wrap">
    <div class="w-full">
        <Heading1>{$t('common.configuration')}</Heading1>
        <hr />
    </div>
    <div class="w-full mt-3 mb-3">
        <ShowQuestionnaire {data}/>
    </div>
    <div class="w-full">
        <hr />
    </div>
    {#if invites.length > 0}
    <div class="w-full">
        <Heading2>{$t('configuration.accept_group_join_request')}</Heading2>
    </div>
    <div class="w-full inline-flex flex-wrap">
        <div class="flex-shrink">
            {#each invites as invite}
            <ButtonBlue on:callback={() => { acceptInvite(invite.id); }}>{invite.name}</ButtonBlue>
            {/each}
        </div>
    </div>
    <div class="w-full">
        <hr />
    </div>
    {/if}
    <div class="w-full">
        <Heading2>{$t('configuration.create_team')}</Heading2>
    </div>
    <div class="w-1/2">
        <input bind:value={teamName} class="appearance-none mb-2 block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" type="text" placeholder="Name des Teams" />
    </div>
    <div class="w-1/2 text-center">
        <ButtonBlue on:callback={createTeam} disabled={!teamName}>{$t('configuration.create_team')}</ButtonBlue>
    </div>
    <div class="w-full mt-1">
        <hr />
    </div>
    <div class="w-full">
        <Heading2>{$t('configuration.update_team')}</Heading2>
    </div>
    <div class="w-full inline-flex flex-wrap mb-3">
        {#each data.teams as team}
        <div class="flex-shrink mr-3">
            <ButtonBlue selected={team.id === localTeam.id} on:callback={() => { loadUsersForTeam(team.id); }}>{team.name}</ButtonBlue>
        </div>
        {/each}
    </div>
    {#if localTeam.id}
    <div class="w-1/3">
        <input bind:value={email} class="appearance-none mb-3 block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" type="text" placeholder="Email" />
    </div>
    <div class="w-1/3">
        <ButtonBlue on:callback={() => { addUserToTeam(email, localTeam.id); }} disabled="{isInvalidEmail(email)}">{$t('configuration.invite_user_to_team')}</ButtonBlue>
    </div>
    {#if emailNotFound}
    <div class="w-1/3">
        <Paragraph>{emailNotFound}</Paragraph>
    </div>
    {/if}
    {#if localTeamUsers.length > 0}
    <div class="w-full mb-3">
        <table class="border-collapse w-full border border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-800 text-sm shadow-sm table-auto">
            <thead>
                <tr>
                    <th class="w-1/2 border border-slate-300 dark:border-slate-600 font-semibold p-2 text-slate-900 dark:text-slate-200 text-left">Benutzer</th>
                    <th class="w-1/2 border border-slate-300 dark:border-slate-600 font-semibold p-2 text-slate-900 dark:text-slate-200 text-left">Entfernen</th>
                    <th class="w-1/2 border border-slate-300 dark:border-slate-600 font-semibold p-2 text-slate-900 dark:text-slate-200 text-left">Mailversand</th>
                </tr>
            </thead>
            <tbody>
                {#each localTeamUsers as user}
                <tr>
                    <td class="border border-slate-300 dark:border-slate-700 p-2">{user.user.name}</td>
                    <td class="border border-slate-300 dark:border-slate-700 p-2">
                        <ButtonBlue on:callback={() => { removeUserFromTeam(user.user.id, localTeam.id); }}>Entfernen</ButtonBlue>
                    </td>
                    <td class="border border-slate-300 dark:border-slate-700 p-2">
                        <input type="checkbox" on:change={() => { setSendMailForUser(localTeam.id, user.user.id); }} bind:checked={user.sendMail} /></td>
                </tr>
                {/each}
            </tbody>
        </table>
    </div>
    {/if}

    {#if typeof data.session?.user?.roles.find(role => { return role.name === MAIL_SENDER_ROLE; }) !== 'undefined' }
    <div class="w-1/3">
        <ButtonBlue on:callback={() => { sendMail(localTeam.id) }}>{$t('configuration.send_mail')}</ButtonBlue>
    </div>
    <div class="w-1/3">{$t('common.categories')}:</div>
    <div class="w-1/3 inline-flex flex-wrap">
        {#each data.categories as category}
        <div class="flex-shrink">
            <ButtonBlue selected={typeof categories.find(cat => cat === category.label.toLowerCase()) !== 'undefined'} on:callback={() => toggleCategory(category)}>{category.label}</ButtonBlue>
        </div>
        {/each}
    </div>
    {/if}
    {/if}
    <div class="w-full">
        <hr />
    </div>
    <div class="w-full">
        <Heading2>{$t('configuration.delete')}</Heading2>
    </div>
    <div class="w-full inline-flex flex-wrap">
        {#each data.teams.filter(t => { return t.users.filter(u => { return u.isOwner === true && u.userId === data.user; }).length > 0; }) as team}
        <div class="flex-shrink mr-3">
            <ButtonBlue on:callback={() => deleteTeam(team.id)}>{$t('configuration.delete_team', { name: team.name })}</ButtonBlue>
        </div>
        {/each}
    </div>
</div>
