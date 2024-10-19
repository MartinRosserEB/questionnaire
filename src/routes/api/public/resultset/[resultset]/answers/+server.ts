import { json } from '@sveltejs/kit';
import { addAnswersToResultSet } from '$lib/db-functions.js';
import type { AnswerWithoutResultSetReference } from '$lib/custom-types.js';
import { randomUUID } from 'crypto';

export async function POST({ request, params }) {
	const resultset = params.resultset;
	const {answers}: {answers: AnswerWithoutResultSetReference[]} = await request.json();
	if (typeof resultset !== 'undefined' && typeof answers !== 'undefined') {
		answers.forEach(item => item.id = randomUUID());
		await addAnswersToResultSet(resultset, answers);
	}
	return json({ status: 201 });
}
