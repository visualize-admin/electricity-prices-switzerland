import InflightRequests from "src/e2e/inflight";

import { expect, test, waitForDetailsPageContent } from "./common";

test.describe("Municipality comparison", () => {
  test("allows comparing with more than one municipality (regression #667)", async ({
    page,
  }) => {
    const inflight = new InflightRequests(page);
    await page.goto(
      "/en/municipality/1511?period=2024&priceComponent=total&category=H4&product=standard&municipality="
    );
    await waitForDetailsPageContent(page);
    await inflight.waitForRequests();

    const compareWith = page.locator("#municipalities");

    await compareWith.click();
    await compareWith.fill("Bern");
    await page.getByRole("option", { name: "Bern", exact: true }).click();
    await inflight.waitForRequests();

    await compareWith.click();
    await compareWith.fill("Kilchberg");
    await page.getByRole("option", { name: "Kilchberg (ZH)" }).click();
    await inflight.waitForRequests();

    await expect(
      page.getByText("2024, Energie Wasser Bern, Bern").first()
    ).toBeVisible();
    await expect(
      page
        .getByText(
          "2024, Elektrizitätswerke des Kantons Zürich (EKZ), Kilchberg (ZH)"
        )
        .first()
    ).toBeVisible();

    inflight.dispose();
  });
});
