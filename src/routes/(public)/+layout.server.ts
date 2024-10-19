import { getResultSetById } from "$lib/db-functions";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ url, parent }) => {
  const resultSetId = url.searchParams.get('id');
  let { resultSets } = await parent();
  if (resultSetId) {
    // Note that the following function only loads a result if it is not assigned to a user.
    // If a result is assigned to a user, then that user needs to sign in to view it.
    const res = await getResultSetById(resultSetId);
    if (res) {
      resultSets =[res];
    }
  }
  return { resultSets };
};
