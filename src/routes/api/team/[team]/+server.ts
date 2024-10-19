import { deleteTeam, retrieveOrCreateUser, userIsInTeam } from '$lib/db-functions.js';

export async function DELETE({ params, locals }) {
	const team = params.team;
	const session = await locals.getSession();
	let returnStatus = 204;
	if (team && session?.user) {
		const userId = await retrieveOrCreateUser(session.user);
		if (userId) {
			const user = await userIsInTeam(userId, team);
			if (user?.isOwner === true) {
				await deleteTeam(team);
			} else {
				returnStatus = 403;
			}
		} else {
			returnStatus = 500;
		}
	} else {
		returnStatus = 400;
	}
	return new Response(null, {
		status: returnStatus
	});
}