import { describe, expect, it } from "vitest";

import { assertBaseDomainOK } from "./domain";

const errorText = "Bad baseDomain, baseDomain should end with elcom.admin.ch";

describe("assertBaseDomainOK", () => {
  describe("valid domains", () => {
    it("should allow localhost", () => {
      expect(() => assertBaseDomainOK("http://localhost")).not.toThrow();
      expect(() => assertBaseDomainOK("https://localhost")).not.toThrow();
      expect(() => assertBaseDomainOK("http://localhost:3000")).not.toThrow();
      expect(() => assertBaseDomainOK("https://localhost:8080")).not.toThrow();
      expect(assertBaseDomainOK("http://localhost")).toBe(true);
    });

    it("should allow exact elcom.admin.ch domain", () => {
      expect(() => assertBaseDomainOK("https://elcom.admin.ch")).not.toThrow();
      expect(() => assertBaseDomainOK("http://elcom.admin.ch")).not.toThrow();
      expect(assertBaseDomainOK("https://elcom.admin.ch")).toBe(true);
    });

    it("should allow subdomains of elcom.admin.ch", () => {
      expect(() =>
        assertBaseDomainOK("https://www.elcom.admin.ch")
      ).not.toThrow();
      expect(() =>
        assertBaseDomainOK("https://api.elcom.admin.ch")
      ).not.toThrow();
      expect(() =>
        assertBaseDomainOK("https://test.elcom.admin.ch")
      ).not.toThrow();
      expect(assertBaseDomainOK("https://www.elcom.admin.ch")).toBe(true);
    });

    it("should allow vercel deployment domains", () => {
      expect(() =>
        assertBaseDomainOK(
          "https://elcom-electricity-price-website-abc123.vercel.app"
        )
      ).not.toThrow();
      expect(() =>
        assertBaseDomainOK(
          "https://elcom-electricity-price-website-test-branch.vercel.app"
        )
      ).not.toThrow();
      expect(() =>
        assertBaseDomainOK(
          "https://elcom-electricity-price-website-feature-xyz.vercel.app"
        )
      ).not.toThrow();
      expect(
        assertBaseDomainOK(
          "https://elcom-electricity-price-website-main.vercel.app"
        )
      ).toBe(true);
    });
  });

  describe("invalid domains", () => {
    it("should reject random domains", () => {
      expect(() => assertBaseDomainOK("https://example.com")).toThrow(
        errorText
      );
      expect(() => assertBaseDomainOK("https://google.com")).toThrow(errorText);
      expect(() => assertBaseDomainOK("https://malicious-site.com")).toThrow(
        errorText
      );
    });

    it("should reject domains that don't match elcom pattern", () => {
      expect(() =>
        assertBaseDomainOK("https://fake-elcom.admin.ch.evil.com")
      ).toThrow(errorText);
      expect(() =>
        assertBaseDomainOK("https://elcom.admin.ch.evil.com")
      ).toThrow(errorText);
    });

    it("should reject invalid vercel domains", () => {
      expect(() =>
        assertBaseDomainOK("https://wrong-prefix.vercel.app")
      ).toThrow(errorText);
      expect(() =>
        assertBaseDomainOK("https://elcom-electricity-price-website.vercel.app")
      ).toThrow(errorText); // Missing hyphen and suffix
      expect(() =>
        assertBaseDomainOK(
          "https://elcom-electricity-price-website-.vercel.app"
        )
      ).toThrow(errorText); // Empty suffix
    });

    it("should reject domains similar to localhost", () => {
      expect(() => assertBaseDomainOK("https://localhost.evil.com")).toThrow(
        errorText
      );
      expect(() => assertBaseDomainOK("https://fake-localhost.com")).toThrow(
        errorText
      );
    });
  });

  describe("edge cases", () => {
    it("should handle different protocols", () => {
      expect(() => assertBaseDomainOK("http://localhost")).not.toThrow();
      expect(() => assertBaseDomainOK("https://localhost")).not.toThrow();
      expect(() => assertBaseDomainOK("http://elcom.admin.ch")).not.toThrow();
      expect(() => assertBaseDomainOK("https://elcom.admin.ch")).not.toThrow();
    });

    it("should handle ports correctly", () => {
      expect(() => assertBaseDomainOK("http://localhost:3000")).not.toThrow();
      expect(() => assertBaseDomainOK("https://localhost:8080")).not.toThrow();
      expect(() =>
        assertBaseDomainOK("https://elcom.admin.ch:443")
      ).not.toThrow();
    });

    it("should be case insensitive for elcom.admin.ch", () => {
      expect(() => assertBaseDomainOK("https://ELCOM.ADMIN.CH")).not.toThrow();
      expect(() => assertBaseDomainOK("https://Elcom.Admin.Ch")).not.toThrow();
    });

    it("should throw for invalid URLs", () => {
      expect(() => assertBaseDomainOK("not-a-url")).toThrow();
      expect(() => assertBaseDomainOK("")).toThrow();
      expect(() => assertBaseDomainOK("://invalid")).toThrow();
    });
  });
});
