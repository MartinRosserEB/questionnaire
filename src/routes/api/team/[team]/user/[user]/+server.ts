import { removeUserFromTeam, retrieveOrCreateUser, updateMailSendOfUserInTeam, userIsInTeam } from '$lib/db-functions.js';
import { json } from '@sveltejs/kit';

export async function DELETE({ params, locals }) {
	const teamId = params.team;
	const userToDeleteId = params.user;
	const session = await locals.getSession();
	let returnStatus = 403;
	let returnMessage = '';
	if (teamId && userToDeleteId && session?.user) {
		const userId = await retrieveOrCreateUser(session.user);
		if (userId) {
			returnMessage = 'You are not in this team. Removing user not allowed.';
			await userIsInTeam(userId, teamId);
			returnMessage = 'User is an owner of this team and cannot be removed.';
			const removeUser = await removeUserFromTeam(userId, teamId);
			if (removeUser.count > 0) {
				returnMessage = '';
				returnStatus = 204;
			}
		} else {
			returnStatus = 500;
		}
	} else {
		returnStatus = 400;
	}
	return new Response(JSON.stringify({ message: returnMessage }), {
		status: returnStatus
	});
}

export async function PATCH({ params, request, locals }) {
	const teamId = params.team;
	const userToPatch = params.user;
	const session = await locals.getSession();
	if (teamId && userToPatch && session?.user) {
		const userId = await retrieveOrCreateUser(session.user);
		if (userId) {
			const { sendMail } = await request.json();
			if (typeof sendMail === 'boolean') {
				const res = await updateMailSendOfUserInTeam(userToPatch, teamId, sendMail);
				console.log(sendMail, res);
				return json({ status: 200 });
			}
		} else {
			return json({ status: 403 });
		}
	} else {
		return json({ status: 400 });
	}
	return json({ status: 500 });
}