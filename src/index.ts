export { DOCUMENTATION_RULE_METADATA } from './constants/documentation.js';
export { createDocumentationRuleSet } from './features/evaluation/domain/createDocumentationRuleSet.js';
export { evaluateDocumentation } from './features/evaluation/domain/evaluateDocumentation.js';
export type {
  DocumentationCommentFact,
  DocumentationEvaluationOptions,
  DocumentationEvaluationResult,
  DocumentationPackageFact,
  DocumentationPublicFunctionFact,
  DocumentationRuleContext,
  DocumentationSecurityReferenceFact,
  DocumentationSeeReferenceFact,
  DocumentationTagDefinition,
  DocumentationTagFact,
  DocumentationTagName,
  DocumentationTagTarget,
  DocumentationTagValueKind,
} from './types/documentation.js';
