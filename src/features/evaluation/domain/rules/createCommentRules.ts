import type { Rule } from '@ankhorage/rules';

import { DOCUMENTATION_RULE_METADATA } from '../../../../constants/documentation.js';
import { DOCUMENTATION_RULE_IDS } from '../../../../constants/documentationRuleIds.js';
import type { DocumentationRuleContext } from '../../../../types/documentation.js';
import { documentationRuleSupport } from '../../utils/documentationRuleSupport.js';

/*** Create comment-shape and tag-vocabulary rules. */
export function createCommentRules(): readonly Rule<DocumentationRuleContext>[] {
  const supported = new Set<string>(DOCUMENTATION_RULE_METADATA.tags.map(({ name }) => name));
  return [
    documentationRuleSupport.createRule(
      DOCUMENTATION_RULE_IDS.unsupportedTag,
      'Tag-shaped documentation metadata must use a supported tag.',
      ({ comments }) =>
        comments.flatMap((comment) =>
          comment.tags.flatMap((tag) =>
            supported.has(tag.name)
              ? []
              : [
                  documentationRuleSupport.finding(
                    DOCUMENTATION_RULE_IDS.unsupportedTag,
                    `Unsupported documentation tag @${tag.name}.`,
                    comment.path,
                    { tag: tag.name },
                    'error',
                    comment.line,
                  ),
                ],
          ),
        ),
    ),
    documentationRuleSupport.createRule(
      DOCUMENTATION_RULE_IDS.codeBlock,
      'Documentation comments must not contain source code blocks.',
      ({ comments }) =>
        comments.flatMap((comment) =>
          comment.hasCodeBlock
            ? [
                documentationRuleSupport.finding(
                  DOCUMENTATION_RULE_IDS.codeBlock,
                  'Documentation comments must reference real source examples instead of embedding code blocks.',
                  comment.path,
                  {},
                  'error',
                  comment.line,
                ),
              ]
            : [],
        ),
    ),
  ];
}
