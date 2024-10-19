import { json } from '@sveltejs/kit';
import { acceptInvitationsForUserInTeam, retrieveOrCreateUser } from '$lib/db-functions.js';

export async function POST({ params, locals }) {
	const session = await locals.getSession();
	if (session?.user) {
		const userId = await retrieveOrCreateUser(session.user);
		const teamId = params.team;
		if (userId && teamId) {
			await acceptInvitationsForUserInTeam(userId, teamId);
			return json({ status: 200 });
		} else {
			return json({ message: "User or team missing."}, { status: 400 });
		}
	} else {
		return json({ status: 401 });
	}
}