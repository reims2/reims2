import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "REIMS2 manual",
  description: 'This is the user documentation for REIMS2',
  lastUpdated: true,
  appearance: true,
  base: '/docs',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Manual', link: '/' },
      { text: 'For developers', link: '/dev/' }
    ],
    search: {
      provider: 'local'
    },

    sidebar: {
      '/': [
        {
          text: 'Overview',
          items: [
            { link: '/', text: 'About REIMS2' },
            { link: '/howto', text: 'How to use REIMS2' },
          ]
        },
      ],
      '/dev/': [
        {
          text: 'Overview',
          items: [
            { link: '/dev/philscore', text: 'PhilScore' },
            { link: '/dev/deploy ', text: 'Deploy' },

          ]
        },
        {
          text: 'Planning',
          items: [
            { link: '/dev/user-stories', text: 'User Stories' },
            { link: '/dev/requirements', text: 'Requirements' },
          ]
        },
        {
          text: 'Other stuff',
          items: [
            { link: '/dev/analysis', text: 'Analysis' },
            { link: '/dev/notes', text: 'Notes' },
          ]
        },
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/reims2' }
    ],
    editLink: {
      pattern: 'https://github.com/reims2/reims2-docs/edit/main/src/:path'
    },
  }
})
