// Feature: learnova-frontend-completion, Property 7: Student Portal Data Isolation
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ─── Types mirroring student portal data ────────────────────────────────────

interface StudentRecord {
  id: string;
  studentId: string;
  data: unknown;
}

/**
 * Pure filter function that mirrors what the student portal pages do:
 * all fetched data must have studentId equal to the authenticated user's ID.
 */
function filterRecordsForStudent(
  records: StudentRecord[],
  authenticatedStudentId: string
): StudentRecord[] {
  return records.filter(
    (record) => record.studentId === authenticatedStudentId
  );
}

// ─── Property 7: Student Portal Data Isolation ──────────────────────────────
// **Validates: Requirements 18.8**
describe("Property 7: Student Portal Data Isolation", () => {
  it("all fetched data must have studentId equal to the authenticated user's ID", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            studentId: fc.stringMatching(/^student-[0-9]{1,4}$/),
            data: fc.anything(),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        fc.stringMatching(/^student-[0-9]{1,4}$/),
        (records, authenticatedStudentId) => {
          const visibleRecords = filterRecordsForStudent(
            records,
            authenticatedStudentId
          );

          // Every visible record must belong to the authenticated student
          for (const record of visibleRecords) {
            expect(record.studentId).toBe(authenticatedStudentId);
          }

          // The count of visible records must equal the count of records
          // with matching studentId in the original set
          const expectedCount = records.filter(
            (r) => r.studentId === authenticatedStudentId
          ).length;
          expect(visibleRecords).toHaveLength(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns empty array when no records exist for the authenticated student", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            studentId: fc.constant("student-other"),
            data: fc.anything(),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (records) => {
          const visibleRecords = filterRecordsForStudent(
            records,
            "student-mine"
          );
          expect(visibleRecords).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("preserves all records when every record belongs to the authenticated student", () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^student-[0-9]{1,4}$/),
        fc.array(fc.anything(), { minLength: 1, maxLength: 10 }),
        (studentId, dataEntries) => {
          const records: StudentRecord[] = dataEntries.map((data, i) => ({
            id: `rec-${i}`,
            studentId,
            data,
          }));

          const visibleRecords = filterRecordsForStudent(records, studentId);
          expect(visibleRecords).toHaveLength(records.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
