import { json } from '@sveltejs/kit';
import { listUsersFromTeam, retrieveOrCreateUser, userIsInTeam } from '$lib/db-functions.js';

export async function GET({ params, locals }) {
	const team = params.team;
	const session = await locals.getSession();
	if (team && session?.user) {
		const userId = await retrieveOrCreateUser(session.user);
		if (userId) {
			await userIsInTeam(userId, team);
			const usersResults = await listUsersFromTeam(userId, team);
			return json({ results: usersResults.users }, { status: 200 });
		} else {
			return json({ status: 401 });
		}
	} else {
		return json({ status: 400 });
	}
}
