import type { LayoutLoad } from './$types';
import { loadTranslations } from '$lib/translations/i18n';

export const load: LayoutLoad = async ({ parent }) => {
    const { i18n } = await parent();
    await loadTranslations(i18n.locale, i18n.route);
}