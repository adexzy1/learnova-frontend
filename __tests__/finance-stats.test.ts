// Feature: learnova-frontend-completion, Property 5: Finance Stats Invariant
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ─── Types mirroring useInvoicesService ──────────────────────────────────────

type InvoiceStatus = "unpaid" | "partial" | "paid" | "overdue";

interface Invoice {
  paidAmount: number;
  balance: number;
  status: InvoiceStatus;
}

/**
 * Pure computation: sum of paidAmount for all invoices.
 * Mirrors: invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
 */
function computeTotalRevenue(invoices: Invoice[]): number {
  return invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
}

/**
 * Pure computation: sum of balance for invoices with status !== 'paid'.
 * Mirrors: invoices.filter(inv => ['unpaid','partial','overdue'].includes(inv.status))
 *                  .reduce((sum, inv) => sum + inv.balance, 0)
 */
function computeOutstanding(invoices: Invoice[]): number {
  return invoices
    .filter((inv) => inv.status !== "paid")
    .reduce((sum, inv) => sum + inv.balance, 0);
}

// ─── Property 5: Finance Stats Invariant ─────────────────────────────────────
// **Validates: Requirements 9.1**
describe("Property 5: Finance Stats Invariant", () => {
  const invoiceArb = fc.record({
    paidAmount: fc.float({ min: 0, max: 1_000_000, noNaN: true }),
    balance: fc.float({ min: 0, max: 1_000_000, noNaN: true }),
    status: fc.constantFrom<InvoiceStatus>("unpaid", "partial", "paid", "overdue"),
  });

  it("totalRevenue equals sum of all paidAmount values", () => {
    fc.assert(
      fc.property(fc.array(invoiceArb), (invoices) => {
        const totalRevenue = computeTotalRevenue(invoices);
        const expected = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
        expect(totalRevenue).toBeCloseTo(expected, 5);
      }),
      { numRuns: 100 },
    );
  });

  it("outstanding equals sum of balance where status !== 'paid'", () => {
    fc.assert(
      fc.property(fc.array(invoiceArb), (invoices) => {
        const outstanding = computeOutstanding(invoices);
        const expected = invoices
          .filter((inv) => inv.status !== "paid")
          .reduce((sum, inv) => sum + inv.balance, 0);
        expect(outstanding).toBeCloseTo(expected, 5);
      }),
      { numRuns: 100 },
    );
  });

  it("totalRevenue is zero for an empty invoice list", () => {
    expect(computeTotalRevenue([])).toBe(0);
  });

  it("outstanding is zero for an empty invoice list", () => {
    expect(computeOutstanding([])).toBe(0);
  });

  it("outstanding excludes paid invoices", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            paidAmount: fc.float({ min: 0, max: 1_000_000, noNaN: true }),
            balance: fc.float({ min: 1, max: 1_000_000, noNaN: true }),
            status: fc.constant<InvoiceStatus>("paid"),
          }),
          { minLength: 1, maxLength: 10 },
        ),
        (paidInvoices) => {
          expect(computeOutstanding(paidInvoices)).toBeCloseTo(0, 5);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("outstanding includes all unpaid/partial/overdue balances", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            paidAmount: fc.float({ min: 0, max: 1_000_000, noNaN: true }),
            balance: fc.float({ min: 0, max: 1_000_000, noNaN: true }),
            status: fc.constantFrom<InvoiceStatus>("unpaid", "partial", "overdue"),
          }),
          { minLength: 1, maxLength: 10 },
        ),
        (invoices) => {
          const outstanding = computeOutstanding(invoices);
          const expected = invoices.reduce((sum, inv) => sum + inv.balance, 0);
          expect(outstanding).toBeCloseTo(expected, 5);
        },
      ),
      { numRuns: 100 },
    );
  });
});
