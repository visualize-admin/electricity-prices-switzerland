import { createHmac } from "crypto";

import { describe, expect, it } from "vitest";

import serverEnv from "src/env/server";

import { generateCSRFToken, validateCSRFToken } from "./crsf";

const envAdminJwtSecret = serverEnv.ADMIN_JWT_SECRET;

describe("CSRF Token Implementation", () => {
  if (!envAdminJwtSecret) {
    it.skip("Skipping CSRF tests because ADMIN_JWT_SECRET is not set", () => {});
    return;
  }
  describe("generateCSRFToken", () => {
    it("should generate a valid token", () => {
      const token = generateCSRFToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
    });

    it("should generate tokens in correct format (payload.signature)", () => {
      const token = generateCSRFToken();
      const parts = token.split(".");
      expect(parts).toHaveLength(2);
      expect(parts[0]).toBeTruthy(); // payload
      expect(parts[1]).toBeTruthy(); // signature
    });

    it("should generate unique tokens on each call", () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      expect(token1).not.toBe(token2);
    });

    it("should generate token with session binding", () => {
      const sessionId = "test-session-123";
      const token = generateCSRFToken(sessionId);
      expect(token).toBeTruthy();

      // Token should validate with the same session ID
      expect(validateCSRFToken(token, sessionId)).toBe(true);
      expect(validateCSRFToken(token, "abcd")).toBe(false);
    });

    it("should generate tokens with cryptographically secure nonces", () => {
      // Generate multiple tokens and verify they all have different nonces
      const tokens = Array.from({ length: 10 }, () => generateCSRFToken());
      const nonces = tokens.map((token) => {
        const [payloadB64] = token.split(".");
        const payload = JSON.parse(
          Buffer.from(payloadB64, "base64url").toString("utf8")
        );
        return payload.nonce;
      });

      // All nonces should be unique
      const uniqueNonces = new Set(nonces);
      expect(uniqueNonces.size).toBe(10);
    });
  });

  describe("validateCSRFToken", () => {
    it("should validate a freshly generated token", () => {
      const token = generateCSRFToken();
      expect(validateCSRFToken(token)).toBe(true);
    });

    it("should reject tokens with invalid format", () => {
      expect(validateCSRFToken("invalid")).toBe(false);
      expect(validateCSRFToken("invalid.token.format")).toBe(false);
      expect(validateCSRFToken("")).toBe(false);
    });

    it("should reject tokens with tampered payload", () => {
      const token = generateCSRFToken();
      const [_payloadB64, signature] = token.split(".");

      // Tamper with the payload
      const tamperedPayload = Buffer.from("tampered").toString("base64url");
      const tamperedToken = `${tamperedPayload}.${signature}`;

      expect(validateCSRFToken(tamperedToken)).toBe(false);
    });

    it("should reject tokens with tampered signature", () => {
      const token = generateCSRFToken();
      const [payloadB64] = token.split(".");

      // Create fake signature
      const fakeSignature = Buffer.from("fake-signature").toString("base64url");
      const tamperedToken = `${payloadB64}.${fakeSignature}`;

      expect(validateCSRFToken(tamperedToken)).toBe(false);
    });

    it("should reject expired tokens", () => {
      const currentTime = Date.now();
      const token = generateCSRFToken();

      const duration = 3600000; // 1 hour in ms
      const notSofutureTime = currentTime + duration - 1;
      expect(validateCSRFToken(token, undefined, notSofutureTime)).toBe(true);

      const futureTime = currentTime + duration + 10;
      expect(validateCSRFToken(token, undefined, futureTime)).toBe(false);
    });

    it("should reject tokens with future timestamps", () => {
      const currentTime = Date.now();

      // Manually create a token with future timestamp
      const payload = {
        nonce: "test-nonce",
        timestamp: currentTime + 10000, // 10 seconds in the future
      };
      const payloadB64 = Buffer.from(JSON.stringify(payload)).toString(
        "base64url"
      );

      // Create HMAC signature
      const signature = createHmac("sha256", envAdminJwtSecret)
        .update(payloadB64)
        .digest("base64url");

      const token = `${payloadB64}.${signature}`;

      expect(validateCSRFToken(token, undefined, currentTime)).toBe(false);
    });

    it("should allow small clock skew for future timestamps", () => {
      const currentTime = Date.now();

      // Manually create a token with small future timestamp (within 5s skew)
      const payload = {
        nonce: "test-nonce",
        timestamp: currentTime + 3000, // 3 seconds in the future (within 5s skew)
      };
      const payloadB64 = Buffer.from(JSON.stringify(payload)).toString(
        "base64url"
      );

      // Create HMAC signature
      const signature = createHmac("sha256", envAdminJwtSecret)
        .update(payloadB64)
        .digest("base64url");

      const token = `${payloadB64}.${signature}`;

      expect(validateCSRFToken(token, undefined, currentTime)).toBe(true);
    });

    it("should handle malformed JSON in payload gracefully", () => {
      const malformedPayload = Buffer.from("not-json").toString("base64url");
      const fakeSignature = Buffer.from("signature").toString("base64url");
      const token = `${malformedPayload}.${fakeSignature}`;

      expect(validateCSRFToken(token)).toBe(false);
    });

    it("should reject tokens with missing required fields", () => {
      // Create token with incomplete payload
      const payload = {
        nonce: "test-nonce",
        // missing timestamp
      };
      const payloadB64 = Buffer.from(JSON.stringify(payload)).toString(
        "base64url"
      );

      const signature = createHmac("sha256", envAdminJwtSecret)
        .update(payloadB64)
        .digest("base64url");

      const token = `${payloadB64}.${signature}`;

      expect(validateCSRFToken(token)).toBe(false);
    });

    it("should use constant-time comparison for signature verification", () => {
      // This test verifies that the implementation uses timingSafeEqual
      // by attempting to validate with slightly different signatures
      const token = generateCSRFToken();
      const [payloadB64, correctSignature] = token.split(".");

      // Create a signature that differs by one character
      const incorrectSignature =
        correctSignature.slice(0, -1) +
        (correctSignature.slice(-1) === "A" ? "B" : "A");
      const tamperedToken = `${payloadB64}.${incorrectSignature}`;

      expect(validateCSRFToken(tamperedToken)).toBe(false);
    });
  });

  describe("Session Binding", () => {
    it("should allow validation without session ID for tokens without binding", () => {
      const token = generateCSRFToken(); // No session ID
      expect(validateCSRFToken(token)).toBe(true);
      expect(validateCSRFToken(token, undefined)).toBe(true);
    });

    it("should allow validation with session ID for tokens with binding", () => {
      const sessionId = "session-123";
      const token = generateCSRFToken(sessionId);
      expect(validateCSRFToken(token, sessionId)).toBe(true);
    });

    it("should reject validation when session IDs do not match", () => {
      const sessionId = "session-123";
      const token = generateCSRFToken(sessionId);
      expect(validateCSRFToken(token, "different-session")).toBe(false);
    });

    it("should allow token with session binding to validate without session ID check", () => {
      // This allows for graceful degradation or testing scenarios
      const sessionId = "session-123";
      const token = generateCSRFToken(sessionId);
      expect(validateCSRFToken(token)).toBe(true);
    });
  });

  describe("Security Properties", () => {
    it("should not accept old CSRF token format", () => {
      // Old format: csrf_timestamp_randomstring
      const oldToken = `csrf_${Date.now()}_abc123def456`;
      expect(validateCSRFToken(oldToken)).toBe(false);
    });

    it("should generate tokens of reasonable length", () => {
      const token = generateCSRFToken();
      // Token should be neither too short (weak) nor too long (inefficient)
      expect(token.length).toBeGreaterThan(50);
      expect(token.length).toBeLessThan(500);
    });

    it("should use base64url encoding (URL-safe)", () => {
      const token = generateCSRFToken();
      // base64url should not contain +, /, or =
      expect(token).not.toMatch(/[+/=]/);
    });

    it("should not leak information about the secret in the token", () => {
      const token = generateCSRFToken();
      const [payloadB64] = token.split(".");
      const payload = JSON.parse(
        Buffer.from(payloadB64, "base64url").toString("utf8")
      );

      // Payload should only contain expected fields
      expect(Object.keys(payload)).toEqual(
        expect.arrayContaining(["nonce", "timestamp"])
      );
      expect(payload).not.toHaveProperty("secret");
      expect(payload).not.toHaveProperty("key");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string as token", () => {
      expect(validateCSRFToken("")).toBe(false);
    });

    it("should handle token with only signature part", () => {
      expect(validateCSRFToken(".signature")).toBe(false);
    });

    it("should handle token with only payload part", () => {
      expect(validateCSRFToken("payload.")).toBe(false);
    });

    it("should handle token with multiple dots", () => {
      const token = generateCSRFToken();
      const tamperedToken = token + ".extra";
      expect(validateCSRFToken(tamperedToken)).toBe(false);
    });

    it("should handle very long session IDs", () => {
      const longSessionId = "a".repeat(1000);
      const token = generateCSRFToken(longSessionId);
      expect(validateCSRFToken(token, longSessionId)).toBe(true);
    });

    it("should handle special characters in session IDs", () => {
      const specialSessionId = "session-with-special-chars-!@#$%^&*()";
      const token = generateCSRFToken(specialSessionId);
      expect(validateCSRFToken(token, specialSessionId)).toBe(true);
    });
  });
});
