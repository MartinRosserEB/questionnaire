import type { PlotResult, Team, TeamResult } from '$lib/custom-types';
import type { Answer, Category, Question, ResultSet } from '@prisma/client';
import { writable, type Writable } from 'svelte/store';

export const selectedCategories: Writable<Category[]> = writable([] as Category[]);

export const questions: Writable<Question[]> = writable([] as Question[]);

export const answers: Writable<Answer[]> = writable([] as Answer[]);

export const currentResultSet: Writable<ResultSet> = writable({} as ResultSet);

export const resultSets: Writable<ResultSet[]> = writable([] as ResultSet[]);

export const userTeams = writable([]);

export const team: Writable<Team> = writable({} as Team);

export const teamResults: Writable<TeamResult[]> = writable([] as TeamResult[]);