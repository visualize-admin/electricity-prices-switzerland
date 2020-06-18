import { ColumnFields } from "../domain/config-types";

export const observations = [
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4":
      "Steuerhoheit - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3":
      "Grössenklasse - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0": 713,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0": "2015",
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4":
      "Steuerhoheit - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3":
      "Grössenklasse - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0": 693,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0": "2016",
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4":
      "Steuerhoheit - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3":
      "Grössenklasse - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0": 683,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0": "2017",
  },
  {
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/4":
      "Steuerhoheit - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/1":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/3":
      "Grössenklasse - Total",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/2":
      "Schweiz",
    "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0": 672,
    "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0": "2018",
  },
];

export const fields: ColumnFields = {
  x: {
    componentIri:
      "http://environment.ld.admin.ch/foen/px/0703010000_105/dimension/0",
    sorting: { sortingType: "byDimensionLabel", sortingOrder: "asc" },
  },
  y: {
    componentIri:
      "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0",
  },
};

export const measures = [
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/0",
    label: "Anzahl Betriebe",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/1",
    label: "Anzahl Waldeigentümer",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/2",
    label: "Gesamte Waldflächen (ha)",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/3",
    label: "Produktive Waldflächen (ha)",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/4",
    label: "Holzernte Total (m3)",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/5",
    label: "Stammholz (m3)",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/6",
    label: "Industrieholz (m3)",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/7",
    label: "Energieholz (m3)",
    __typename: "Measure",
  },
  {
    iri: "http://environment.ld.admin.ch/foen/px/0703010000_105/measure/8",
    label: "Übrige Sortimente (m3)",
    __typename: "Measure",
  },
];
