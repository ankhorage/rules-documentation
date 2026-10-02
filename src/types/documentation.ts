import type { RuleEvaluationResult, RulesConfig } from '@ankhorage/rules';

/*** Canonical target kinds supported by documentation metadata. */
export type DocumentationTagTarget = 'block' | 'interface' | 'symbol' | 'type';

/*** Canonical value shapes supported by documentation metadata. */
export type DocumentationTagValueKind =
  'colocated-test-reference' | 'non-empty-text' | 'none' | 'public-https-url';

/*** Canonical documentation tag names. */
export type DocumentationTagName = 'config' | 'readme' | 'security' | 'see' | 'title' | 'usage';

/*** One canonical documentation tag definition used by parsers before evaluation. */
export interface DocumentationTagDefinition {
  readonly appliesTo: readonly DocumentationTagTarget[];
  readonly name: DocumentationTagName;
  readonly repeatable: boolean;
  readonly valueKind: DocumentationTagValueKind;
}

/*** One tag occurrence extracted from a documentation comment. */
export interface DocumentationTagFact {
  readonly name: string;
  readonly target: DocumentationTagTarget;
  readonly value?: string;
}

/*** One normalized documentation comment supplied by a consumer adapter. */
export interface DocumentationCommentFact {
  readonly description: string;
  readonly hasCodeBlock: boolean;
  readonly path: string;
  readonly tags: readonly DocumentationTagFact[];
}

/*** One public function whose description is evaluated independently of parser technology. */
export interface DocumentationPublicFunctionFact {
  readonly description: string;
  readonly name: string;
  readonly path: string;
}

/*** Network evidence collected by a consumer for one @see reference. */
export interface DocumentationSeeReferenceFact {
  readonly path: string;
  readonly publicNetworkTarget: boolean;
  readonly reachable: boolean;
  readonly url: string;
}

/*** Test-discovery evidence collected by a consumer for one @security reference. */
export interface DocumentationSecurityReferenceFact {
  readonly colocatedTestExists: boolean;
  readonly exactTestNameMatches: boolean;
  readonly path: string;
  readonly reference: string;
}

/*** Portable documentation facts evaluated by the provider. */
export interface DocumentationRuleContext {
  readonly comments: readonly DocumentationCommentFact[];
  readonly files: readonly string[];
  readonly publicFunctions: readonly DocumentationPublicFunctionFact[];
  readonly securityReferences: readonly DocumentationSecurityReferenceFact[];
  readonly seeReferences: readonly DocumentationSeeReferenceFact[];
}

/*** Optional generic Rules configuration applied to documentation rules. */
export interface DocumentationEvaluationOptions {
  readonly config?: RulesConfig;
}

/*** Generic Rules result produced by documentation evaluation. */
export type DocumentationEvaluationResult = RuleEvaluationResult;
