# Claude Code Notes

## GraphQL

After changing GraphQL queries or mutations in the codebase, run:

```bash
yarn graphql:codegen
```

This regenerates TypeScript types in `src/graphql/queries.ts` and `src/graphql/resolver-types.ts`.

## Documentation Writing Principles

When writing or updating documentation:

- **Be neutral and factual** - Avoid "you/your", use third-person or passive voice
- **Reference, don't duplicate** - Point to source files instead of copying code to prevent documentation rot
- **Lead with value** - Explain what and why before how, emphasize practical outcomes
- **Keep technical details minimal** - Assume developers can read source code; focus on concepts and usage
- **Audience: PM + Developer** - Balance clarity for non-technical readers with enough detail for engineers
- **Structure: value → usage → reference** - What it does, how to use it, where to find details
