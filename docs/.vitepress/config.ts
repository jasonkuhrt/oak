import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@wollybeard/cli',
  description: 'Type-safe CLI command definition and execution',
  base: '/molt/',

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Examples', link: '/examples/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Quick Start', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Examples', link: '/examples/' },
            { text: 'Documentation', link: '/guide/documentation' },
            { text: 'Alternatives', link: '/guide/alternatives' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jasonkuhrt/molt' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Jason Kuhrt',
    },

    search: {
      provider: 'local',
    },
  },
})
