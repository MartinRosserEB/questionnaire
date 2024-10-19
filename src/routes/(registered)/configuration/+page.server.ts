import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type { Team } from "@prisma/client";
import { getTeamsForUser, retrieveOrCreateUser } from "$lib/db-functions";

export const load: PageServerLoad = async (event) => {
  const session = await event.locals.getSession();
  if (!session?.user) throw redirect(303, "/");
  const user = await retrieveOrCreateUser(session.user);
  let teams: Team[] = [] as Team[];
  if (user) {
    teams = (await getTeamsForUser(user)).teams.map(elem => { return elem.team; });
  }
  return {
    teams: teams
  };
};
