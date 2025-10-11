import { transformerNotationDiff, transformerNotationHighlight } from '@shikijs/transformers'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Oak',
  description: 'Type-safe CLI command definition and execution',
  // Use root path for Netlify, /oak/ for GitHub Pages
  base: process.env.NETLIFY ? '/' : '/oak/',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
  ],

  markdown: {
    codeTransformers: [
      transformerTwoslash(),
      transformerNotationDiff(),
      transformerNotationHighlight(),
    ],
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    languages: ['typescript', 'javascript', 'bash', 'json', 'ansi'],
  },

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guides', link: '/guides/getting-started' },
    ],

    sidebar: {
      '/guides/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guides/getting-started' },
          ],
        },
        {
          text: 'Core',
          items: [
            { text: 'Immutability', link: '/guides/immutability' },
            { text: 'Settings', link: '/guides/settings' },
          ],
        },
        {
          text: 'Parameters',
          items: [
            { text: 'Naming', link: '/guides/parameter-naming' },
            { text: 'Types', link: '/guides/parameter-types' },
            { text: 'Prompts', link: '/guides/prompts' },
            { text: 'Mutually Exclusive', link: '/guides/mutually-exclusive-parameters' },
            { text: 'Description', link: '/guides/description' },
          ],
        },
        {
          text: 'Arguments',
          items: [
            { text: 'Line', link: '/guides/line-arguments' },
            { text: 'Environment', link: '/guides/environment-arguments' },
          ],
        },
        {
          text: 'Appendix',
          items: [
            { text: 'Recipes', link: '/guides/recipes' },
            { text: 'Architecture', link: '/guides/architecture' },
            { text: 'Alternatives', link: '/guides/alternatives' },
          ],
        },
        {
          text: 'Extensions',
          items: [
            { text: 'Zod', link: '/guides/extensions/zod' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jasonkuhrt/oak' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Jason Kuhrt',
    },

    search: {
      provider: 'local',
    },
  },
})
