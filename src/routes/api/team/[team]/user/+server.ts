import { json } from '@sveltejs/kit';
import { addUserToTeam, retrieveOrCreateUser, userIsInTeam } from '$lib/db-functions.js';

export async function POST({ params, request, locals }) {
	const teamId = params.team;
    const { email } = await request.json();
    const session = await locals.getSession();
    if (session?.user) {
        const loggedInUserId = await retrieveOrCreateUser(session.user);
        if (email && loggedInUserId) {
            await userIsInTeam(loggedInUserId, teamId);
            await addUserToTeam(email, teamId);
            return json({ status: 200 });
        } else {
            return json({ status: 500 });
        }
    } else {
        return json({ status: 401 });
    }
}
