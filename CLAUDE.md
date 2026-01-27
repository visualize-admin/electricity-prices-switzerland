# Claude Code Notes

## GraphQL

After changing GraphQL queries or mutations in the codebase, run:

```bash
pnpm graphql:codegen
```

This regenerates TypeScript types in `src/graphql/queries.ts` and `src/graphql/resolver-types.ts`.

## Refactoring Principles

When refactoring code:

- **Colocate related code** - Group all related functionality in a single folder. Don't scatter domain logic across multiple directories.
- **Deduplicate types** - Define types once in a central location. Delete duplicated type definitions.
- **Delete unused code** - Remove unused functions, types, interfaces, and imports. No dead code.
- **Descriptive naming** - Use specific, domain-appropriate names. `playwright-reporter.ts` not `metrics-reporter.ts`, `apollo-sentry-plugin.ts` not `sentry-metrics-plugin.ts`.

## Documentation Writing Principles

When writing or updating documentation:

- **Be neutral and factual** - Avoid "you/your", use third-person or passive voice
- **Reference, don't duplicate** - Point to source files instead of copying code to prevent documentation rot
- **Lead with value** - Explain what and why before how, emphasize practical outcomes
- **Keep technical details minimal** - Assume developers can read source code; focus on concepts and usage
- **Audience: PM + Developer** - Balance clarity for non-technical readers with enough detail for engineers
- **Structure: value → usage → reference** - What it does, how to use it, where to find details
