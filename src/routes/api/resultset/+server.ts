import { json } from '@sveltejs/kit';
import { retrieveOrCreateUser, getResultSetsForUser } from '$lib/db-functions.js';
import prisma from '$lib/prisma';
import { randomUUID } from 'crypto';
import type { AnswerWithoutResultSetReference } from '$lib/custom-types.js';
import { evaluateResult } from '$lib/ta-functions';
import type { Category } from '@prisma/client';

export async function GET({ locals }) {
	const session = await locals.getSession();
	if (session?.user) {
		const userId = await retrieveOrCreateUser(session.user);
		if (userId) {
			return json({ status: 200, data: await getResultSetsForUser(userId)});
		}
		return json({ status: 403 });
	} else {
		return json({ status: 401 });
	}
}

export async function POST({ request, locals }) {
	const session = await locals.getSession();
	if (typeof session?.user !== 'undefined') {
		const userId = await retrieveOrCreateUser(session.user);
		const {name, answers, categories}: {name: string, answers: AnswerWithoutResultSetReference[], categories: Category[]} = await request.json();
		if (typeof name !== 'undefined' && typeof answers !== 'undefined' && typeof userId !== 'undefined') {
			answers.forEach(item => item.id = randomUUID());
			const result = await prisma.resultSet.create({
				data: {
					id: randomUUID(),
					name: name,
					userId: userId,
					answers: {
						createMany: {
							data: answers
						}
					},
					categories: {
						connect: categories
					}
				}
			});
			if (result) {
				await evaluateResult(result);
			}
			return json({ status: 201, data: { result }});
		} else {
			return json({ status: 400, error: "result, resultDescription and answers must be defined" });
		}
	} else {
		return json({ status: 401 });
	}
}

export async function PUT({ request, locals }) {
	// Note, it is difficult to put this into a transaction: https://www.prisma.io/docs/orm/prisma-client/queries/transactions#transactions-overview
	const session = await locals.getSession();
	if (typeof session?.user !== 'undefined') {
		const userId = await retrieveOrCreateUser(session.user);
		const {id, name, answers, categories}: {id: string, name: string, answers: AnswerWithoutResultSetReference[], categories: Category[]} = await request.json();
		if (typeof id !== 'undefined' && typeof name !== 'undefined' && typeof answers !== 'undefined' && typeof userId !== 'undefined') {
			for (const answer of answers) {
				if (answer.id !== '') {
					await prisma.answer.update({
						where: {
							id: answer.id
						},
						data: {
							scaleItemId: answer.scaleItemId
						}
					});
				} else {
					await prisma.answer.create({
						data: {
							id: randomUUID(),
							questionId: answer.questionId,
							scaleItemId: answer.scaleItemId,
							resultSetId: id
						}
					})
				}
			};
			await prisma.sumItem.deleteMany({
				where: {
					resultSetId: id
				}
			});
			await prisma.percentItem.deleteMany({
				where: {
					resultSetId: id
				}
			});
			const result = await prisma.resultSet.update({
				where: {
					id: id
				},
				data: {
					categories: {
						set: categories
					}
				},
				include: {
					categories: true
				}
			});
			await evaluateResult(userId, result);
			return json({ status: 200, data: { result }});
		} else {
			return json({ status: 400, error: "result, resultDescription and answers must be defined" });
		}
	} else {
		return json({ status: 401 });
	}
}