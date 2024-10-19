import { json } from '@sveltejs/kit';
import { evaluateResult } from '$lib/ta-functions';
import { getResultSetById } from '$lib/db-functions.js';
import prisma from '$lib/prisma.js';

export async function POST({ params }) {
	const resultSetId = params.resultset;
	if (resultSetId) {
		const resultSet = await prisma.resultSet.findFirst({where: {id: resultSetId}});
		if (resultSet) {
			await evaluateResult(resultSet);
			return json({ status: 200 });
		} else {
			return json({ status: 404 });
		}
	} else {
		return json({ status: 400, error: "result missing" });
	}
}
