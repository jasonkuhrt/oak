import { transformerNotationDiff, transformerNotationHighlight } from '@shikijs/transformers'
// import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '@wollybeard/oak',
  description: 'Type-safe CLI command definition and execution',
  // Use root path for Netlify, /oak/ for GitHub Pages
  base: process.env.NETLIFY ? '/' : '/oak/',

  markdown: {
    codeTransformers: [
      // TODO: Re-enable Twoslash once we figure out module resolution
      // transformerTwoslash(),
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
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Extensions', link: '/extensions/zod' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Immutability', link: '/guide/immutability' },
            { text: 'Parameter Naming', link: '/guide/parameter-naming' },
            { text: 'Parameter Types', link: '/guide/parameter-types' },
            { text: 'Parameter Prompts', link: '/guide/prompts' },
          ],
        },
        {
          text: 'Arguments',
          items: [
            { text: 'Line Arguments', link: '/guide/line-arguments' },
            { text: 'Environment Arguments', link: '/guide/environment-arguments' },
          ],
        },
        {
          text: 'Advanced',
          items: [
            { text: 'Mutually Exclusive Parameters', link: '/guide/mutually-exclusive-parameters' },
            { text: 'Description', link: '/guide/description' },
            { text: 'Settings', link: '/guide/settings' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Recipes', link: '/guide/recipes' },
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Alternatives', link: '/guide/alternatives' },
          ],
        },
      ],
      '/extensions/': [
        {
          text: 'Extensions',
          items: [
            { text: 'Zod', link: '/extensions/zod' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jasonkuhrt/oak' },
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
