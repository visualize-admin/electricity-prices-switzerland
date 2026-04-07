import { describe, expect, it } from "vitest";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

const makeHeaders = async () => ({
  ...(process.env.BASIC_AUTH_CREDENTIALS
    ? {
        authorization: `Basic ${Buffer.from(
          `${process.env.BASIC_AUTH_CREDENTIALS}`,
        ).toString("base64")}`,
      }
    : {}),
});

describe("Data Export API", () => {
  const endpoints = [
    { name: "data-export", path: "/api/data-export" },
    { name: "sunshine-data-export", path: "/api/sunshine-data-export" },
  ];

  it.each(endpoints)("should return valid CSV for $name", async ({
    name,
    path,
  }) => {
    const headers = await makeHeaders();
    const response = await fetch(`${API_BASE_URL}${path}`, { headers });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");

    const text = await response.text();
    const firstLines = text.split("\n").slice(0, 10).join("\n");

    expect(firstLines).toMatchSnapshot(`csv-download-${name}`);
  });
});
