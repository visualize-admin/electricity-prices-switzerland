import { describe, expect, it } from "vitest";

import { filterBySeparator } from "./helpers";

describe("filterBySeparator", () => {
  it("should return [separator] if arr is empty", () => {
    expect(filterBySeparator([], [], "|")).toEqual(["|"]);
  });

  it("should return [separator] if prev does not have separator and arr has separator", () => {
    expect(filterBySeparator(["|"], [], "|")).toEqual(["|"]);
  });

  it("should return arr unchanged if prev has separator", () => {
    expect(filterBySeparator(["a", "b"], ["|"], "|")).toEqual(["a", "b"]);
  });

  it("should return arr unchanged if arr does not contain separator", () => {
    expect(filterBySeparator(["a", "b"], [], "|")).toEqual(["a", "b"]);
  });

  it("should return arr with separator if arr is empty and prev has separator", () => {
    expect(filterBySeparator([], ["|"], "|")).toEqual(["|"]);
  });
});
