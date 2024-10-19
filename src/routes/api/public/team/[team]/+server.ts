import { getOwnersForTeam } from '$lib/db-functions.js';
import { json } from '@sveltejs/kit';

export async function GET({ params }) {
    const teamId = params.team;
    if (teamId) {
        const teamInfo = await getOwnersForTeam(teamId);
        teamInfo.users = teamInfo.users.filter(elem => elem.invitationAccepted === true && elem.isOwner === true);
        return json({ status: 200, data: teamInfo });
    } else {
        return json({ status: 400, error: 'Team ID missing.' });
    }
}
