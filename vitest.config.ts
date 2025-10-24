import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: [`./tests/_/setup.ts`],
    deps: {
      optimizer: {
        ssr: {
          include: [`vitest-mock-process`],
        },
      },
    },
  },
})
