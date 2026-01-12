# Claude Code Notes

## GraphQL

After changing GraphQL queries or mutations in the codebase, run:

```bash
yarn graphql:codegen
```

This regenerates TypeScript types in `src/graphql/queries.ts` and `src/graphql/resolver-types.ts`.
