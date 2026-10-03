# @ankhorage/rules-documentation

## 0.3.4

### Patch Changes

- 76e0392: Restore `@performance` as canonical documentation metadata, including bare markers and optional inline notes.

## 0.3.3

### Patch Changes

- 194c92d: Preserve exact required-tag cardinality for README-promoted documentation and reject credentialed
  or hostless HTTPS values as @see syntax errors.

## 0.3.2

### Patch Changes

- a6e16d3: Preserve configuration documentation opt-in when the canonical src/types/config.ts file exists,
  even before an @config tag is added.

## 0.3.1

### Patch Changes

- da6d048: Preserve canonical config-root semantics by requiring @config README roots to be type or interface
  declarations in the canonical config schema.

## 0.3.0

### Minor Changes

- 898d5b0: Preserve optional source line evidence on documentation facts and propagate it to generic Rules
  finding source locations.

## 0.2.0

### Minor Changes

- cf637ca: Expose the complete canonical documentation metadata required by fact collectors and renderers,
  including usage, config, comment, @see, and @security contracts.

## 0.1.0

### Minor Changes

- 62c5b9f: Publish the documentation rules provider with canonical metadata, portable facts, and generic Rules
  evaluation for documentation compliance.

## 0.0.0

Initial repository bootstrap.
