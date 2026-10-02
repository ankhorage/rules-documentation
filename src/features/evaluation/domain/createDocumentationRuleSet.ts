import type { RuleSet } from '@ankhorage/rules';

import type { DocumentationRuleContext } from '../../../types/documentation.js';
import { createCommentRules } from './rules/createCommentRules.js';
import { createConfigRules } from './rules/createConfigRules.js';
import { createDescriptionRules } from './rules/createDescriptionRules.js';
import { createReferenceRules } from './rules/createReferenceRules.js';
import { createUsageRules } from './rules/createUsageRules.js';

/*** Create the canonical documentation RuleSet without parser, filesystem, or network coupling. */
export function createDocumentationRuleSet(): RuleSet<DocumentationRuleContext> {
  return {
    id: 'documentation',
    rules: [
      ...createCommentRules(),
      ...createUsageRules(),
      ...createConfigRules(),
      ...createReferenceRules(),
      ...createDescriptionRules(),
    ],
  };
}
