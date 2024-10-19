import { json } from '@sveltejs/kit';
import { addResultToTeam, checkResultIsInTeam, getResultsForTeam, removeResultFromTeam, retrieveOrCreateUser, userIsInTeam } from '$lib/db-functions.js';

export async function GET({ params, locals }) {
	const teamId = params.team;
	if (teamId) {
		const session = await locals.getSession();
		if (session?.user) {
			const userId = await retrieveOrCreateUser(session.user);
			if (userId) {
				const u = await getResultsForTeam(teamId, userId);
				return json({ results: u }, { status: 200 });
			} else {
				return json({ status: 500 });
			}
		} else {
			return json({ error: "Not authenticated" }, { status: 401 });
		}
	} else {
		return json({ error: "Parameter team missing." }, { status: 400 });
	}
}

/** API call toggles whether result from user is in team or not. */
export async function POST({ request, params, locals }) {
	const team = params.team;
	const {result}: {result: string} = await request.json();
	const session = await locals.getSession();
	if (result && team && session?.user) {
		const userId = await retrieveOrCreateUser(session.user);
		if (userId) {
			await userIsInTeam(userId, team);
			const entryExists = await checkResultIsInTeam(result, team);
			if (entryExists.length > 0) {
				await removeResultFromTeam(result, team);
			} else {
				await addResultToTeam(result, team);
			}
			return json({ result: { id: result}, team: { id: team }}, { status: 200});
		} else {
			return json({ status: 500 });
		}
	} else {
		return json({ status: 400 });
	}
}
