# Refactoring Principles

- Colocate related code: Group all related functionality in a single folder. Don't scatter domain logic across multiple directories.
- Deduplicate types: Define types once in a central location. Delete duplicated type definitions.
- Delete unused code: Remove unused functions, types, interfaces, and imports. No dead code.
- Descriptive naming: Use specific, domain-appropriate names. `playwright-reporter.ts` not `metrics-reporter.ts`, `apollo-sentry-plugin.ts` not `sentry-metrics-plugin.ts`.
