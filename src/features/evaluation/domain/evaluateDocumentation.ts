import {
  createRuleRegistry,
  evaluateConfiguredRules,
  evaluateRules,
} from '@ankhorage/rules';

import type {
  DocumentationEvaluationOptions,
  DocumentationEvaluationResult,
  DocumentationRuleContext,
} from '../../../types/documentation.js';
import { createDocumentationRuleSet } from './createDocumentationRuleSet.js';

/*** Evaluate normalized documentation facts through the canonical documentation RuleSet. */
export function evaluateDocumentation(
  context: DocumentationRuleContext,
  options: DocumentationEvaluationOptions = {},
): DocumentationEvaluationResult {
  const ruleSet = createDocumentationRuleSet();
  return options.config === undefined
    ? evaluateRules(context, ruleSet.rules)
    : evaluateConfiguredRules(context, options.config, createRuleRegistry([ruleSet]));
}
