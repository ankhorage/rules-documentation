import type { Rule } from '@ankhorage/rules';

import { DOCUMENTATION_RULE_METADATA } from '../../../../constants/documentation.js';
import { DOCUMENTATION_RULE_IDS } from '../../../../constants/documentationRuleIds.js';
import type { DocumentationRuleContext } from '../../../../types/documentation.js';
import { documentationRuleSupport } from '../../utils/documentationRuleSupport.js';

/*** Create configuration-documentation ownership and README rules. */
export function createConfigRules(): readonly Rule<DocumentationRuleContext>[] {
  return [
    configFileRule(),
    configLocationRule(),
    configReadmeUniqueRule(),
    configReadmeMetadataRule(),
  ];
}

/*** Require the canonical config schema once configuration documentation is active. */
function configFileRule(): Rule<DocumentationRuleContext> {
  return documentationRuleSupport.createRule(
    DOCUMENTATION_RULE_IDS.configFile,
    'Configuration documentation uses src/types/config.ts.',
    ({ comments, files }) => {
      const active = comments.some((comment) => documentationRuleSupport.hasTag(comment, 'config'));
      return active && !files.includes(DOCUMENTATION_RULE_METADATA.paths.configSchema)
        ? [
            documentationRuleSupport.finding(
              DOCUMENTATION_RULE_IDS.configFile,
              'Configuration documentation requires src/types/config.ts.',
              DOCUMENTATION_RULE_METADATA.paths.configSchema,
              {},
            ),
          ]
        : [];
    },
  );
}

/*** Restrict @config to the canonical config schema. */
function configLocationRule(): Rule<DocumentationRuleContext> {
  return documentationRuleSupport.createRule(
    DOCUMENTATION_RULE_IDS.configLocation,
    '@config is allowed only in src/types/config.ts.',
    ({ comments }) =>
      comments.flatMap((comment) =>
        documentationRuleSupport.hasTag(comment, 'config') &&
        comment.path !== DOCUMENTATION_RULE_METADATA.paths.configSchema
          ? [
              documentationRuleSupport.finding(
                DOCUMENTATION_RULE_IDS.configLocation,
                '@config is allowed only in src/types/config.ts.',
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

/*** Require one README-promoted configuration root when configuration docs are active. */
function configReadmeUniqueRule(): Rule<DocumentationRuleContext> {
  return documentationRuleSupport.createRule(
    DOCUMENTATION_RULE_IDS.configReadmeUnique,
    'Configuration documentation has one README root.',
    ({ comments, files }) => {
      const configs = comments.filter((comment) =>
        documentationRuleSupport.hasTag(comment, 'config'),
      );
      const active =
        files.includes(DOCUMENTATION_RULE_METADATA.paths.configSchema) || configs.length > 0;
      if (!active) return [];
      const promoted = configs.filter(
        (comment) =>
          comment.path === DOCUMENTATION_RULE_METADATA.paths.configSchema &&
          hasConfigDeclarationTag(comment) &&
          documentationRuleSupport.hasTag(comment, 'readme'),
      );
      return promoted.length === 1
        ? []
        : [
            documentationRuleSupport.finding(
              DOCUMENTATION_RULE_IDS.configReadmeUnique,
              'Exactly one @config declaration in src/types/config.ts must also declare @readme.',
              DOCUMENTATION_RULE_METADATA.paths.configSchema,
              { actual: promoted.length },
            ),
          ];
    },
  );
}

/*** Require title and prose on the README-promoted configuration root. */
function configReadmeMetadataRule(): Rule<DocumentationRuleContext> {
  return documentationRuleSupport.createRule(
    DOCUMENTATION_RULE_IDS.configReadmeMetadata,
    'The README configuration root requires @title and non-empty prose.',
    ({ comments }) =>
      comments.flatMap((comment) =>
        comment.path === DOCUMENTATION_RULE_METADATA.paths.configSchema &&
        hasConfigDeclarationTag(comment) &&
        documentationRuleSupport.hasTag(comment, 'readme') &&
        (!DOCUMENTATION_RULE_METADATA.config.requiredTags.every((name) =>
          documentationRuleSupport.hasExactlyOneTag(comment, name),
        ) ||
          !documentationRuleSupport.hasNonEmptyTagValue(comment, 'title') ||
          comment.description.trim() === '')
          ? [
              documentationRuleSupport.finding(
                DOCUMENTATION_RULE_IDS.configReadmeMetadata,
                'The README configuration root requires @title and non-empty prose.',
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

/*** Return whether a comment owns @config on a canonical type-like declaration target. */
function hasConfigDeclarationTag(comment: DocumentationRuleContext['comments'][number]): boolean {
  return documentationRuleSupport
    .tags(comment, 'config')
    .some((tag) => tag.target === 'interface' || tag.target === 'type');
}
