import type { JsonValue, Rule, RuleFinding, RuleSeverity } from '@ankhorage/rules';

import { DOCUMENTATION_RULE_METADATA } from '../../../constants/documentation.js';
import type {
  DocumentationCommentFact,
  DocumentationRuleContext,
  DocumentationTagFact,
} from '../../../types/documentation.js';

/*** Shared feature-local primitives for deterministic documentation rules. */
export const documentationRuleSupport = {
  createRule,
  finding,
  hasExactlyOneTag,
  hasNonEmptyTagValue,
  hasTag,
  isCliPath,
  isExamplePath,
  isHttpsUrl,
  tags,
} as const;

/*** Build one deterministic provider rule with a fixed default severity. */
function createRule(
  id: string,
  summary: string,
  evaluate: (context: DocumentationRuleContext) => readonly RuleFinding[],
  defaultSeverity: RuleSeverity = 'error',
): Rule<DocumentationRuleContext> {
  return {
    id,
    summary,
    defaultSeverity,
    evaluate: ({ context }) => evaluate(context),
  };
}

/*** Build one portable documentation finding. */
function finding(
  ruleId: string,
  message: string,
  path: string,
  evidence: JsonValue,
  severity: RuleSeverity = 'error',
  line?: number,
): RuleFinding {
  return {
    evidence,
    message,
    ruleId,
    severity,
    subjects: [{ id: path, kind: 'documentation-source', path }],
    ...(line === undefined ? {} : { sourceLocation: { line, path } }),
  };
}

/*** Return all tags with one raw name from a comment. */
function tags(comment: DocumentationCommentFact, name: string): readonly DocumentationTagFact[] {
  return comment.tags.filter((tag) => tag.name === name);
}

/*** Return whether a comment contains one raw tag name. */
function hasTag(comment: DocumentationCommentFact, name: string): boolean {
  return tags(comment, name).length > 0;
}

/*** Return whether a comment contains exactly one raw tag name. */
function hasExactlyOneTag(comment: DocumentationCommentFact, name: string): boolean {
  return tags(comment, name).length === 1;
}

/*** Return whether a comment contains one tag with non-empty text. */
function hasNonEmptyTagValue(comment: DocumentationCommentFact, name: string): boolean {
  return tags(comment, name).some((tag) => (tag.value?.trim() ?? '') !== '');
}

/*** Return whether a portable path belongs to the examples root. */
function isExamplePath(path: string): boolean {
  const root = DOCUMENTATION_RULE_METADATA.paths.examplesRoot;
  return path === root || path.startsWith(`${root}/`);
}

/*** Return whether a portable path belongs to the CLI source root. */
function isCliPath(path: string): boolean {
  const root = DOCUMENTATION_RULE_METADATA.paths.cliRoot;
  return path === root || path.startsWith(`${root}/`);
}

/*** Validate one @see value without performing I/O. */
function isHttpsUrl(value: string | undefined): boolean {
  if (value === undefined || value.trim() === '') return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname.length > 0 &&
      url.username.length === 0 &&
      url.password.length === 0
    );
  } catch {
    return false;
  }
}
