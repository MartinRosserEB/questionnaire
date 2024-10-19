import type { PageLoad } from './$types';

export const load: PageLoad = async (parent) => {
	const { categories, questions } = await parent.parent();
	return { categories, questions };
}
