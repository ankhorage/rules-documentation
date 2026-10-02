import type { JsonValue, Rule, RuleFinding, RuleSet } from '@ankhorage/rules';

import { DOCUMENTATION_RULE_METADATA } from '../../../constants/documentation.js';
import type {
  DocumentationCommentFact,
  DocumentationRuleContext,
  DocumentationTagFact,
} from '../../../types/documentation.js';

const RULE_IDS = {
  codeBlock: 'documentation.comment.code-block',
  configFile: 'documentation.config.file',
  configLocation: 'documentation.config.location',
  configReadmeMetadata: 'documentation.config.readme.metadata',
  configReadmeUnique: 'documentation.config.readme.unique',
  publicFunctionDescription: 'documentation.public-function.description',
  securityReference: 'documentation.security.reference',
  seeReachable: 'documentation.see.reachable',
  seeValue: 'documentation.see.value',
  unsupportedTag: 'documentation.comment.tag.unsupported',
  usageLocation: 'documentation.usage.location',
  usageReadmeCli: 'documentation.usage.readme.cli',
  usageReadmeMetadata: 'documentation.usage.readme.metadata',
  usageReadmeUnique: 'documentation.usage.readme.unique',
} as const;

/*** Create the canonical documentation RuleSet without parser, filesystem, or network coupling. */
export function createDocumentationRuleSet(): RuleSet<DocumentationRuleContext> {
  return {
    id: 'documentation',
    rules: [
      unsupportedTagRule(),
      codeBlockRule(),
      usageLocationRule(),
      usageReadmeUniqueRule(),
      usageReadmeCliRule(),
      usageReadmeMetadataRule(),
      configFileRule(),
      configLocationRule(),
      configReadmeUniqueRule(),
      configReadmeMetadataRule(),
      seeValueRule(),
      seeReachableRule(),
      securityReferenceRule(),
      publicFunctionDescriptionRule(),
    ],
  };
}

/*** Reject tag-shaped metadata outside the canonical vocabulary. */
function unsupportedTagRule(): Rule<DocumentationRuleContext> {
  const supported = new Set<string>(DOCUMENTATION_RULE_METADATA.tags.map(({ name }) => name));
  return createRule(
    RULE_IDS.unsupportedTag,
    'Tag-shaped documentation metadata must use a supported tag.',
    ({ comments }) =>
      comments.flatMap((comment) =>
        comment.tags.flatMap((tag) =>
          supported.has(tag.name)
            ? []
            : [
                finding(
                  RULE_IDS.unsupportedTag,
                  `Unsupported documentation tag @${tag.name}.`,
                  comment.path,
                  { tag: tag.name },
                ),
              ],
        ),
      ),
  );
}

/*** Reject source code blocks inside documentation comments. */
function codeBlockRule(): Rule<DocumentationRuleContext> {
  return createRule(
    RULE_IDS.codeBlock,
    'Documentation comments must not contain source code blocks.',
    ({ comments }) =>
      comments.flatMap((comment) =>
        comment.hasCodeBlock
          ? [
              finding(
                RULE_IDS.codeBlock,
                'Documentation comments must reference real source examples instead of embedding code blocks.',
                comment.path,
                {},
              ),
            ]
          : [],
      ),
  );
}

/*** Restrict @usage to real examples and CLI delivery sources. */
function usageLocationRule(): Rule<DocumentationRuleContext> {
  return createRule(
    RULE_IDS.usageLocation,
    '@usage is allowed only below examples/** or src/cli/**.',
    ({ comments }) =>
      comments.flatMap((comment) =>
        hasTag(comment, 'usage') && !isExamplePath(comment.path) && !isCliPath(comment.path)
          ? [
              finding(
                RULE_IDS.usageLocation,
                '@usage is allowed only below examples/** or src/cli/**.',
                comment.path,
                {},
              ),
            ]
          : [],
      ),
  );
}

/*** Require exactly one README-promoted example when programmatic usage is present. */
function usageReadmeUniqueRule(): Rule<DocumentationRuleContext> {
  return createRule(
    RULE_IDS.usageReadmeUnique,
    'Programmatic usage has exactly one README-promoted example.',
    ({ comments }) => {
      const usage = comments.filter(
        (comment) => isExamplePath(comment.path) && hasTag(comment, 'usage'),
      );
      if (usage.length === 0) return [];
      const promoted = usage.filter((comment) => hasTag(comment, 'readme'));
      return promoted.length === 1
        ? []
        : [
            finding(
              RULE_IDS.usageReadmeUnique,
              'Exactly one example with @usage must also declare @readme.',
              DOCUMENTATION_RULE_METADATA.paths.examplesRoot,
              { actual: promoted.length },
            ),
          ];
    },
  );
}

/*** Keep CLI usage out of the programmatic README promotion contract. */
function usageReadmeCliRule(): Rule<DocumentationRuleContext> {
  return createRule(
    RULE_IDS.usageReadmeCli,
    'CLI usage must not combine @usage and @readme.',
    ({ comments }) =>
      comments.flatMap((comment) =>
        isCliPath(comment.path) && hasTag(comment, 'usage') && hasTag(comment, 'readme')
          ? [
              finding(
                RULE_IDS.usageReadmeCli,
                '@usage and @readme must not be combined below src/cli/**.',
                comment.path,
                {},
              ),
            ]
          : [],
      ),
  );
}

/*** Require title and prose on the README-promoted usage entry. */
function usageReadmeMetadataRule(): Rule<DocumentationRuleContext> {
  return createRule(
    RULE_IDS.usageReadmeMetadata,
    'README-promoted usage requires @title and non-empty prose.',
    ({ comments }) =>
      comments.flatMap((comment) =>
        isExamplePath(comment.path) &&
        hasTag(comment, 'usage') &&
        hasTag(comment, 'readme') &&
        (!hasNonEmptyTagValue(comment, 'title') || comment.description.trim() === '')
          ? [
              finding(
                RULE_IDS.usageReadmeMetadata,
                'README-promoted usage requires @title and non-empty prose.',
                comment.path,
                {},
              ),
            ]
          : [],
      ),
  );
}

/*** Require the canonical config schema once configuration documentation is active. */
function configFileRule(): Rule<DocumentationRuleContext> {
  return createRule(
    RULE_IDS.configFile,
    'Configuration documentation uses src/types/config.ts.',
    ({ comments, files }) => {
      const active = comments.some((comment) => hasTag(comment, 'config'));
      return active && !files.includes(DOCUMENTATION_RULE_METADATA.paths.configSchema)
        ? [
            finding(
              RULE_IDS.configFile,
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
  return createRule(
    RULE_IDS.configLocation,
    '@config is allowed only in src/types/config.ts.',
    ({ comments }) =>
      comments.flatMap((comment) =>
        hasTag(comment, 'config') &&
        comment.path !== DOCUMENTATION_RULE_METADATA.paths.configSchema
          ? [
              finding(
                RULE_IDS.configLocation,
                '@config is allowed only in src/types/config.ts.',
                comment.path,
                {},
              ),
            ]
          : [],
      ),
  );
}

/*** Require one README-promoted configuration root when configuration docs are active. */
function configReadmeUniqueRule(): Rule<DocumentationRuleContext> {
  return createRule(
    RULE_IDS.configReadmeUnique,
    'Configuration documentation has one README root.',
    ({ comments }) => {
      const configs = comments.filter((comment) => hasTag(comment, 'config'));
      if (configs.length === 0) return [];
      const promoted = configs.filter(
        (comment) =>
          comment.path === DOCUMENTATION_RULE_METADATA.paths.configSchema &&
          hasTag(comment, 'readme'),
      );
      return promoted.length === 1
        ? []
        : [
            finding(
              RULE_IDS.configReadmeUnique,
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
  return createRule(
    RULE_IDS.configReadmeMetadata,
    'The README configuration root requires @title and non-empty prose.',
    ({ comments }) =>
      comments.flatMap((comment) =>
        comment.path === DOCUMENTATION_RULE_METADATA.paths.configSchema &&
        hasTag(comment, 'config') &&
        hasTag(comment, 'readme') &&
        (!hasNonEmptyTagValue(comment, 'title') || comment.description.trim() === '')
          ? [
              finding(
                RULE_IDS.configReadmeMetadata,
                'The README configuration root requires @title and non-empty prose.',
                comment.path,
                {},
              ),
            ]
          : [],
      ),
  );
}

/*** Require @see values to be non-empty HTTPS URLs before network evidence is considered. */
function seeValueRule(): Rule<DocumentationRuleContext> {
  return createRule(
    RULE_IDS.seeValue,
    '@see requires a non-empty public HTTPS URL.',
    ({ comments }) =>
      comments.flatMap((comment) =>
        tags(comment, 'see').flatMap((tag) =>
          isHttpsUrl(tag.value)
            ? []
            : [
                finding(
                  RULE_IDS.seeValue,
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
  return createRule(
    RULE_IDS.seeReachable,
    '@see URLs must resolve to reachable public HTTPS resources.',
    ({ comments, seeReferences }) =>
      comments.flatMap((comment) =>
        tags(comment, 'see').flatMap((tag) => {
          if (!isHttpsUrl(tag.value)) return [];
          const reference = seeReferences.find(
            (candidate) => candidate.path === comment.path && candidate.url === tag.value,
          );
          return reference?.reachable === true && reference.publicNetworkTarget
            ? []
            : [
                finding(
                  RULE_IDS.seeReachable,
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
  return createRule(
    RULE_IDS.securityReference,
    '@security references a colocated executable test.',
    ({ comments, securityReferences }) =>
      comments.flatMap((comment) =>
        tags(comment, 'security').flatMap((tag) => {
          const value = tag.value?.trim() ?? '';
          const reference = securityReferences.find(
            (candidate) => candidate.path === comment.path && candidate.reference === value,
          );
          return value !== '' &&
            reference?.colocatedTestExists === true &&
            reference.exactTestNameMatches
            ? []
            : [
                finding(
                  RULE_IDS.securityReference,
                  '@security must reference exactly one executable test colocated with the documented source.',
                  comment.path,
                  { reference: value },
                ),
              ];
        }),
      ),
  );
}

/*** Warn when a named public function has no documentation prose. */
function publicFunctionDescriptionRule(): Rule<DocumentationRuleContext> {
  return createRule(
    RULE_IDS.publicFunctionDescription,
    'Every exported function should have a non-empty documentation description.',
    ({ publicFunctions }) =>
      publicFunctions.flatMap((fn) =>
        fn.description.trim() === ''
          ? [
              finding(
                RULE_IDS.publicFunctionDescription,
                `Exported function ${fn.name} has no documentation description.`,
                fn.path,
                { name: fn.name },
                'warning',
              ),
            ]
          : [],
      ),
    'warning',
  );
}

/*** Build one deterministic provider rule with a fixed default severity. */
function createRule(
  id: string,
  summary: string,
  evaluate: (context: DocumentationRuleContext) => readonly RuleFinding[],
  defaultSeverity: 'error' | 'warning' = 'error',
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
  severity: 'error' | 'warning' = 'error',
): RuleFinding {
  return {
    ruleId,
    severity,
    message,
    subjects: [{ id: path, kind: 'documentation-source', path }],
    evidence,
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
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}
