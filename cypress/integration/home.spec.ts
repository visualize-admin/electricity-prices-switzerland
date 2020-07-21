describe("The Home Page", () => {
  it("should redirect to /de", () => {
    cy.request({ url: "http://localhost:3000", followRedirect: false }).should(
      (response) => {
        expect(response.status).to.equal(302);
        expect(response.headers.location).to.equal("/de");
      }
    );
  });

  it("successfully loads", () => {
    cy.visit("http://localhost:3000/");
  });
});
