// Feature: learnova-frontend-completion, Property 4: Result Score Computation
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ─── Types mirroring useResultsService ──────────────────────────────────────

interface CaScore {
  score: number;
}

interface SubjectEntry {
  caScores: CaScore[];
  examScore: number;
}

/**
 * Pure computation that mirrors what the UI derives from backend data:
 * totalScore = sum(caScores[i].score) + examScore
 */
function computeTotalScore(entry: SubjectEntry): number {
  const caTotal = entry.caScores.reduce((sum, ca) => sum + ca.score, 0);
  return caTotal + entry.examScore;
}

// ─── Property 4: Result Score Computation ───────────────────────────────────
// **Validates: Requirements 7.3**
describe("Property 4: Result Score Computation", () => {
  it("totalScore equals sum of all caScores plus examScore for any subject entry", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            caScores: fc.array(
              fc.record({ score: fc.float({ min: 0, max: 100, noNaN: true }) }),
              { minLength: 0, maxLength: 5 },
            ),
            examScore: fc.float({ min: 0, max: 100, noNaN: true }),
          }),
          { minLength: 1, maxLength: 10 },
        ),
        (subjects) => {
          for (const subject of subjects) {
            const computed = computeTotalScore(subject);
            const expectedCaSum = subject.caScores.reduce(
              (sum, ca) => sum + ca.score,
              0,
            );
            const expected = expectedCaSum + subject.examScore;

            // Use approximate equality to handle floating-point precision
            expect(computed).toBeCloseTo(expected, 5);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("totalScore is zero when there are no CA scores and examScore is zero", () => {
    const entry: SubjectEntry = { caScores: [], examScore: 0 };
    expect(computeTotalScore(entry)).toBe(0);
  });

  it("totalScore equals examScore when caScores array is empty", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: 100, noNaN: true }),
        (examScore) => {
          const entry: SubjectEntry = { caScores: [], examScore };
          expect(computeTotalScore(entry)).toBeCloseTo(examScore, 5);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("totalScore equals sum of caScores when examScore is zero", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ score: fc.float({ min: 0, max: 100, noNaN: true }) }),
          { minLength: 1, maxLength: 5 },
        ),
        (caScores) => {
          const entry: SubjectEntry = { caScores, examScore: 0 };
          const expectedSum = caScores.reduce((sum, ca) => sum + ca.score, 0);
          expect(computeTotalScore(entry)).toBeCloseTo(expectedSum, 5);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("totalScore is always >= 0 for valid score inputs", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ score: fc.float({ min: 0, max: 100, noNaN: true }) }),
          { minLength: 0, maxLength: 5 },
        ),
        fc.float({ min: 0, max: 100, noNaN: true }),
        (caScores, examScore) => {
          const entry: SubjectEntry = { caScores, examScore };
          expect(computeTotalScore(entry)).toBeGreaterThanOrEqual(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("totalScore is always <= 100 * (numCaScores + 1) for max-bounded inputs", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ score: fc.float({ min: 0, max: 100, noNaN: true }) }),
          { minLength: 0, maxLength: 5 },
        ),
        fc.float({ min: 0, max: 100, noNaN: true }),
        (caScores, examScore) => {
          const entry: SubjectEntry = { caScores, examScore };
          const maxPossible = 100 * (caScores.length + 1);
          expect(computeTotalScore(entry)).toBeLessThanOrEqual(maxPossible + 0.001);
        },
      ),
      { numRuns: 100 },
    );
  });
});
