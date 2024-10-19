import { json } from '@sveltejs/kit';
import { addResultToTeam } from '$lib/db-functions.js';

export async function POST({ params }) {
    const teamId = params.team, resultSetId = params.resultset;
    if (typeof teamId !== 'undefined' && typeof resultSetId !== 'undefined') {
        return json({ status: 200, data: await addResultToTeam(resultSetId, teamId)});
    } else {
        return json({ status: 400, error: 'Team and/or result set missing.' });
    }
}
