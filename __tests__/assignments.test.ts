// Feature: learnova-frontend-completion, Property 10: Duplicate Assignment Prevention
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ─── Types mirroring useAssignmentsService ───────────────────────────────────

interface SubjectAssignment {
  subjectId: string;
  classArmId: string;
}

/**
 * Pure duplicate-check logic mirroring the guard in the assignments page:
 * assignments.some(a => a.subjectId === subjectId && a.classArmId === classArmId)
 */
function isDuplicate(
  assignments: SubjectAssignment[],
  subjectId: string,
  classArmId: string,
): boolean {
  return assignments.some(
    (a) => a.subjectId === subjectId && a.classArmId === classArmId,
  );
}

/**
 * Simulates a create attempt: returns the updated list only if not a duplicate,
 * otherwise returns the original list unchanged.
 */
function tryCreate(
  assignments: SubjectAssignment[],
  subjectId: string,
  classArmId: string,
): { assignments: SubjectAssignment[]; rejected: boolean } {
  if (isDuplicate(assignments, subjectId, classArmId)) {
    return { assignments, rejected: true };
  }
  return {
    assignments: [...assignments, { subjectId, classArmId }],
    rejected: false,
  };
}

// ─── Property 10: Duplicate Assignment Prevention ────────────────────────────
// **Validates: Requirements 3.3**
describe("Property 10: Duplicate Assignment Prevention", () => {
  it("a second create attempt for the same (subjectId, classArmId) pair is rejected", () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 1 })),
        ([subjectId, classArmId]) => {
          // Existing assignments already contain this pair
          const existing: SubjectAssignment[] = [{ subjectId, classArmId }];

          // Attempt to create a duplicate
          const result = isDuplicate(existing, subjectId, classArmId);

          expect(result).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("assignments list remains unchanged when a duplicate is rejected", () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 1 })),
        ([subjectId, classArmId]) => {
          const existing: SubjectAssignment[] = [{ subjectId, classArmId }];
          const originalLength = existing.length;

          const { assignments: after, rejected } = tryCreate(
            existing,
            subjectId,
            classArmId,
          );

          expect(rejected).toBe(true);
          expect(after).toHaveLength(originalLength);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("a unique (subjectId, classArmId) pair is not flagged as duplicate", () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 1 })),
        fc.tuple(fc.string({ minLength: 1 }), fc.string({ minLength: 1 })),
        ([existingSubject, existingClass], [newSubject, newClass]) => {
          // Ensure the new pair is different from the existing one
          if (existingSubject === newSubject && existingClass === newClass) return;

          const existing: SubjectAssignment[] = [
            { subjectId: existingSubject, classArmId: existingClass },
          ];

          expect(isDuplicate(existing, newSubject, newClass)).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("duplicate check is false for an empty assignments list", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (subjectId, classArmId) => {
          expect(isDuplicate([], subjectId, classArmId)).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });
});
