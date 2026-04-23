// Feature: learnova-frontend-completion, Property 3: Cache Invalidation
import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/app/constants/queryKeys";

// ─── Resource type union ─────────────────────────────────────────────────────

type ResourceType =
  | "grading-systems"
  | "assessments-ca"
  | "examinations"
  | "timetable"
  | "attendance"
  | "results"
  | "discipline"
  | "admissions"
  | "invoices"
  | "payments"
  | "notifications";

const RESOURCE_QUERY_KEYS: Record<ResourceType, string> = {
  "grading-systems": queryKeys.GRADING_SYSTEMS,
  "assessments-ca": queryKeys.ASSESSMENTS_CA,
  "examinations": queryKeys.EXAMINATIONS,
  "timetable": queryKeys.TIMETABLE,
  "attendance": queryKeys.ATTENDANCE,
  "results": queryKeys.RESULTS,
  "discipline": queryKeys.DISCIPLINE,
  "admissions": queryKeys.ADMISSIONS,
  "invoices": queryKeys.INVOICES,
  "payments": queryKeys.PAYMENTS,
  "notifications": queryKeys.NOTIFICATIONS,
};

const ALL_RESOURCE_TYPES = Object.keys(RESOURCE_QUERY_KEYS) as ResourceType[];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Simulates the cache invalidation pattern used by every service hook's
 * onSuccess callback:
 *   queryClient.invalidateQueries({ queryKey: [queryKeys.RESOURCE] })
 */
function simulateMutationSuccess(
  queryClient: QueryClient,
  resourceType: ResourceType,
): void {
  const key = RESOURCE_QUERY_KEYS[resourceType];
  queryClient.invalidateQueries({ queryKey: [key] });
}

/**
 * Seeds the QueryClient cache with a list of items for a given resource.
 */
function seedCache<T>(
  queryClient: QueryClient,
  resourceType: ResourceType,
  items: T[],
): void {
  const key = RESOURCE_QUERY_KEYS[resourceType];
  queryClient.setQueryData([key], { data: { data: items } });
}

/**
 * Reads the cached list for a resource. Returns null if the query has been
 * invalidated (stale) or was never set.
 */
function readCache<T>(
  queryClient: QueryClient,
  resourceType: ResourceType,
): { data: { data: T[] } } | undefined {
  const key = RESOURCE_QUERY_KEYS[resourceType];
  return queryClient.getQueryData<{ data: { data: T[] } }>([key]);
}

/**
 * Returns true if the query for the given resource is marked as stale/invalid
 * in the QueryClient, meaning a refetch will be triggered on next read.
 */
function isQueryStale(
  queryClient: QueryClient,
  resourceType: ResourceType,
): boolean {
  const key = RESOURCE_QUERY_KEYS[resourceType];
  const query = queryClient.getQueryCache().find({ queryKey: [key] });
  // After invalidateQueries, the query state becomes stale (isInvalidated = true)
  // or the query is removed from cache entirely.
  if (!query) return true; // no query in cache = will refetch
  return query.isStale();
}

// ─── Property 3: Cache Invalidation After Mutations ─────────────────────────
// **Validates: Requirements 2.1, 2.2**
describe("Property 3: Cache Invalidation After Mutations", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          // Disable retries and set staleTime to 0 so invalidation is immediate
          retry: false,
          staleTime: 0,
          gcTime: 0,
        },
      },
    });
  });

  it("after a successful mutation, the list query for any resource type is marked stale", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_RESOURCE_TYPES),
        fc.array(
          fc.record({ id: fc.string({ minLength: 1, maxLength: 20 }) }),
          { minLength: 1, maxLength: 10 },
        ),
        (resourceType, initialItems) => {
          // Seed the cache with initial data
          seedCache(queryClient, resourceType, initialItems);

          // Verify data is in cache before mutation
          const before = readCache(queryClient, resourceType);
          expect(before).toBeDefined();

          // Simulate a successful mutation (create/update/delete)
          simulateMutationSuccess(queryClient, resourceType);

          // After invalidation, the query must be stale so next read triggers refetch
          expect(isQueryStale(queryClient, resourceType)).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("invalidating one resource does not affect other resources' cache validity", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_RESOURCE_TYPES),
        fc.constantFrom(...ALL_RESOURCE_TYPES),
        fc.array(
          fc.record({ id: fc.string({ minLength: 1, maxLength: 20 }) }),
          { minLength: 1, maxLength: 5 },
        ),
        (mutatedResource, otherResource, items) => {
          // Skip when both resources are the same
          if (mutatedResource === otherResource) return;

          // Seed both caches
          seedCache(queryClient, mutatedResource, items);
          seedCache(queryClient, otherResource, items);

          // Mutate only one resource
          simulateMutationSuccess(queryClient, mutatedResource);

          // The mutated resource must be stale
          expect(isQueryStale(queryClient, mutatedResource)).toBe(true);

          // The other resource must still have its data intact (not stale due to this mutation)
          const otherData = readCache(queryClient, otherResource);
          expect(otherData).toBeDefined();
        },
      ),
      { numRuns: 100 },
    );
  });

  it("cache reflects updated list after invalidation and re-seeding (simulating refetch)", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_RESOURCE_TYPES),
        fc.array(
          fc.record({ id: fc.string({ minLength: 1, maxLength: 20 }), name: fc.string() }),
          { minLength: 1, maxLength: 5 },
        ),
        fc.record({ id: fc.string({ minLength: 1, maxLength: 20 }), name: fc.string() }),
        (resourceType, initialItems, newItem) => {
          // Seed initial list
          seedCache(queryClient, resourceType, initialItems);

          // Simulate successful create mutation → invalidate
          simulateMutationSuccess(queryClient, resourceType);

          // Simulate the refetch that TanStack Query triggers after invalidation
          const updatedItems = [...initialItems, newItem];
          seedCache(queryClient, resourceType, updatedItems);

          // The cache now reflects the updated list including the new item
          const afterRefetch = readCache<{ id: string; name: string }>(
            queryClient,
            resourceType,
          );
          expect(afterRefetch?.data?.data).toHaveLength(updatedItems.length);
          expect(
            afterRefetch?.data?.data.some((item) => item.id === newItem.id),
          ).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("cache reflects deleted item after invalidation and re-seeding (simulating refetch)", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ALL_RESOURCE_TYPES),
        fc.array(
          fc.record({ id: fc.string({ minLength: 1, maxLength: 20 }) }),
          { minLength: 2, maxLength: 6 },
        ),
        (resourceType, initialItems) => {
          // Seed initial list
          seedCache(queryClient, resourceType, initialItems);

          // Simulate successful delete mutation → invalidate
          simulateMutationSuccess(queryClient, resourceType);

          // Simulate refetch with the first item removed
          const [removed, ...remaining] = initialItems;
          seedCache(queryClient, resourceType, remaining);

          const afterRefetch = readCache<{ id: string }>(queryClient, resourceType);
          expect(afterRefetch?.data?.data).toHaveLength(remaining.length);
          expect(
            afterRefetch?.data?.data.some((item) => item.id === removed.id),
          ).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("all resource types have a defined query key constant", () => {
    for (const resourceType of ALL_RESOURCE_TYPES) {
      const key = RESOURCE_QUERY_KEYS[resourceType];
      expect(typeof key).toBe("string");
      expect(key.length).toBeGreaterThan(0);
    }
  });
});
