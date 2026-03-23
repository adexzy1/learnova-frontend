// Feature: learnova-frontend-completion
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import MockAdapter from "axios-mock-adapter";

// Import api-client first so its interceptors are registered on axiosClient.
import apiClient from "@/lib/api-client";
import type { ApiError } from "@/types";

const mock = new MockAdapter(apiClient);

beforeEach(() => {
  mock.reset();
});

afterEach(() => {
  mock.reset();
});

// ─── Property: Error Normalization ────────────────────────────────
describe("Error Normalization", () => {
  it("normalizes any 4xx/5xx status (excluding 401) into ApiError with numeric statusCode and non-empty message", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 400, max: 599 }).filter((s) => s !== 401),
        fc.string({ minLength: 1, maxLength: 200 }),
        async (statusCode, message) => {
          mock.onGet("/error-endpoint").reply(statusCode, { message });

          let thrownError: unknown;
          try {
            await apiClient.get("/error-endpoint");
          } catch (err) {
            thrownError = err;
          }

          expect(thrownError).toBeDefined();

          // Must be ApiError shape, never a raw AxiosError
          const apiError = thrownError as ApiError;
          expect(typeof apiError.statusCode).toBe("number");
          expect(apiError.statusCode).toBe(statusCode);
          expect(typeof apiError.message).toBe("string");
          expect(apiError.message.length).toBeGreaterThan(0);

          // Must NOT be a raw AxiosError (no isAxiosError property)
          expect((thrownError as { isAxiosError?: boolean }).isAxiosError).toBeUndefined();
        },
      ),
      { numRuns: 100 },
    );
  });

  it("includes errors field when backend provides it", async () => {
    const errors = { email: ["Email is required"], name: ["Name is too short"] };
    mock.onPost("/validate").reply(422, {
      message: "Validation failed",
      errors,
    });

    let thrownError: unknown;
    try {
      await apiClient.post("/validate", {});
    } catch (err) {
      thrownError = err;
    }

    const apiError = thrownError as ApiError;
    expect(apiError.statusCode).toBe(422);
    expect(apiError.errors).toEqual(errors);
  });

  it("normalizes network errors (no response) into ApiError with statusCode 0", async () => {
    mock.onGet("/network-error").networkError();

    let thrownError: unknown;
    try {
      await apiClient.get("/network-error");
    } catch (err) {
      thrownError = err;
    }

    const apiError = thrownError as ApiError;
    expect(apiError.statusCode).toBe(0);
    expect(typeof apiError.message).toBe("string");
    expect(apiError.message.length).toBeGreaterThan(0);
  });
});
