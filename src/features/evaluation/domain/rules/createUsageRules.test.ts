import { expect, test } from 'bun:test';

import { evaluateDocumentation } from '../../../../index.js';
import type {
  DocumentationCommentFact,
  DocumentationRuleContext,
} from '../../../../types/documentation.js';

const emptyPublishableContext: DocumentationRuleContext = {
  comments: [],
  files: [],
  package: { publishable: true },
  publicFunctions: [],
  securityReferences: [],
  seeReferences: [],
};

test('rejects publishable packages without usage declarations', () => {
  expect(
    findUsageReadmeUniqueFinding(evaluateDocumentation(emptyPublishableContext)),
  ).toMatchObject({
    evidence: { actual: 0, usageCount: 0 },
    message:
      'A publishable package requires exactly one examples/** declaration with @usage and @readme.',
    severity: 'error',
    subjects: [{ path: 'examples' }],
  });
});

test('exempts non-publishable packages without programmatic examples', () => {
  expect(
    findUsageReadmeUniqueFinding(
      evaluateDocumentation({ ...emptyPublishableContext, package: { publishable: false } }),
    ),
  ).toBeUndefined();
});

test('accepts one eligible README-promoted programmatic example', () => {
  expect(
    findUsageReadmeUniqueFinding(
      evaluateDocumentation({
        ...emptyPublishableContext,
        comments: [createReadmeUsageComment('examples/basic/index.ts')],
      }),
    ),
  ).toBeUndefined();
});

test('rejects multiple README-promoted programmatic examples', () => {
  expect(
    findUsageReadmeUniqueFinding(
      evaluateDocumentation({
        ...emptyPublishableContext,
        comments: [
          createReadmeUsageComment('examples/first/index.ts'),
          createReadmeUsageComment('examples/second/index.ts'),
        ],
      }),
    ),
  ).toMatchObject({ evidence: { actual: 2, usageCount: 2 }, severity: 'error' });
});

test('rejects a programmatic example without README promotion', () => {
  expect(
    findUsageReadmeUniqueFinding(
      evaluateDocumentation({
        ...emptyPublishableContext,
        comments: [
          {
            ...createReadmeUsageComment('examples/basic/index.ts'),
            tags: [
              { name: 'usage', target: 'block' },
              { name: 'title', target: 'block', value: 'Basic usage' },
            ],
          },
        ],
      }),
    ),
  ).toMatchObject({ evidence: { actual: 0, usageCount: 1 }, severity: 'error' });
});

test('does not treat CLI-only usage as a programmatic package example', () => {
  expect(
    findUsageReadmeUniqueFinding(
      evaluateDocumentation({
        ...emptyPublishableContext,
        comments: [
          {
            description: 'Run the CLI.',
            hasCodeBlock: false,
            path: 'src/cli/run.ts',
            tags: [{ name: 'usage', target: 'block' }],
          },
        ],
      }),
    ),
  ).toMatchObject({ evidence: { actual: 0, usageCount: 0 }, severity: 'error' });
});

/*** Find the required programmatic README usage finding. */
function findUsageReadmeUniqueFinding(result: ReturnType<typeof evaluateDocumentation>) {
  return result.findings.find(({ ruleId }) => ruleId === 'documentation.usage.readme.unique');
}

/*** Create one complete README-promoted programmatic example comment. */
function createReadmeUsageComment(path: string): DocumentationCommentFact {
  return {
    description: 'Use the package programmatically.',
    hasCodeBlock: false,
    path,
    tags: [
      { name: 'usage', target: 'block' },
      { name: 'readme', target: 'block' },
      { name: 'title', target: 'block', value: 'Basic usage' },
    ],
  };
}
