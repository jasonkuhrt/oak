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
          text: 'Core Concepts',
          items: [
            { text: 'Immutability', link: '/guides/immutability' },
            { text: 'Parameter Naming', link: '/guides/parameter-naming' },
            { text: 'Parameter Types', link: '/guides/parameter-types' },
            { text: 'Parameter Prompts', link: '/guides/prompts' },
          ],
        },
        {
          text: 'Arguments',
          items: [
            { text: 'Line Arguments', link: '/guides/line-arguments' },
            { text: 'Environment Arguments', link: '/guides/environment-arguments' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Mutually Exclusive Parameters', link: '/guides/mutually-exclusive-parameters' },
            { text: 'Description', link: '/guides/description' },
            { text: 'Settings', link: '/guides/settings' },
          ],
        },
        {
          text: 'Reference',
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
