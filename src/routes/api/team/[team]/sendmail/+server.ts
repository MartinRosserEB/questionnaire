import { json } from '@sveltejs/kit';
import { listUsersFromTeam, retrieveOrCreateUser, userIsInTeam } from '$lib/db-functions.js';
import { MAIL_SENDER_ROLE } from '$lib/common.js';
import { sendEmail } from '$lib/teamMail.js';
import type { Category } from '@prisma/client';

export async function POST({ url, request, params, locals }) {
	const teamId = params.team;
    const session = await locals.getSession();
    if (session?.user) {
        const loggedInUserId = await retrieveOrCreateUser(session.user);
        const {categories}: {categories: Category[]} = await request.json();
        const catString = categories.join(',');
        if (loggedInUserId && typeof session.user.roles.find(r => r.name === MAIL_SENDER_ROLE) !== 'undefined') {
            await userIsInTeam(loggedInUserId, teamId); // throws if not
            const userList = await listUsersFromTeam(loggedInUserId, teamId);
            const rcpArr: {url: string, host: string, email: string}[] = [];
            userList.users.filter(u => u.sendMail === true).forEach(u => {
                rcpArr.push({
                    url: 'https://'+url.host+'/questionnaire?categories='+catString+'&team='+teamId,
                    host: url.host,
                    email: u.user.email
                });
            });
            await sendEmail(rcpArr);
            return json({ status: 200 });
        } else {
            return json({ status: 403 });
        }
    } else {
        return json({ status: 401 });
    }
}
