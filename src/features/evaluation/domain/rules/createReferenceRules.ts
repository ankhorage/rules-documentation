import type { Rule } from '@ankhorage/rules';

import { DOCUMENTATION_RULE_IDS } from '../../../../constants/documentationRuleIds.js';
import type { DocumentationRuleContext } from '../../../../types/documentation.js';
import { documentationRuleSupport } from '../../utils/documentationRuleSupport.js';

/*** Create @see and @security reference-validation rules. */
export function createReferenceRules(): readonly Rule<DocumentationRuleContext>[] {
  return [seeValueRule(), seeReachableRule(), securityReferenceRule()];
}

/*** Require @see values to be non-empty HTTPS URLs before network evidence is considered. */
function seeValueRule(): Rule<DocumentationRuleContext> {
  return documentationRuleSupport.createRule(
    DOCUMENTATION_RULE_IDS.seeValue,
    '@see requires a non-empty public HTTPS URL.',
    ({ comments }) =>
      comments.flatMap((comment) =>
        documentationRuleSupport
          .tags(comment, 'see')
          .flatMap((tag) =>
            documentationRuleSupport.isHttpsUrl(tag.value)
              ? []
              : [
                  documentationRuleSupport.finding(
                    DOCUMENTATION_RULE_IDS.seeValue,
                    '@see requires a non-empty HTTPS URL.',
                    comment.path,
                    { value: tag.value ?? '' },
                  ),
                ],
          ),
      ),
  );
}

/*** Require consumer-supplied public-network and reachability evidence for @see URLs. */
function seeReachableRule(): Rule<DocumentationRuleContext> {
  return documentationRuleSupport.createRule(
    DOCUMENTATION_RULE_IDS.seeReachable,
    '@see URLs must resolve to reachable public HTTPS resources.',
    ({ comments, seeReferences }) =>
      comments.flatMap((comment) =>
        documentationRuleSupport.tags(comment, 'see').flatMap((tag) => {
          if (!documentationRuleSupport.isHttpsUrl(tag.value)) return [];
          const reference = seeReferences.find(
            (candidate) => candidate.path === comment.path && candidate.url === tag.value,
          );
          return reference?.reachable === true && reference.publicNetworkTarget
            ? []
            : [
                documentationRuleSupport.finding(
                  DOCUMENTATION_RULE_IDS.seeReachable,
                  '@see URL is not confirmed as a reachable public resource.',
                  comment.path,
                  { url: tag.value ?? '' },
                ),
              ];
        }),
      ),
  );
}

/*** Require @security to resolve to exactly named colocated executable-test evidence. */
function securityReferenceRule(): Rule<DocumentationRuleContext> {
  return documentationRuleSupport.createRule(
    DOCUMENTATION_RULE_IDS.securityReference,
    '@security references a colocated executable test.',
    ({ comments, securityReferences }) =>
      comments.flatMap((comment) =>
        documentationRuleSupport.tags(comment, 'security').flatMap((tag) => {
          const value = tag.value?.trim() ?? '';
          const reference = securityReferences.find(
            (candidate) => candidate.path === comment.path && candidate.reference === value,
          );
          return value !== '' &&
            reference?.colocatedTestExists === true &&
            reference.exactTestNameMatches
            ? []
            : [
                documentationRuleSupport.finding(
                  DOCUMENTATION_RULE_IDS.securityReference,
                  '@security must reference exactly one executable test colocated with the documented source.',
                  comment.path,
                  { reference: value },
                ),
              ];
        }),
      ),
  );
}
