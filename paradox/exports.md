# Public API

## createDocumentationRuleSet

Kind: `function`
Module: `src/features/evaluation/domain/createDocumentationRuleSet.ts`
Source: `src/features/evaluation/domain/createDocumentationRuleSet.ts:11:1`

Create the canonical documentation RuleSet without parser, filesystem, or network coupling.

### Signatures

- `() => RuleSet<DocumentationRuleContext>`
  - returns: `RuleSet<DocumentationRuleContext>`

## DOCUMENTATION_RULE_METADATA

Kind: `value`
Module: `src/constants/documentation.ts`
Source: `src/constants/documentation.ts:4:14`

Canonical documentation metadata shared by fact collectors and rules.

## DocumentationCommentFact

Kind: `type`
Module: `src/types/documentation.ts`
Source: `src/types/documentation.ts:29:1`

One normalized documentation comment supplied by a consumer adapter.

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| description | property | `string` | yes |  |
| hasCodeBlock | property | `boolean` | yes |  |
| path | property | `string` | yes |  |
| tags | property | `readonly DocumentationTagFact[]` | yes |  |

## DocumentationEvaluationOptions

Kind: `type`
Module: `src/types/documentation.ts`
Source: `src/types/documentation.ts:69:1`

Optional generic Rules configuration applied to documentation rules.

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| config | property | `RulesConfig \| undefined` | no |  |

## DocumentationEvaluationResult

Kind: `unknown`
Module: `src/types/documentation.ts`
Source: `src/types/documentation.ts:74:1`

Generic Rules result produced by documentation evaluation.

## DocumentationPublicFunctionFact

Kind: `type`
Module: `src/types/documentation.ts`
Source: `src/types/documentation.ts:37:1`

One public function whose description is evaluated independently of parser technology.

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| description | property | `string` | yes |  |
| name | property | `string` | yes |  |
| path | property | `string` | yes |  |

## DocumentationRuleContext

Kind: `type`
Module: `src/types/documentation.ts`
Source: `src/types/documentation.ts:60:1`

Portable documentation facts evaluated by the provider.

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| comments | property | `readonly DocumentationCommentFact[]` | yes |  |
| files | property | `readonly string[]` | yes |  |
| publicFunctions | property | `readonly DocumentationPublicFunctionFact[]` | yes |  |
| securityReferences | property | `readonly DocumentationSecurityReferenceFact[]` | yes |  |
| seeReferences | property | `readonly DocumentationSeeReferenceFact[]` | yes |  |

## DocumentationSecurityReferenceFact

Kind: `type`
Module: `src/types/documentation.ts`
Source: `src/types/documentation.ts:52:1`

Test-discovery evidence collected by a consumer for one @security reference.

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| colocatedTestExists | property | `boolean` | yes |  |
| exactTestNameMatches | property | `boolean` | yes |  |
| path | property | `string` | yes |  |
| reference | property | `string` | yes |  |

## DocumentationSeeReferenceFact

Kind: `type`
Module: `src/types/documentation.ts`
Source: `src/types/documentation.ts:44:1`

Network evidence collected by a consumer for one @see reference.

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| path | property | `string` | yes |  |
| publicNetworkTarget | property | `boolean` | yes |  |
| reachable | property | `boolean` | yes |  |
| url | property | `string` | yes |  |

## DocumentationTagDefinition

Kind: `type`
Module: `src/types/documentation.ts`
Source: `src/types/documentation.ts:14:1`

One canonical documentation tag definition used by parsers before evaluation.

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| appliesTo | property | `readonly DocumentationTagTarget[]` | yes |  |
| name | property | `DocumentationTagName` | yes |  |
| repeatable | property | `boolean` | yes |  |
| valueKind | property | `DocumentationTagValueKind` | yes |  |

## DocumentationTagFact

Kind: `type`
Module: `src/types/documentation.ts`
Source: `src/types/documentation.ts:22:1`

One tag occurrence extracted from a documentation comment.

### Members

| Name | Kind | Type | Required | Description |
| --- | --- | --- | --- | --- |
| name | property | `string` | yes |  |
| target | property | `DocumentationTagTarget` | yes |  |
| value | property | `string \| undefined` | no |  |

## DocumentationTagName

Kind: `unknown`
Module: `src/types/documentation.ts`
Source: `src/types/documentation.ts:11:1`

Canonical documentation tag names.

## DocumentationTagTarget

Kind: `unknown`
Module: `src/types/documentation.ts`
Source: `src/types/documentation.ts:4:1`

Canonical target kinds supported by documentation metadata.

## DocumentationTagValueKind

Kind: `unknown`
Module: `src/types/documentation.ts`
Source: `src/types/documentation.ts:7:1`

Canonical value shapes supported by documentation metadata.

## evaluateDocumentation

Kind: `function`
Module: `src/features/evaluation/domain/evaluateDocumentation.ts`
Source: `src/features/evaluation/domain/evaluateDocumentation.ts:11:1`

Evaluate normalized documentation facts through the canonical documentation RuleSet.

### Signatures

- `(context: DocumentationRuleContext, options?: DocumentationEvaluationOptions) => import("@ankhorage/rules").RuleEvaluationResult`
  - context: `DocumentationRuleContext`
  - options: `DocumentationEvaluationOptions` (optional)
  - returns: `import("@ankhorage/rules").RuleEvaluationResult`
