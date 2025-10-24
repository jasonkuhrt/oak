import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: [`./tests/_/setup.ts`],
    snapshotOptions: {
      // In CI, polychrome snapshots are skipped (via if (!process.env.CI) checks)
      // Don't fail when those snapshots appear unused
      removeObsoleteSnapshots: !process.env.CI,
    },
    deps: {
      optimizer: {
        ssr: {
          include: [`vitest-mock-process`],
        },
      },
    },
  },
})
