import { json } from '@sveltejs/kit';
import { retrieveOrCreateUser, getResultSetForUser } from '$lib/db-functions.js';

export async function GET({ locals, params}) {
	const session = await locals.getSession();
	if (session?.user) {
		const userId = await retrieveOrCreateUser(session.user);
		if (userId && params.id) {
			return json({ status: 200, data: await getResultSetForUser(userId, params.id)});
		}
		return json({ status: 404 });
	} else {
		return json({ status: 401 });
	}
}
