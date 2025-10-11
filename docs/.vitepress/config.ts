import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@wollybeard/cli',
  description: 'Type-safe CLI command definition and execution',
  base: '/molt/',

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { text: 'Examples', link: '/examples/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Installation', link: '/guide/installation' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Parameters', link: '/guide/parameters' },
            { text: 'Prompts', link: '/guide/prompts' },
            { text: 'Environment Variables', link: '/guide/environment' },
            { text: 'Schemas & Validation', link: '/guide/schemas' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Exclusive Parameters', link: '/guide/exclusive-parameters' },
            { text: 'Extensions', link: '/guide/extensions' },
          ],
        },
        {
          text: 'Migration',
          items: [
            { text: 'From @molt/command', link: '/guide/migration' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Command', link: '/api/command' },
            { text: 'Parameter', link: '/api/parameter' },
            { text: 'Settings', link: '/api/settings' },
          ],
        },
      ],
      '/examples/': [
        {
          text: 'Examples',
          items: [
            { text: 'Basic Usage', link: '/examples/intro' },
            { text: 'Interactive Prompts', link: '/examples/prompts' },
            { text: 'Kitchen Sink', link: '/examples/kitchen-sink' },
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
