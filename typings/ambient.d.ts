// -----------------------------------------------------------------------------
// TypeScript helpers

/** Fix this type, preferably before accepting the PR */
type $FixMe = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** This `any` is intentional => never has to be fixed */
type $IntentionalAny = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** TS cannot express the proper type atm */
type $Unexpressable = any; // eslint-disable-line @typescript-eslint/no-explicit-any

// GraphQL
declare module "*.graphql" {
  import { DocumentNode } from "graphql";
  const Schema: DocumentNode;

  export = Schema;
}
