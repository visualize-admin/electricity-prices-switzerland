import urql from "urql";
import { MunicipalitiesDocument } from "../../src/graphql/queries";

describe("GraphQL API", () => {
  it("Does something", () => {
    expect(true).to.equal(true);
  });

  it("Matches test snapshot", () => {
    cy.wrap({ hello: "world" }).toMatchSnapshot();
  });
});
