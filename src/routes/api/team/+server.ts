import { createTeam, retrieveOrCreateUser } from '$lib/db-functions';
import { json } from '@sveltejs/kit';
import { randomUUID } from 'crypto';

/** Create team and add currently signed in user to team */
export async function POST({ request, locals }) {
	const { team } = await request.json();
    const session = await locals.getSession();
	const teamId = randomUUID();
    if (session?.user) {
        const userId = await retrieveOrCreateUser(session.user);
        if (userId) {
            const result = await createTeam(userId, {id: teamId, name: team});
            if (result) {
                return json({ id: result }, { status: 201 });
            } else {
                return json({ status: 500 });
            }
        }
        return json({ status: 500 });
    } else {
        return json({ status: 401 });
    }
}