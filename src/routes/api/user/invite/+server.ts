import { json } from '@sveltejs/kit';
import { getOpenInvitationsForUser, retrieveOrCreateUser } from '$lib/db-functions.js';

export async function GET({ locals }) {
	const session = await locals.getSession();
	if (session?.user) {
		const userId = await retrieveOrCreateUser(session.user);
		if (userId) {
			const results = await getOpenInvitationsForUser(userId);
			return json({ results: results }, { status: 200 });
		} else {
			return json({ message: "Could not create or retrieve user."}, { status: 500 });
		}
	} else {
		return json({ status: 401 });
	}
}