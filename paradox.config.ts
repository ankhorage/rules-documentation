import { defineParadoxConfig } from '@ankhorage/paradox';

export default defineParadoxConfig({
  mode: 'write',
  docs: {
    title: '@ankhorage/rules-documentation',
    description: 'Documentation rule provider for Ankhorage source and generated documentation.',
  },
  package: {
    root: '.',
    entrypoints: ['src/index.ts'],
  },
  output: { dir: './paradox' },
});
