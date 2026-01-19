# GraphQL Server-Side Queries Pattern

## Purpose

This document describes the pattern for fetching GraphQL data in `getServerSideProps` using the `executeGraphqlQuery` helper. This executes queries directly against the Apollo Server instance, ensuring consistency between server-side rendering (SSR) and client-side queries by using the same GraphQL documents and types.

## How-To Guide

### Basic Pattern

Use `executeGraphqlQuery` in `getServerSideProps` to fetch data:

```typescript
import { MyQueryDocument, MyQueryQuery } from "src/graphql/queries";
import createGetServerSideProps from "src/utils/create-server-side-props";

export const getServerSideProps = createGetServerSideProps<Props, PageParams>(
  async (context, { executeGraphqlQuery, sessionConfig }) => {
    const { params } = context;
    const { id } = params!;

    const data = await executeGraphqlQuery<MyQueryQuery>(MyQueryDocument, {
      filter: {
        operatorId: parseInt(id, 10),
      },
    });

    if (!data.myQuery) {
      throw new Error("Failed to fetch data");
    }

    return {
      props: {
        myData: data.myQuery,
        sessionConfig,
      },
    };
  }
);
```

### Parallel Queries

For pages that need multiple datasets, use `Promise.all`:

```typescript
const [dataA, dataB, dataC] = await Promise.all([
  executeGraphqlQuery<QueryAQuery>(QueryADocument, { filter: { ... } }),
  executeGraphqlQuery<QueryBQuery>(QueryBDocument, { filter: { ... } }),
  executeGraphqlQuery<QueryCQuery>(QueryCDocument, { filter: { ... } }),
]);

// Check all results for required data
if (!dataA.queryA) {
  throw new Error("Failed to fetch A");
}
// ... validate other results

return {
  props: {
    dataA: dataA.queryA,
    dataB: dataB.queryB,
    dataC: dataC.queryC,
  },
};
```

### Adding a New Query

1. **Define the filter type in schema** (`src/graphql/schema.graphql`):

```graphql
input MyNewFilter {
  operatorId: Int!
  period: Int # Optional parameters use nullable types
  someRequired: String!
}
```

2. **Add the query to schema**:

```graphql
type Query {
  myNewQuery(filter: MyNewFilter!): MyDataType!
}
```

3. **Add the resolver** (`src/graphql/resolvers.ts`):

```typescript
myNewQuery: async (_, { filter }, context) => {
  return await fetchMyData(context.sunshineDataService, {
    operatorId: filter.operatorId.toString(),
    period: filter.period ?? undefined,
  });
},
```

4. **Add the query document** (`src/graphql/queries.graphql`):

```graphql
query MyNewQuery($filter: MyNewFilter!) {
  myNewQuery(filter: $filter) {
    field1
    field2
    nested {
      nestedField
    }
  }
}
```

5. **Run codegen**:

```bash
yarn graphql:codegen
```

6. **Use in getServerSideProps**:

```typescript
import { MyNewQueryDocument, MyNewQueryQuery } from "src/graphql/queries";

const data = await executeGraphqlQuery<MyNewQueryQuery>(MyNewQueryDocument, {
  filter: { operatorId, someRequired: "value" },
});
```

### Query Parameter Validation

For pages with URL query parameters, use Zod schemas from `src/domain/sunshine.ts`:

```typescript
import { networkLevelSchema, categorySchema } from "src/domain/sunshine";

export const getServerSideProps = createGetServerSideProps<Props, PageParams>(
  async (context, { executeGraphqlQuery, sessionConfig }) => {
    const { query } = context;

    // Parse and validate with defaults
    const networkLevel = networkLevelSchema.parse(query.networkLevel);
    const category = categorySchema.parse(query.category);

    const data = await executeGraphqlQuery<MyQuery>(MyDocument, {
      filter: { networkLevel, category },
    });

    return {
      props: {
        data: data.myQuery,
        initialNetworkLevel: networkLevel, // Pass to client for comparison
        initialCategory: category,
      },
    };
  }
);
```

### Dynamic Client-Side Queries with Server-Side Initial Data

For pages with user-controlled filters (dropdowns, tabs), use server-side props as initial data and conditionally fetch on the client when parameters change.

**Props structure** - include both data and initial parameter values:

```typescript
type Props = {
  serverData: MyDataType;
  initialCategory: string;
  initialNetworkLevel: string;
};
```

**Component pattern** - compare current state with initial values:

```typescript
const MyPage = (props: Props) => {
  const { serverData, initialCategory, initialNetworkLevel } = props;

  // User-controlled state
  const [category, setCategory] = useState(initialCategory);
  const [networkLevel, setNetworkLevel] = useState(initialNetworkLevel);

  // Only fetch client-side when parameters differ from server-rendered values
  const needsClientFetch =
    category !== initialCategory || networkLevel !== initialNetworkLevel;

  const [{ data: clientData, fetching }] = useMyQuery({
    variables: {
      filter: { category, networkLevel },
    },
    pause: !needsClientFetch, // Skip query if using server data
  });

  // Use client data if fetched, otherwise fall back to server data
  const data = needsClientFetch ? clientData?.myQuery : serverData;

  // Show loading state only during client-side fetches
  if (needsClientFetch && fetching) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      <FilterControls
        category={category}
        onCategoryChange={setCategory}
        networkLevel={networkLevel}
        onNetworkLevelChange={setNetworkLevel}
      />
      <DataDisplay data={data} />
    </>
  );
};
```

**Key points**:

- Server renders with default/URL parameters for fast initial load
- `pause: true` prevents unnecessary client queries on initial render
- Client fetches only when user changes filters
- Seamless transition between server and client data

---

## Rationale

### Why executeGraphqlQuery in getServerSideProps?

**Direct Execution**: Queries execute directly against the Apollo Server instance without HTTP overhead. This provides:

- No network round-trip (in-process execution)
- Simpler code without HTTP client configuration
- Direct access to Apollo Server's response format

**Consistency**: Server-side and client-side queries use identical GraphQL documents. This eliminates:

- Duplicate type definitions between fetcher functions and GraphQL types
- Risk of server/client data shape mismatches
- Maintenance burden of keeping two data-fetching approaches in sync

**Type Safety**: Generated types from `yarn graphql:codegen` provide end-to-end type safety:

- `MyQueryDocument` contains the exact query structure
- `MyQueryQuery` types the response data
- Filter types are validated at compile time

### Why Not Call Fetcher Functions Directly?

Previous approach:

```typescript
// Direct fetcher call - works but creates inconsistency
const data = await fetchMyData(sunshineDataService, { operatorId });
```

Problems with direct fetcher calls:

1. **Type Drift**: Fetcher return types can diverge from GraphQL schema types
2. **No Query Reuse**: Client-side queries define their own documents, duplicating field selections
3. **Hidden Dependencies**: Fetchers may have different parameter handling than GraphQL filters

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Page Component                          │
├─────────────────────────────────────────────────────────────┤
│  getServerSideProps        │  Client-side hooks            │
│  ─────────────────         │  ─────────────────            │
│  executeGraphqlQuery()     │  useMyQuery()                 │
│       │                    │       │                       │
│       ▼                    │       ▼                       │
│  ┌─────────────────────────┴───────────────────────────┐   │
│  │              GraphQL Query Document                 │   │
│  │              (src/graphql/queries.graphql)          │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                               │
│                            ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Apollo Server                     │   │
│  │         (src/pages/api/graphql.ts - direct)         │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                               │
│                            ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   GraphQL Resolver                  │   │
│  │                (src/graphql/resolvers.ts)           │   │
│  └─────────────────────────┬───────────────────────────┘   │
│                            │                               │
│                            ▼                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Fetcher Functions                  │   │
│  │               (src/lib/sunshine-data.ts)            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Server-Side Direct Execution

The `executeGraphqlQuery` helper executes queries directly against the Apollo Server instance:

```typescript
// From src/utils/execute-graphql-query.ts
export const createExecuteGraphqlQuery =
  (apolloServer: ApolloServer<GraphqlRequestContext>) =>
  (graphqlContext: GraphqlRequestContext): ExecuteGraphqlQuery => {
    return async (query, variables) => {
      const response = await apolloServer.executeOperation(
        { query, variables },
        { contextValue: graphqlContext }
      );
      // ... error handling and data extraction
    };
  };
```

This means server-side queries:

- Execute directly in-process without HTTP overhead
- Run through the full Apollo Server pipeline, including all plugins and caching
- Benefit from Apollo Server's response caching and metrics plugins
- Use the proper GraphQL context created from the request

### When to Use Optional Filter Parameters

GraphQL filter parameters should be optional (`Int` not `Int!`) when:

- The fetcher function has default behavior (e.g., "use latest period")
- The parameter is only needed for specific use cases

Example: `period` is optional because fetchers default to the latest available year:

```graphql
input MyFilter {
  operatorId: Int! # Always required
  period: Int # Optional - defaults to latest year
  operatorOnly: Boolean # Optional - defaults to false (include peer group)
}
```

### Error Handling Strategy

The `executeGraphqlQuery` helper throws errors automatically for GraphQL errors or missing data. You only need to check for null/undefined data fields:

```typescript
const data = await executeGraphqlQuery<MyQuery>(MyDocument, { ... });

if (!data.myQuery) {
  throw new Error("Failed to fetch data");
}
```

This approach:

- The helper throws for GraphQL errors and network issues automatically
- You only validate business logic (e.g., checking if expected data exists)
- Provides clear error messages for debugging
- Lets Next.js handle the error page rendering
