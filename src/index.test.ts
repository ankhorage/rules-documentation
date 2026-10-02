import { describe, expect, test } from 'bun:test';

import { DOCUMENTATION_RULE_METADATA, evaluateDocumentation } from './index.js';
import type {
  DocumentationRuleContext,
  DocumentationSecurityReferenceFact,
  DocumentationSeeReferenceFact,
} from './types/documentation.js';

const emptyContext: DocumentationRuleContext = {
  comments: [],
  files: [],
  publicFunctions: [],
  securityReferences: [],
  seeReferences: [],
};
const canonicalSecurityReference: DocumentationSecurityReferenceFact = {
  colocatedTestExists: true,
  exactTestNameMatches: true,
  path: 'src/sensitive.ts',
  reference: 'rejects invalid input',
};
const canonicalSeeReference: DocumentationSeeReferenceFact = {
  path: 'examples/basic/index.ts',
  publicNetworkTarget: true,
  reachable: true,
  url: 'https://example.com/docs',
};

describe('documentation rules', () => {
  test('publishes the canonical documentation tag vocabulary', () => {
    expect(DOCUMENTATION_RULE_METADATA.tags.map(({ name }) => name)).toEqual([
      'readme',
      'usage',
      'config',
      'title',
      'see',
      'security',
    ]);
  });

  test('publishes complete fact-collection metadata for consumers', () => {
    expect(DOCUMENTATION_RULE_METADATA.paths.usageRoots).toEqual(['examples', 'src/cli']);
    expect(DOCUMENTATION_RULE_METADATA.readmeUsage.requiredTags).toEqual([
      'usage',
      'readme',
      'title',
    ]);
    expect(DOCUMENTATION_RULE_METADATA.config.path).toBe('src/types/config.ts');
    expect(DOCUMENTATION_RULE_METADATA.see.protocol).toBe('https:');
    expect(DOCUMENTATION_RULE_METADATA.security.exactTestNameRequired).toBe(true);
  });

  test('accepts canonical documentation evidence', () => {
    expect(evaluateDocumentation(createCanonicalContext())).toEqual({
      diagnostics: [],
      findings: [],
    });
  });
});

describe('documentation finding evidence', () => {
  test('preserves source locations on provider findings', () => {
    const result = evaluateDocumentation(createInvalidContext());
    expect(
      result.findings.find(({ ruleId }) => ruleId === 'documentation.comment.code-block')
        ?.sourceLocation,
    ).toEqual({ line: 42, path: 'src/example.ts' });
    expect(
      result.findings.find(({ ruleId }) => ruleId === 'documentation.public-function.description')
        ?.sourceLocation,
    ).toEqual({ line: 44, path: 'src/example.ts' });
  });
});

describe('configuration documentation activation', () => {
  test('rejects config roots on non-type declaration targets', () => {
    const result = evaluateDocumentation({
      ...emptyContext,
      comments: [
        {
          description: 'Invalid config owner.',
          hasCodeBlock: false,
          path: 'src/types/config.ts',
          tags: [
            { name: 'config', target: 'symbol' },
            { name: 'readme', target: 'symbol' },
            { name: 'title', target: 'symbol', value: 'Configuration' },
          ],
        },
      ],
      files: ['src/types/config.ts'],
    });
    expect(result.findings.map(({ ruleId }) => ruleId)).toContain(
      'documentation.config.readme.unique',
    );
  });

  test('treats the canonical config file as configuration documentation opt-in', () => {
    const result = evaluateDocumentation({
      ...emptyContext,
      files: ['src/types/config.ts'],
    });
    expect(result.findings.map(({ ruleId }) => ruleId)).toContain(
      'documentation.config.readme.unique',
    );
  });

  test('reports violations as generic Rules findings', () => {
    const result = evaluateDocumentation(createInvalidContext());
    const ruleIds = result.findings.map(({ ruleId }) => ruleId);
    expect(result.diagnostics).toEqual([]);
    expect(ruleIds).toContain('documentation.comment.tag.unsupported');
    expect(ruleIds).toContain('documentation.comment.code-block');
    expect(ruleIds).toContain('documentation.usage.location');
    expect(ruleIds).toContain('documentation.see.value');
    expect(
      result.findings.find(({ ruleId }) => ruleId === 'documentation.public-function.description')
        ?.severity,
    ).toBe('warning');
  });
});

/*** Build a complete canonical documentation fact fixture. */
function createCanonicalContext(): DocumentationRuleContext {
  return {
    comments: [
      {
        description: 'Use the package programmatically.',
        hasCodeBlock: false,
        path: 'examples/basic/index.ts',
        tags: [
          { name: 'usage', target: 'block' },
          { name: 'readme', target: 'block' },
          { name: 'title', target: 'block', value: 'Basic usage' },
          { name: 'see', target: 'block', value: 'https://example.com/docs' },
        ],
      },
      {
        description: 'Configure the package.',
        hasCodeBlock: false,
        path: 'src/types/config.ts',
        tags: [
          { name: 'config', target: 'interface' },
          { name: 'readme', target: 'interface' },
          { name: 'title', target: 'interface', value: 'Configuration' },
        ],
      },
      {
        description: 'Performs the sensitive operation.',
        hasCodeBlock: false,
        path: 'src/sensitive.ts',
        tags: [{ name: 'security', target: 'symbol', value: 'rejects invalid input' }],
      },
    ],
    files: ['examples/basic/index.ts', 'src/types/config.ts', 'src/sensitive.test.ts'],
    publicFunctions: [{ description: 'Runs the package.', name: 'run', path: 'src/run.ts' }],
    securityReferences: [canonicalSecurityReference],
    seeReferences: [canonicalSeeReference],
  };
}

/*** Build a compact fixture that violates independent documentation rules. */
function createInvalidContext(): DocumentationRuleContext {
  return {
    ...emptyContext,
    comments: [
      {
        description: '',
        hasCodeBlock: true,
        line: 42,
        path: 'src/example.ts',
        tags: [
          { name: 'usage', target: 'symbol' },
          { name: 'todo', target: 'symbol' },
          { name: 'see', target: 'symbol', value: 'http://example.com' },
        ],
      },
    ],
    publicFunctions: [{ description: '', line: 44, name: 'example', path: 'src/example.ts' }],
  };
}
