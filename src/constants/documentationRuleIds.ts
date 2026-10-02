/*** Stable documentation rule identities preserved across provider migration. */
export const DOCUMENTATION_RULE_IDS = {
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
