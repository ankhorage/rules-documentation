import type { DocumentationTagDefinition } from '../types/documentation.js';

/*** Canonical documentation metadata shared by fact collectors and rules. */
export const DOCUMENTATION_RULE_METADATA = {
  paths: {
    cliRoot: 'src/cli',
    configSchema: 'src/types/config.ts',
    examplesRoot: 'examples',
  },
  tags: [
    {
      name: 'readme',
      repeatable: false,
      valueKind: 'none',
      appliesTo: ['block', 'symbol', 'interface', 'type'],
    },
    {
      name: 'usage',
      repeatable: false,
      valueKind: 'none',
      appliesTo: ['block', 'symbol'],
    },
    {
      name: 'config',
      repeatable: false,
      valueKind: 'none',
      appliesTo: ['interface', 'type'],
    },
    {
      name: 'title',
      repeatable: false,
      valueKind: 'non-empty-text',
      appliesTo: ['block', 'symbol', 'interface', 'type'],
    },
    {
      name: 'see',
      repeatable: true,
      valueKind: 'public-https-url',
      appliesTo: ['block', 'symbol', 'interface', 'type'],
    },
    {
      name: 'security',
      repeatable: true,
      valueKind: 'colocated-test-reference',
      appliesTo: ['symbol'],
    },
  ] as const satisfies readonly DocumentationTagDefinition[],
} as const;
