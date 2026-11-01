import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'REIMS2 docs',
  description: 'This is the documentation for REIMS2',
  lastUpdated: true,
  appearance: true,
  cleanUrls: true,
  base: '/docs',
  head: [['link', { rel: 'icon', href: '/docs/logo.svg' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/logo.svg',
    siteTitle: 'REIMS2 docs',
    nav: [
      { text: 'User guide', link: '/guide/' },
      { text: 'For developers', link: '/dev/' },
      // the app lives one level above the docs base, target makes it a plain link
      { text: 'Open REIMS2', link: '/../', target: '_self' },
    ],
    search: {
      provider: 'local',
    },

    sidebar: {
      '/': [
        {
          text: 'User guide',
          items: [
            { link: '/guide/find', text: 'Find glasses' },
            { link: '/guide/dispense', text: 'Dispense and undo' },
            { link: '/guide/add', text: 'Add glasses' },
            { link: '/guide/edit', text: 'Edit or delete' },
            { link: '/guide/location', text: 'Change the location' },
            { link: '/guide/offline', text: 'Work offline' },
            { link: '/guide/reports', text: 'Reports' },
          ],
        },
        {
          text: 'Background',
          items: [
            { link: '/optometry-basics', text: 'Optometry basics' },
            { link: '/philscore', text: 'Matching algorithm' },
          ],
        },
      ],
      '/dev/': [
        {
          text: 'Overview',
          items: [
            { link: '/dev/', text: 'Introduction' },
            { link: '/dev/system', text: 'System overview' },
            { link: '/dev/analysis', text: 'REIMS1 analysis' },
          ],
        },
        {
          text: 'Campaigns',
          items: [
            {
              link: '/dev/2024_bugs_investigated',
              text: '2024 campaign investigation',
            },
          ],
        },
        {
          text: 'Planning',
          items: [
            { link: '/dev/user-stories', text: 'User Stories' },
            { link: '/dev/requirements', text: 'Requirements' },
          ],
        },
        {
          text: 'Notes',
          items: [
            { link: '/dev/notes', text: 'Meetings' },
            { link: '/dev/ideas', text: 'Ideas' },
          ],
        },
        {
          text: 'AI Notes',
          items: [
            { link: '/dev/ai-notes/', text: 'Overview' },
            {
              link: '/dev/ai-notes/philscore-deep-dive',
              text: 'PhilScore deep dive',
            },
            {
              link: '/dev/ai-notes/philscore-improvements',
              text: 'PhilScore improvement ideas',
            },
            {
              link: '/dev/ai-notes/predicted-blur-matching',
              text: 'Predicted-blur matching',
            },
            {
              link: '/dev/ai-notes/inventory-refill-analysis',
              text: 'Inventory refill analysis',
            },
          ],
        },
      ],
    },
    lastUpdated: {
      formatOptions: {
        timeStyle: undefined,
        dateStyle: 'long',
      },
    },
    footer: {
      copyright: 'Licensed under CC-BY-SA-4.0.',
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/reims2' }],
    editLink: {
      pattern: 'https://github.com/reims2/reims2/edit/main/docs/src/:path',
    },
  },
})
