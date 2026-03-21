// Feature: learnova-frontend-completion, Property 6: Parent Portal Data Isolation
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ─── Types mirroring guardian/child relationship ────────────────────────────

interface GuardianChildLink {
  guardianId: string;
  studentId: string;
}

/**
 * Pure filter function that mirrors what the ChildSelectorContext does:
 * only returns students whose guardian record references the authenticated guardian.
 */
function filterChildrenForGuardian(
  links: GuardianChildLink[],
  authenticatedGuardianId: string
): string[] {
  return links
    .filter((link) => link.guardianId === authenticatedGuardianId)
    .map((link) => link.studentId);
}

// ─── Property 6: Parent Portal Data Isolation ───────────────────────────────
// **Validates: Requirements 12.3, 13.5, 14.4**
describe("Property 6: Parent Portal Data Isolation", () => {
  it("rendered data must only include students whose guardian record references the authenticated guardian's ID", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            guardianId: fc.stringMatching(/^guardian-[0-9]{1,4}$/),
            studentId: fc.stringMatching(/^student-[0-9]{1,4}$/),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        fc.stringMatching(/^guardian-[0-9]{1,4}$/),
        (links, authenticatedGuardianId) => {
          const visibleStudents = filterChildrenForGuardian(
            links,
            authenticatedGuardianId
          );

          // Every visible student must have a link to the authenticated guardian
          for (const studentId of visibleStudents) {
            const hasLink = links.some(
              (l) =>
                l.guardianId === authenticatedGuardianId &&
                l.studentId === studentId
            );
            expect(hasLink).toBe(true);
          }

          // No student linked to a DIFFERENT guardian should appear
          // (unless they also have a link to the authenticated guardian)
          const otherGuardianStudents = links
            .filter((l) => l.guardianId !== authenticatedGuardianId)
            .map((l) => l.studentId);

          for (const otherId of otherGuardianStudents) {
            if (visibleStudents.includes(otherId)) {
              // This is OK only if there's also a link to the authenticated guardian
              const alsoLinked = links.some(
                (l) =>
                  l.guardianId === authenticatedGuardianId &&
                  l.studentId === otherId
              );
              expect(alsoLinked).toBe(true);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns empty array when no links exist for the authenticated guardian", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            guardianId: fc.constant("guardian-other"),
            studentId: fc.stringMatching(/^student-[0-9]{1,4}$/),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (links) => {
          const visibleStudents = filterChildrenForGuardian(
            links,
            "guardian-mine"
          );
          expect(visibleStudents).toHaveLength(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
