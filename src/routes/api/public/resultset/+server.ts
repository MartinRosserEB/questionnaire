import { json } from '@sveltejs/kit';
import { createEmptyResultSet, createEmptyResultSetForUser } from '$lib/db-functions.js';
import { randomUUID } from 'crypto';
import type { Category } from '@prisma/client';

export async function POST({ request }) {
    const {categories, name, user}: {categories: Category[], name: string, user: string} = await request.json();
    if (typeof categories !== 'undefined' && typeof name !== 'undefined') {
        if (typeof user !== 'undefined' &&  user !== '') {
            return json({ status: 201, data: await createEmptyResultSetForUser(randomUUID(), categories, name, user)});
        } else {
            return json({ status: 201, data: await createEmptyResultSet(randomUUID(), categories, name)});
        }
    } else {
        return json({ status: 400, error: 'Categories missing.' });
    }
}
