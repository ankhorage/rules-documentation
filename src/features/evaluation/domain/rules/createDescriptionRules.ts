import type { Rule } from '@ankhorage/rules';

import { DOCUMENTATION_RULE_IDS } from '../../../../constants/documentationRuleIds.js';
import type { DocumentationRuleContext } from '../../../../types/documentation.js';
import { documentationRuleSupport } from '../../utils/documentationRuleSupport.js';

/*** Create advisory rules for public documentation prose. */
export function createDescriptionRules(): readonly Rule<DocumentationRuleContext>[] {
  return [
    documentationRuleSupport.createRule(
      DOCUMENTATION_RULE_IDS.publicFunctionDescription,
      'Every exported function should have a non-empty documentation description.',
      ({ publicFunctions }) =>
        publicFunctions.flatMap((fn) =>
          fn.description.trim() === ''
            ? [
                documentationRuleSupport.finding(
                  DOCUMENTATION_RULE_IDS.publicFunctionDescription,
                  `Exported function ${fn.name} has no documentation description.`,
                  fn.path,
                  { name: fn.name },
                  'warning',
                ),
              ]
            : [],
        ),
      'warning',
    ),
  ];
}
