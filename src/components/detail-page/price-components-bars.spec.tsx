// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PriceComponentsCard } from "src/components/detail-page/price-components-bars";
import { ObservationsWithAllPriceComponentsQuery } from "src/graphql/queries";

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

type Data = ObservationsWithAllPriceComponentsQuery;
type OperatorObservation = NonNullable<Data["observations"]>[number];
type CantonObservation = NonNullable<Data["cantonMedianObservations"]>[number];

const operatorObservation = (
  overrides: Partial<OperatorObservation> = {}
): OperatorObservation => ({
  __typename: "OperatorObservation",
  period: "2027",
  municipality: "5192",
  municipalityLabel: "Lugano",
  operator: "31",
  operatorLabel: "AIL",
  category: "H3",
  aidfee: 2.3,
  meteringrate: 1.41,
  charge: 2.22,
  gridusage: 9.24,
  energy: 9.12,
  total: 24.29,
  lowestrate: null,
  highestrate: null,
  ...overrides,
});

const cantonObservation: CantonObservation = {
  __typename: "CantonMedianObservation",
  period: "2027",
  canton: "2",
  cantonLabel: "Bern",
  category: "H3",
  aidfee: 2.3,
  charge: 1.5,
  gridusage: 11.91,
  energy: 6.97,
  total: 24.59,
};

const renderCard = ({
  entity,
  id,
  data,
  operator,
}: {
  entity: "operator" | "canton";
  id: string;
  data: Partial<Data>;
  operator?: string[];
}) =>
  render(
    <PriceComponentsCard
      id={id}
      entity={entity}
      data={{
        __typename: "Query",
        operators: [],
        observations: [],
        cantonMedianObservations: [],
        ...data,
      }}
      fetching={false}
      period={["2027"]}
      category={["H3"]}
      product={["cheapest"]}
      operator={operator}
      view={["collapsed"]}
      download={undefined}
      setView={() => {}}
    />
  );

afterEach(cleanup);

describe("PriceComponentsCard", () => {
  it("names compared operators without prices in a warning, not in the legend", () => {
    renderCard({
      entity: "operator",
      id: "31",
      operator: ["814"],
      data: {
        operators: [
          { __typename: "OperatorResult", id: "31", name: "AIL" },
          { __typename: "OperatorResult", id: "814", name: "EKT Energie AG" },
        ],
        observations: [operatorObservation()],
      },
    });

    const warning = screen.getByText(
      "We have no prices for the following operators:"
    ).parentElement!;
    expect(within(warning).getByText("EKT Energie AG")).toBeTruthy();
    expect(screen.getAllByText("EKT Energie AG")).toHaveLength(1);
    expect(screen.queryByText("814")).toBeNull();
    expect(screen.getByText("AIL")).toBeTruthy();
  });

  it("shows no warning when every operator has prices", () => {
    renderCard({
      entity: "operator",
      id: "31",
      data: {
        operators: [{ __typename: "OperatorResult", id: "31", name: "AIL" }],
        observations: [operatorObservation()],
      },
    });

    expect(
      screen.queryByText("We have no prices for the following operators:")
    ).toBeNull();
  });

  it("shows the dynamic tariff range on grid usage, with a hint", () => {
    renderCard({
      entity: "operator",
      id: "31",
      data: {
        observations: [
          operatorObservation({ lowestrate: 1.1, highestrate: 11.8 }),
        ],
      },
    });

    expect(
      screen.getByText("Prices shown with values in brackets are dynamic.")
    ).toBeTruthy();
    expect(screen.getByText(/\(1\.10 - 11\.80, dynamic\)/)).toBeTruthy();
  });

  it("shows no dynamic hint without rates", () => {
    renderCard({
      entity: "operator",
      id: "31",
      data: { observations: [operatorObservation()] },
    });

    expect(
      screen.queryByText("Prices shown with values in brackets are dynamic.")
    ).toBeNull();
    expect(screen.queryByText(/dynamic\)/)).toBeNull();
  });

  it("leaves out price components without values", () => {
    renderCard({
      entity: "canton",
      id: "2",
      data: { cantonMedianObservations: [cantonObservation] },
    });

    expect(screen.getByText("Grid usage")).toBeTruthy();
    expect(screen.queryByText("Metering Rate")).toBeNull();
    expect(screen.queryByText(/undefined/)).toBeNull();
  });
});
