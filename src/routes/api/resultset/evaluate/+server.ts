import { json } from '@sveltejs/kit';
import { retrieveOrCreateUser, getCategoriesForResultSet, getResultSetForEvaluationForUser, getCategoriesAndSubCategoriesForCategories } from '$lib/db-functions.js';
import { evaluateResultSet } from '$lib/ta-functions.js';
import type { CategoriesForEvaluationSum } from '$lib/custom-types.js';

export async function GET({ locals, url }) {
	const session = await locals.getSession();
	if (typeof session?.user !== 'undefined') {
		const userId = await retrieveOrCreateUser(session.user);
		const resultSetId = url.searchParams.get('resultSetId');
		let results: CategoriesForEvaluationSum = [] as CategoriesForEvaluationSum;
		if (resultSetId && userId) {
			const categories = await getCategoriesForResultSet(userId, resultSetId);
			const categoryIds = categories.map(elem => elem.id);
			const categoryInfo = await getCategoriesAndSubCategoriesForCategories(categoryIds);
			const resultSetForEvaluation = await getResultSetForEvaluationForUser(userId, resultSetId);
			results = evaluateResultSet(resultSetForEvaluation, categoryInfo);
		}
		return json({ status: 200, data: results});
	} else {
		return json({ status: 401 });
	}
}
