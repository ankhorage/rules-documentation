import { describe, expect, test } from 'bun:test';

import { DOCUMENTATION_RULE_METADATA, evaluateDocumentation } from './index.js';
import type { DocumentationRuleContext } from './types/documentation.js';

const emptyContext: DocumentationRuleContext = {
  comments: [],
  files: [],
  publicFunctions: [],
  securityReferences: [],
  seeReferences: [],
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

  test('accepts canonical documentation evidence', () => {
    const context: DocumentationRuleContext = {
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
      seeReferences: [
        {
          path: 'examples/basic/index.ts',
          publicNetworkTarget: true,
          reachable: true,
          url: 'https://example.com/docs',
        },
      ],
      securityReferences: [
        {
          colocatedTestExists: true,
          exactTestNameMatches: true,
          path: 'src/sensitive.ts',
          reference: 'rejects invalid input',
        },
      ],
    };

    expect(evaluateDocumentation(context)).toEqual({ diagnostics: [], findings: [] });
  });

  test('reports violations as generic Rules findings', () => {
    const context: DocumentationRuleContext = {
      ...emptyContext,
      comments: [
        {
          description: '',
          hasCodeBlock: true,
          path: 'src/example.ts',
          tags: [
            { name: 'usage', target: 'symbol' },
            { name: 'todo', target: 'symbol' },
            { name: 'see', target: 'symbol', value: 'http://example.com' },
          ],
        },
      ],
      publicFunctions: [{ description: '', name: 'example', path: 'src/example.ts' }],
    };

    const result = evaluateDocumentation(context);
    expect(result.diagnostics).toEqual([]);
    expect(result.findings.map(({ ruleId }) => ruleId)).toContain(
      'documentation.comment.tag.unsupported',
    );
    expect(result.findings.map(({ ruleId }) => ruleId)).toContain(
      'documentation.comment.code-block',
    );
    expect(result.findings.map(({ ruleId }) => ruleId)).toContain(
      'documentation.usage.location',
    );
    expect(result.findings.map(({ ruleId }) => ruleId)).toContain('documentation.see.value');
    expect(result.findings).toContainEqual(
      expect.objectContaining({
        ruleId: 'documentation.public-function.description',
        severity: 'warning',
      }),
    );
  });
});
