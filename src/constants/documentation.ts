import type { DocumentationTagDefinition } from '../types/documentation.js';

/*** Canonical documentation metadata shared by fact collectors, renderers, and rules. */
export const DOCUMENTATION_RULE_METADATA = {
  comments: {
    allowCodeBlocks: false,
    allowInlineCode: true,
    rejectUnsupportedTagLines: true,
  },
  config: {
    declarationKinds: ['interface', 'type'],
    exactCount: 1,
    path: 'src/types/config.ts',
    required: false,
    requiredTags: ['config', 'readme', 'title'],
    requireDescription: true,
  },
  paths: {
    cliRoot: 'src/cli',
    configSchema: 'src/types/config.ts',
    examplesRoot: 'examples',
    usageRoots: ['examples', 'src/cli'],
  },
  readmeUsage: {
    activation: 'usage-tag',
    chapterCount: 1,
    cliReadmeCombinationAllowed: false,
    exactCount: 1,
    fullDocumentation: {
      includeAllUsageEntries: true,
    },
    required: false,
    requiredTags: ['usage', 'readme', 'title'],
    requireDescription: true,
    root: 'examples',
    sectionOrder: ['cli', 'programmatic'],
    sourceCode: {
      extraction: 'annotated-declaration',
      includeDocumentationComment: false,
      includeSourcePath: false,
    },
  },
  security: {
    exactTestNameRequired: true,
    sameDirectoryTestReference: true,
  },
  see: {
    protocol: 'https:',
    requirePublicNetworkTarget: true,
    requireReachable: true,
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
