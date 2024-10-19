import i18n, { type Config } from 'sveltekit-i18n';
import lang from './lang.json';

const config: Config = ({
  fallbackLocale: 'de',
  translations: {
    en: { lang },
    de: { lang }
  },
  loaders: [
    {
      locale: 'en',
      key: 'common',
      loader: async () => (
        await import('./en/common.json')
      ).default,
    },
    {
      locale: 'en',
      key: 'home',
      routes: ['/'],
      loader: async () => (
        await import('./en/home.json')
      ).default,
    },
    {
      locale: 'en',
      key: 'configuration',
      routes: ['/configuration'],
      loader: async () => (
        await import('./en/configuration.json')
      ).default,
    },
    {
      locale: 'en',
      key: 'questions',
      routes: ['/questions'],
      loader: async () => (
        await import('./en/questions.json')
      ).default,
    },
    {
        locale: 'en',
        key: 'results',
        routes: ['/results'],
        loader: async () => (
            await import('./en/results.json')
        ).default,
    },
    {
        locale: 'en',
        key: 'teams',
        routes: ['/teams'],
        loader: async () => (
          await import('./en/teams.json')
        ).default,
    },
    {
        locale: 'de',
        key: 'common',
        loader: async () => (
          await import('./de/common.json')
        ).default,
    },
    {
        locale: 'de',
        key: 'home',
        routes: ['/'],
        loader: async () => (
          await import('./de/home.json')
        ).default,
      },
      {
        locale: 'de',
        key: 'configuration',
        routes: ['/configuration'],
        loader: async () => (
          await import('./de/configuration.json')
        ).default,
      },
      {
        locale: 'de',
        key: 'questions',
        routes: ['/questions'],
        loader: async () => (
          await import('./de/questions.json')
        ).default,
      },
      {
        locale: 'de',
        key: 'results',
        routes: ['/results'],
        loader: async () => (
        await import('./de/results.json')
        ).default,
      },
      {
        locale: 'de',
        key: 'teams',
        routes: ['/teams'],
        loader: async () => (
        await import('./de/teams.json')
        ).default,
      }
  ],
});

export const { t, locale, locales, loading, loadTranslations } = new i18n(config);

export const defaultLocale = 'de';