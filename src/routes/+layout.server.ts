import type { LayoutServerLoad } from './$types';
import { locales, defaultLocale, loadTranslations } from '$lib/translations/i18n'
import { getCategories, getQuestions, getResultSetsForUser, getScaleItems, retrieveOrCreateUser } from '$lib/db-functions';

export const load: LayoutServerLoad = async function(event) {
    const session = await event.locals.getSession();
    let user = '';
    if (session?.user) {
        user = await retrieveOrCreateUser(session.user);
    }
    // Get locale from Browser. This would need to be overridden by user profile as well as current setting.
    // let locale = `${`${event.request.headers.get('accept-language')}`.match(/[a-zA-Z]+?(?=-|_|,|;)/)}`.toLowerCase();
    let locale = 'de';
    // Get defined locales
    const supportedLocales = locales.get().map((l) => l.toLowerCase());
    // Use default locale if current locale is not supported
    if (!supportedLocales.includes(locale)) {
        locale = defaultLocale;
    }
    await loadTranslations(locale, event.url.pathname);
	return {
        i18n: { locale, route: event.url.pathname},
        session: session,
        user: user,
        categories: await getCategories(),
        questions: await getQuestions(),
        scaleItems: await getScaleItems(),
        resultSets: (user !== '') ? await getResultSetsForUser(user) : []
    };
}