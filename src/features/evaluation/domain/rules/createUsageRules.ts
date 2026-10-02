import type { Rule } from '@ankhorage/rules';

import { DOCUMENTATION_RULE_METADATA } from '../../../../constants/documentation.js';
import { DOCUMENTATION_RULE_IDS } from '../../../../constants/documentationRuleIds.js';
import type { DocumentationRuleContext } from '../../../../types/documentation.js';
import { documentationRuleSupport } from '../../utils/documentationRuleSupport.js';

/*** Create programmatic and CLI usage documentation rules. */
export function createUsageRules(): readonly Rule<DocumentationRuleContext>[] {
  return [
    usageLocationRule(),
    usageReadmeUniqueRule(),
    usageReadmeCliRule(),
    usageReadmeMetadataRule(),
  ];
}

/*** Restrict @usage to real examples and CLI delivery sources. */
function usageLocationRule(): Rule<DocumentationRuleContext> {
  return documentationRuleSupport.createRule(
    DOCUMENTATION_RULE_IDS.usageLocation,
    '@usage is allowed only below examples/** or src/cli/**.',
    ({ comments }) =>
      comments.flatMap((comment) =>
        documentationRuleSupport.hasTag(comment, 'usage') &&
        !documentationRuleSupport.isExamplePath(comment.path) &&
        !documentationRuleSupport.isCliPath(comment.path)
          ? [
              documentationRuleSupport.finding(
                DOCUMENTATION_RULE_IDS.usageLocation,
                '@usage is allowed only below examples/** or src/cli/**.',
                comment.path,
                {},
                'error',
                comment.line,
              ),
            ]
          : [],
      ),
  );
}

/*** Require exactly one README-promoted example when programmatic usage is present. */
function usageReadmeUniqueRule(): Rule<DocumentationRuleContext> {
  return documentationRuleSupport.createRule(
    DOCUMENTATION_RULE_IDS.usageReadmeUnique,
    'Programmatic usage has exactly one README-promoted example.',
    ({ comments }) => {
      const usage = comments.filter(
        (comment) =>
          documentationRuleSupport.isExamplePath(comment.path) &&
          documentationRuleSupport.hasTag(comment, 'usage'),
      );
      if (usage.length === 0) return [];
      const promoted = usage.filter((comment) =>
        documentationRuleSupport.hasTag(comment, 'readme'),
      );
      return promoted.length === 1
        ? []
        : [
            documentationRuleSupport.finding(
              DOCUMENTATION_RULE_IDS.usageReadmeUnique,
              'Exactly one example with @usage must also declare @readme.',
              DOCUMENTATION_RULE_METADATA.paths.examplesRoot,
              { actual: promoted.length },
            ),
          ];
    },
  );
}

/*** Keep CLI usage out of the programmatic README promotion contract. */
function usageReadmeCliRule(): Rule<DocumentationRuleContext> {
  return documentationRuleSupport.createRule(
    DOCUMENTATION_RULE_IDS.usageReadmeCli,
    'CLI usage must not combine @usage and @readme.',
    ({ comments }) =>
      comments.flatMap((comment) =>
        documentationRuleSupport.isCliPath(comment.path) &&
        documentationRuleSupport.hasTag(comment, 'usage') &&
        documentationRuleSupport.hasTag(comment, 'readme')
          ? [
              documentationRuleSupport.finding(
                DOCUMENTATION_RULE_IDS.usageReadmeCli,
                '@usage and @readme must not be combined below src/cli/**.',
                comment.path,
                {},
                'error',
                comment.line,
              ),
            ]
          : [],
      ),
  );
}

/*** Require title and prose on the README-promoted usage entry. */
function usageReadmeMetadataRule(): Rule<DocumentationRuleContext> {
  return documentationRuleSupport.createRule(
    DOCUMENTATION_RULE_IDS.usageReadmeMetadata,
    'README-promoted usage requires @title and non-empty prose.',
    ({ comments }) =>
      comments.flatMap((comment) =>
        documentationRuleSupport.isExamplePath(comment.path) &&
        documentationRuleSupport.hasTag(comment, 'usage') &&
        documentationRuleSupport.hasTag(comment, 'readme') &&
        (!DOCUMENTATION_RULE_METADATA.readmeUsage.requiredTags.every((name) =>
          documentationRuleSupport.hasExactlyOneTag(comment, name),
        ) ||
          !documentationRuleSupport.hasNonEmptyTagValue(comment, 'title') ||
          comment.description.trim() === '')
          ? [
              documentationRuleSupport.finding(
                DOCUMENTATION_RULE_IDS.usageReadmeMetadata,
                'README-promoted usage requires @title and non-empty prose.',
                comment.path,
                {},
                'error',
                comment.line,
              ),
            ]
          : [],
      ),
  );
}
