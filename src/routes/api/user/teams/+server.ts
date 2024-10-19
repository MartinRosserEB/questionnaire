import { json } from '@sveltejs/kit';
import { retrieveOrCreateUser, getTeamsForUser } from '$lib/db-functions.js';

export async function GET({ locals }) {
	const session = await locals.getSession();
	if (session?.user) {
		const userId = await retrieveOrCreateUser(session.user);
		if (userId) {
			const results = await getTeamsForUser(userId);
			return json({ results: results.teams }, { status: 200 });
		} else {
			return json({ status: 500 });
		}
	} else {
		return json({ status: 401 });
	}
}