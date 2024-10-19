import { json } from '@sveltejs/kit';
import { getAnsweredQuestionsInResultSet } from '$lib/db-functions.js';

export async function GET({ params }) {
	const resultSetId = params.resultset;
	if (resultSetId) {
		return json({ status: 200, data: await getAnsweredQuestionsInResultSet(resultSetId)});
	} else {
		return json({ status: 400, error: 'Result set ID missing.' });
	}
}
