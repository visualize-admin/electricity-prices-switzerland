// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PriceComponentsCard } from "src/components/detail-page/price-components-bars";
import { ObservationsWithAllPriceComponentsQuery } from "src/graphql/queries";
import { data as canton2 } from "src/mocks/graphql/canton-2/ObservationsWithAllPriceComponents";
import { data as operator31Standard } from "src/mocks/graphql/operator-31-standard/ObservationsWithAllPriceComponents";
import { data as operator31Vs814Dynamic } from "src/mocks/graphql/operator-31-vs-814-dynamic/ObservationsWithAllPriceComponents";
import { theme } from "src/themes/elcom";

// @lingui/macro requires Babel transform; mock it to return message defaults
vi.mock("@lingui/macro", () => ({
  t: (d: { message?: string } | string) =>
    typeof d === "string" ? d : d.message ?? "",
  defineMessage: (d: object) => d,
  msg: (d: object) => d,
  Trans: ({ message, children }: { message?: string; children?: unknown }) =>
    message ?? children ?? null,
}));

vi.mock("@lingui/react", () => ({
  useLingui: () => ({
    i18n: {
      _: (d: { message?: string; id?: string } | string) =>
        typeof d === "string" ? d : d.message ?? d.id ?? "",
    },
  }),
}));

// Header buttons fetch their own content, they are not under test
vi.mock("src/components/info-dialog", () => ({
  InfoDialogButton: () => null,
}));
vi.mock("src/components/detail-page/download-image", () => ({
  DownloadImage: () => null,
}));

// jsdom has no layout: report a width, the charts render nothing without one
vi.stubGlobal(
  "ResizeObserver",
  class {
    constructor(private callback: ResizeObserverCallback) {}
    observe() {
      this.callback(
        [
          {
            contentBoxSize: [{ inlineSize: 800, blockSize: 400 }],
          } as unknown as ResizeObserverEntry,
        ],
        this as unknown as ResizeObserver
      );
    }
    disconnect() {}
  }
);

const renderCard = ({
  entity,
  id,
  data,
  operator,
}: {
  entity: "operator" | "canton";
  id: string;
  data: ObservationsWithAllPriceComponentsQuery;
  operator?: string[];
}) =>
  render(
    <ThemeProvider theme={theme}>
      <PriceComponentsCard
        id={id}
        entity={entity}
        data={data}
        fetching={false}
        period={["2027"]}
        category={["H3"]}
        product={["cheapest"]}
        operator={operator}
        view={["collapsed"]}
        download={undefined}
        setView={() => {}}
      />
    </ThemeProvider>
  );

const AIL = "Aziende Industriali di Lugano (AIL) SA";

afterEach(cleanup);

describe("PriceComponentsCard", () => {
  it("names compared operators without prices in a warning, not in the legend", () => {
    renderCard({
      entity: "operator",
      id: "31",
      operator: ["814"],
      data: operator31Vs814Dynamic,
    });

    const warning = screen.getByText(
      "We have no prices for the following operators:"
    ).parentElement!;
    expect(within(warning).getByText("EKT Energie AG")).toBeTruthy();
    expect(screen.getAllByText("EKT Energie AG")).toHaveLength(1);
    expect(screen.queryByText("814")).toBeNull();
    expect(screen.getByText(AIL)).toBeTruthy();
  });

  it("shows no warning when every operator has prices", () => {
    renderCard({ entity: "operator", id: "31", data: operator31Standard });

    expect(
      screen.queryByText("We have no prices for the following operators:")
    ).toBeNull();
  });

  it("shows the dynamic tariff range on grid usage, with a hint", () => {
    renderCard({
      entity: "operator",
      id: "31",
      operator: ["814"],
      data: operator31Vs814Dynamic,
    });

    expect(
      screen.getByText("Prices shown with values in brackets are dynamic.")
    ).toBeTruthy();
    expect(screen.getByText(/\(1\.10 - 11\.80, dynamic\)/)).toBeTruthy();
  });

  it("shows no dynamic hint without rates", () => {
    renderCard({ entity: "operator", id: "31", data: operator31Standard });

    expect(
      screen.queryByText("Prices shown with values in brackets are dynamic.")
    ).toBeNull();
    expect(screen.queryByText(/dynamic\)/)).toBeNull();
  });

  it("leaves out price components without values", () => {
    renderCard({ entity: "canton", id: "2", data: canton2 });

    expect(screen.getByText("Grid usage")).toBeTruthy();
    expect(screen.queryByText("Metering Rate")).toBeNull();
    expect(screen.queryByText(/undefined/)).toBeNull();
  });
});
