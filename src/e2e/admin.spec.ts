import { test } from "./common";

test.describe("Admin Interface", () => {
  test("should load admin login page", async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForSelector("text=Admin Login");
  });

  test("should login successfully with correct credentials", async ({
    page,
    adminLogin,
  }) => {
    await adminLogin(page);
  });

  test("should be asked to login on /admin/session-config", async ({
    page,
  }) => {
    await page.goto("/admin/session-config");

    // seek for redirect to login
    await page.getByRole("heading", { name: "Admin Login" }).click();
  });

  test("should be able to logout from session config page", async ({
    page,
    adminLogin,
  }) => {
    // Login first
    await adminLogin(page);

    // Now logout
    await page.getByRole("button", { name: "Logout" }).click();

    // Should be back at login page
    await page.getByRole("heading", { name: "Admin Login" }).click();

    // Verify that accessing session-config redirects to login again
    await page.goto("/admin/session-config");
    await page.getByRole("heading", { name: "Admin Login" }).click();
  });

  test("should fail login with incorrect credentials", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByRole("textbox", { name: "Password" }).click();
    await page
      .getByRole("textbox", { name: "Password" })
      .fill("wrong-password");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForSelector("text=Invalid password. Please try again.");
  });

  test("should update SPARQL endpoint flag successfully", async ({
    page,
    adminLogin,
  }) => {
    // Login first
    await adminLogin(page);
    await page.getByRole("textbox").click();
    await page.getByRole("textbox").fill("https://int.lindas.admin.ch/query");
    await page.getByRole("button", { name: "Update Flags" }).click();
    await page.getByText("Flags updated successfully.").click();
    await page.goto("/map");
    await page
      .getByText("SPARQL Endpoint: https://int.lindas.admin.ch/query")
      .click();
    await page.getByRole("link", { name: "Configure" }).click();
    await page.getByRole("heading", { name: "Session Config Flags" }).click();
  });

  test("should not see metrics page if not logged in", async ({ page }) => {
    await page.goto("/admin/metrics");
    await page.getByRole("heading", { name: "Admin Login" }).click();
  });

  test("should see metric page if logged in", async ({ page, adminLogin }) => {
    // Login first
    await adminLogin(page);
    await page.goto("/admin/metrics");
    await page
      .getByRole("heading", { name: "GraphQL Metrics Dashboard" })
      .click();
  });
});
