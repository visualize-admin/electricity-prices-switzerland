# GraphQL mocks for unit tests

Component tests render with real GraphQL responses, recorded from a page of the
running app.

```sh
pnpm mocks:graphql "<page url>" --name <scenario> [--operation <OperationName>]
```

The command opens the page in a headless browser, collects the `/api/graphql`
responses and writes one module per operation to
`src/mocks/graphql/<scenario>/<OperationName>.ts`. Each module exports:

- `variables`: what the page asked for, for reference.
- `data`: the response, typed with the generated query type. After a schema
  change, `tsc` points at the mocks to re-record.

`--operation` keeps only that operation (repeatable). Without it, every
operation of the page is recorded. Queries answered by the server-side render
are not refetched by the browser, so they are not recorded; the command warns
when there are some.

Hosts behind basic auth use `BASIC_CREDENTIALS_PER_HOST`, like the e2e tests.

## Example

`price-components-bars.spec.tsx` and `price-components-bars.stories.tsx` in `src/components/detail-page/` use:

```sh
pnpm mocks:graphql "http://localhost:3000/operator/31?period=2027&category=H3&product=cheapest&operator=814" \
  --name operator-31-vs-814-dynamic --operation ObservationsWithAllPriceComponents
pnpm mocks:graphql "http://localhost:3000/operator/31?period=2027&category=H4&product=standard" \
  --name operator-31-standard --operation ObservationsWithAllPriceComponents
pnpm mocks:graphql "http://localhost:3000/canton/2?period=2027&category=H3&product=cheapest" \
  --name canton-2 --operation ObservationsWithAllPriceComponents
```

To make a component testable this way, split it into a container that runs the
query and a component that takes the `data` as props, like
`PriceComponentsBarChart` and `PriceComponentsCard`.
