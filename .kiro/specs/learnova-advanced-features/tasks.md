# Implementation Plan: Learnova Advanced Features

## Overview

Nine self-contained sprints that progressively build the advanced Learnova features on top of
the API foundation established in the `learnova-frontend-completion` spec. Each sprint can be
executed independently in order.

## Tasks

- [ ] 1. Sprint 1: API Foundation Extensions
  - [ ] 1.1 Add new endpoint groups to `lib/api-routes.ts`
    - Append `RESULT_ENGINE_ENDPOINTS`, `PROMOTION_ENDPOINTS`, `FEE_TEMPLATE_ENDPOINTS`, `DISCOUNT_ENDPOINTS`, `EXPENSE_ENDPOINTS`, `FINANCIAL_REPORT_ENDPOINTS`, `STAFF_ASSIGNMENT_ENDPOINTS`, `STAFF_ATTENDANCE_ENDPOINTS`, `PAYROLL_ENDPOINTS`, `LEAVE_ENDPOINTS`, `BROADCAST_ENDPOINTS`, `NOTICE_BOARD_ENDPOINTS`, `ADMISSIONS_EXTENDED_ENDPOINTS`, `CLASS_TIMETABLE_ENDPOINTS`, `EXAM_TIMETABLE_ENDPOINTS`, `SUPER_ADMIN_METRICS_ENDPOINTS`, `CUSTOM_DOMAIN_ENDPOINTS`, `CALENDAR_ENDPOINTS`, and `EXPORT_ENDPOINTS` constant objects
    - Each group must include all CRUD variants and action-specific endpoints as defined in the design document
    - _Requirements: 1.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1, 14.1, 15.1, 16.1, 17.1, 18.1, 19.1, 21.1, 22.1, 23.1, 24.1, 26.1, 27.1, 29.1, 30.1, 31.1, 32.1_

  - [ ] 1.2 Add new query keys to `app/constants/queryKeys.ts`
    - Append `FEE_TEMPLATES`, `DISCOUNTS`, `EXPENSES`, `FINANCIAL_REPORTS`, `STAFF_ASSIGNMENTS`, `STAFF_ATTENDANCE`, `PAYROLL`, `LEAVE_REQUESTS`, `LEAVE_BALANCES`, `BROADCAST_HISTORY`, `NOTICE_BOARD`, `ADMISSIONS_WORKFLOW`, `CLASS_TIMETABLE`, `EXAM_TIMETABLE`, `RESULT_COMPUTATION`, `PROMOTION_PREVIEW`, `REPORT_CARDS`, `SUPER_ADMIN_USAGE`, `SUPER_ADMIN_AGGREGATES`, `CUSTOM_DOMAIN`, `CALENDAR_EVENTS`, `ONBOARDING_STATE`, and `PLAN_LIMITS` to the existing `queryKeys` object
    - _Requirements: 1.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1, 14.1, 16.1, 17.1, 18.1, 21.1, 22.1, 23.1, 24.1, 26.1, 27.1, 29.1, 32.1_

  - [ ] 1.3 Add all new TypeScript types to `types/index.ts`
    - Add `ComputedResult`, `SubjectResult`, `PromotionPreviewItem` for Domain 1
    - Add `FeeTemplate`, `FeeLineItem`, `Discount`, `AppliedDiscount`, `Expense`, `TermRevenueSummary`, `OutstandingDebtor`, `CollectionRateByClass` for Domain 2
    - Add `ClassTeacherAssignment`, `SubjectTeacherAssignment`, `StaffAttendanceRecord`, `StaffMonthlySummary`, `PayrollRecord`, `PayrollDeduction`, `LeaveBalance`, `LeaveRequest` for Domain 3
    - Add `BroadcastCriteria`, `BroadcastPayload`, `BroadcastResult`, `Notice` for Domain 4
    - Add `AdmissionStatus`, `AdmissionApplicationExtended`, `AdmissionDocument` for Domain 5
    - Add `TimetableSlot`, `ClassTimetable`, `ExamTimetableEntry` for Domain 6
    - Add `TenantUsageMetrics`, `PlatformAggregates`, `CustomDomainConfig` for Domain 8
    - Add `CalendarEvent`, `AuditEntry` for Domain 9
    - _Requirements: 1.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1, 13.1, 14.1, 16.1, 17.1, 18.1, 19.1, 21.1, 22.1, 23.1, 24.1, 26.1, 27.1, 29.1, 30.1, 32.1_

  - [ ] 1.4 Create `lib/public-api-client.ts` for unauthenticated public admissions portal
    - Export a factory function `publicApiClient(tenantSlug: string)` that returns an axios instance with `baseURL: process.env.NEXT_PUBLIC_API_URL` and `X-Tenant-Slug: tenantSlug` header
    - Do NOT include the 401 refresh interceptor or auth token injection — this client is intentionally unauthenticated
    - _Requirements: 18.7_

  - [ ] 1.5 Create `lib/csv-export.ts` utility
    - Export `triggerCsvDownload(blob: Blob, filename: string)` that creates an object URL, programmatically clicks an `<a>` tag, and revokes the URL
    - _Requirements: 10.5, 31.1_

  - [ ]* 1.6 Write property-based test for class arm name validation (P7)
    - Create `__tests__/class-arm.test.ts`
    - **Property 7: Class Arm Name Validation** — for any `fc.string()`, the Zod validator must accept the string if and only if it matches `/^[a-zA-Z0-9 ]{1,20}$/`; strings with length 0, length > 20, or non-alphanumeric non-space characters must be rejected
    - **Validates: Requirements 4.7**
    - Tag: `// Feature: learnova-advanced-features, Property 7: Class Arm Name Validation`

  - [ ]* 1.7 Write property-based test for invoice balance invariant (P10)
    - Create `__tests__/invoice.test.ts`
    - **Property 10: Invoice Balance Invariant** — for any `fc.record({ totalAmount: fc.float({ min: 0 }), paidAmount: fc.float({ min: 0 }) })` where `paidAmount <= totalAmount`, `balance` must equal `totalAmount - paidAmount`; this must hold after payment recording and discount application
    - **Validates: Requirements 7.3, 8.3**
    - Tag: `// Feature: learnova-advanced-features, Property 10: Invoice Balance Invariant`

  - [ ] 1.8 Checkpoint — ensure Sprint 1 tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [ ] 2. Sprint 2: Core Academic Operations
  - [ ] 2.1 Build result computation engine page at `app/(app)/academics/results/page.tsx`
    - Create `app/(app)/academics/results/_service/useResultEngineService.ts` with `useQuery` for class results (keyed by `[queryKeys.RESULT_COMPUTATION, filters]`), `computeMutation` POSTing to `RESULT_ENGINE_ENDPOINTS.COMPUTE`, and `publishMutation` POSTing to `RESULT_ENGINE_ENDPOINTS.PUBLISH`
    - Build `ResultsTable` component using TanStack Table showing student name, subject scores, total, grade, rank, and failure flags; render a warning badge on cells where a score was missing (treated as zero)
    - Build `ComputeResultsDialog` that requires class arm + term selection before triggering computation
    - Disable the Publish button until computation is complete; invalidate `queryKeys.RESULTS` and `queryKeys.RESULT_COMPUTATION` on publish success
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

  - [ ] 2.2 Build report card generation page at `app/(app)/academics/results/report-cards/page.tsx`
    - Create `useReportCardService.ts` with `downloadReportCard(studentId)` that fetches `RESULT_ENGINE_ENDPOINTS.GET_REPORT_CARD` as a blob and calls `triggerBlobDownload`
    - Add `downloadAllMutation` POSTing to `RESULT_ENGINE_ENDPOINTS.DOWNLOAD_ALL` with `{ classArmId, termId }`, receiving a ZIP blob
    - Disable Generate and Download All buttons when results are not yet published; display "Results must be published before generating report cards" message
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 2.3 Write property-based test for ZIP download (optional)
    - In `__tests__/report-card.test.ts`, add a test verifying `triggerBlobDownload` is called with a `.zip` filename when `downloadAllMutation` succeeds
    - **Property 5: Report Card Data Round-Trip** — for any `fc.record({...ComputedResult fields})`, the data used to generate the report card must match the source `ComputedResult` values
    - **Validates: Requirements 2.7**
    - Tag: `// Feature: learnova-advanced-features, Property 5: Report Card Data Round-Trip`

  - [ ] 2.4 Build promotion/retention workflow page at `app/(app)/academics/results/promotion/page.tsx`
    - Create `usePromotionService.ts` with `useQuery` for promotion preview (keyed by `[queryKeys.PROMOTION_PREVIEW, { sessionId, classLevelId }]`) fetching `PROMOTION_ENDPOINTS.PREVIEW`
    - Add `overrideMutation` PATCHing to `PROMOTION_ENDPOINTS.OVERRIDE` with `{ studentId, status }` and `confirmMutation` POSTing to `PROMOTION_ENDPOINTS.CONFIRM`
    - Render a preview list showing each student's recommended status (promote/retain) with per-student override toggles; disable the Promote button until the session is marked complete
    - Show a summary toast with `{ promoted: N, retained: M }` on confirm success
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ] 2.5 Extend Classes page with class arm CRUD
    - Create `useClassArmsService.ts` wrapping `CREATE_CLASS_ARM`, `UPDATE_CLASS`, and `DELETE_CLASS_ARM` mutations; invalidate `queryKeys.CLASSES` on success
    - Add a Class Arms section to the existing Classes page listing arms per class level with name, capacity, and assigned class teacher
    - Validate arm name with Zod regex `/^[a-zA-Z0-9 ]{1,20}$/`; display "Cannot delete a class arm with enrolled students" error on 400 from delete
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

  - [ ]* 2.6 Write property-based tests for result score computation (P1), grade derivation (P2), student ranking (P3), and computation idempotence (P4)
    - Create `__tests__/result-engine.test.ts`
    - **Property 1: Result Score Computation** — for any `fc.array(fc.float({ min: 0, max: 100 }))` CA scores and `fc.float({ min: 0, max: 100 })` exam score, `totalScore` must equal sum of all CA scores plus exam score; missing scores treated as zero
    - **Property 2: Grade Derivation** — for any `fc.float({ min: 0, max: 100 })` score and `fc.array(fc.record({ minScore, maxScore, letter }))` grade bands, the derived grade must be the unique band where `minScore <= score <= maxScore`
    - **Property 3: Student Ranking** — for any `fc.array(fc.record({ studentId: fc.string(), averageScore: fc.float() }))`, ranks must form a valid ordinal sequence: highest average = rank 1, ties share rank, no rank skipped after tie
    - **Property 4: Computation Idempotence** — for any `fc.record({ classArmId: fc.string(), termId: fc.string() })`, triggering computation twice must produce identical `totalScore`, `averageScore`, `rank`, and `grade` values
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.5, 1.6, 1.7**
    - Tag: `// Feature: learnova-advanced-features, Property 1–4`

  - [ ] 2.7 Checkpoint — ensure Sprint 2 tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Sprint 3: Finance Advanced
  - [ ] 3.1 Build fee templates page at `app/(app)/finance/fee-templates/page.tsx`
    - Create `useFeeTemplateService.ts` with `useQuery` (keyed by `queryKeys.FEE_TEMPLATES`), `createMutation`, `updateMutation`, and `deleteMutation` using `FEE_TEMPLATE_ENDPOINTS`; invalidate `queryKeys.FEE_TEMPLATES` on success
    - Build a line items editor within the create/edit dialog allowing add/remove of `{ description, amount }` rows; compute and display running total client-side
    - Display "Cannot delete a template with generated invoices" error on 400 from delete
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 3.2 Build bulk invoice generation flow on the fee templates page
    - Add a Bulk Generate action per template row that opens a dialog to select a target class arm
    - Add `bulkGenerateMutation` POSTing to `FEE_TEMPLATE_ENDPOINTS.BULK_GENERATE` with `{ classArmId }`; on success display a summary dialog showing `{ created: N, skipped: M }` counts
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 3.3 Build payment reconciliation page at `app/(app)/finance/reconciliation/page.tsx`
    - Create `useReconciliationService.ts` with `useQuery` for open invoices (unpaid + partial) and `recordPaymentMutation` POSTing to `FINANCE_ENDPOINTS.PAYMENTS_CREATE`
    - Client-side guard: validate `amount <= invoice.balance` before calling mutation; display "Payment exceeds outstanding balance" inline error if violated
    - Support filtering by class arm, payment status, and date range; invalidate `queryKeys.INVOICES` and `queryKeys.PAYMENTS` on success
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 3.4 Build discounts/scholarships page at `app/(app)/finance/discounts/page.tsx`
    - Create `useDiscountService.ts` with CRUD mutations using `DISCOUNT_ENDPOINTS` and `applyDiscount` mutation POSTing to `DISCOUNT_ENDPOINTS.APPLY` with `{ discountId, invoiceId }`
    - After apply success, invalidate `[queryKeys.INVOICES, invoiceId]`; display a warning if discount would reduce `totalAmount` below zero (cap at total)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

  - [ ] 3.5 Build expenses page at `app/(app)/finance/expenses/page.tsx`
    - Create `useExpenseService.ts` with `useQuery` (keyed by `queryKeys.EXPENSES`) and `createMutation`, `updateMutation`, `deleteMutation` using `EXPENSE_ENDPOINTS`
    - On create and delete, also invalidate `queryKeys.LEDGER` since expenses create/remove ledger debit entries
    - Support filtering by category and date range
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ] 3.6 Build financial reports page at `app/(app)/finance/reports/page.tsx`
    - Create `useFinancialReportService.ts` with three `useQuery` calls: `FINANCIAL_REPORT_ENDPOINTS.TERM_REVENUE`, `FINANCIAL_REPORT_ENDPOINTS.OUTSTANDING`, and `FINANCIAL_REPORT_ENDPOINTS.COLLECTION_RATE`, each enabled when `termId` is selected
    - Add `exportMutation` calling `FINANCIAL_REPORT_ENDPOINTS.EXPORT_CSV` with `{ reportType, termId }` as a blob and triggering download via `triggerCsvDownload` from `lib/csv-export.ts`
    - Render three tab views: Term Revenue Summary, Outstanding Debtors List, Collection Rate by Class
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 3.7 Write property-based tests for fee template total (P8), bulk invoice round-trip (P9), ledger net flow (P11), and collection rate (P12)
    - Create `__tests__/fee-template.test.ts`: **Property 8** — for any `fc.array(fc.record({ amount: fc.float({ min: 0 }) }))` line items, `totalAmount` must equal sum of all `amount` values after create, edit, and add/remove
    - Create `__tests__/bulk-invoice.test.ts`: **Property 9** — for any `fc.record({ templateTotal: fc.float({ min: 0 }) })`, the generated invoice's `totalAmount` must equal `templateTotal` with no rounding or modification
    - Create `__tests__/ledger.test.ts`: **Property 11** — for any `fc.array(fc.record({ type: fc.constantFrom("credit", "debit"), amount: fc.float({ min: 0 }) }))`, net flow must equal sum of credits minus sum of debits
    - Create `__tests__/financial-reports.test.ts`: **Property 12** — for any `fc.record({ invoiced: fc.float({ min: 0 }), collected: fc.float({ min: 0 }) })`, collection rate must equal `round((collected / invoiced) * 100, 2)`; if `invoiced == 0`, rate must be `0`
    - **Validates: Requirements 5.6, 6.6, 9.4, 10.6**
    - Tag: `// Feature: learnova-advanced-features, Property 8–9, 11–12`

  - [ ] 3.8 Checkpoint — ensure Sprint 3 tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Sprint 4: Staff & HR
  - [ ] 4.1 Build staff assignments page at `app/(app)/staff/assignments/page.tsx`
    - Create `useStaffAssignmentService.ts` with `useQuery` for class teachers (keyed by `queryKeys.STAFF_ASSIGNMENTS`) and subject teacher assignments
    - Add `setClassTeacherMutation` POSTing to `STAFF_ASSIGNMENT_ENDPOINTS.SET_CLASS_TEACHER`; show a confirmation prompt if the arm already has a class teacher before saving
    - Add `setSubjectTeacherMutation` and `deleteSubjectTeacherMutation`; show confirmation prompt on replacement; invalidate `queryKeys.STAFF_ASSIGNMENTS` on all mutation success
    - Render two sub-sections: Class Teachers (one row per class arm with dropdown) and Subject Teachers (table of subject/class arm/teacher triples with add/edit/delete)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

  - [ ] 4.2 Build staff attendance page at `app/(app)/staff/attendance/page.tsx`
    - Create `useStaffAttendanceService.ts` with `useQuery` for daily records (keyed by `[queryKeys.STAFF_ATTENDANCE, selectedDate]`) fetching `STAFF_ATTENDANCE_ENDPOINTS.GET_BY_DATE`; pre-populate status for each staff member from saved records
    - Add `saveMutation` POSTing to `STAFF_ATTENDANCE_ENDPOINTS.SAVE` with `{ date, records }`; invalidate `queryKeys.STAFF_ATTENDANCE` on success
    - Fetch monthly summary separately with `GET_MONTHLY` endpoint keyed by `[queryKeys.STAFF_ATTENDANCE, "monthly", month]`; display present count, absent count, and leave days per staff member
    - Render a "Consecutive Absence" warning badge on staff members flagged by the backend
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ] 4.3 Build payroll page at `app/(app)/staff/payroll/page.tsx`
    - Create `usePayrollService.ts` with `useQuery` (keyed by `queryKeys.PAYROLL`), `createMutation`, `updateMutation`, and `markPaidMutation` PATCHing to `PAYROLL_ENDPOINTS.MARK_PAID`
    - On `markPaidMutation` success, invalidate both `queryKeys.PAYROLL` and `queryKeys.LEDGER`
    - Display "Payroll record already exists for this month" error on 409 from create
    - Render a monthly summary row showing total gross pay, total deductions, and total net pay across all staff
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ] 4.4 Build leave management page at `app/(app)/staff/leave/page.tsx`
    - Create `useLeaveService.ts` with `useQuery` for leave requests (keyed by `queryKeys.LEAVE_REQUESTS`) and leave balances (keyed by `queryKeys.LEAVE_BALANCES`)
    - Add `createMutation` for staff to submit requests, `approveMutation` PATCHing to `LEAVE_ENDPOINTS.APPROVE`, and `rejectMutation` PATCHing to `LEAVE_ENDPOINTS.REJECT`
    - Role-based rendering: `useAuthStore().user.role === "school-admin"` shows the admin approve/reject view; staff see their own requests and balance
    - Display remaining balance by leave type (annual, sick, maternity, paternity, unpaid); show validation error on overlapping leave request (400 from API)
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [ ]* 4.5 Write property-based tests for payroll net pay (P13) and leave balance (P14)
    - Create `__tests__/payroll.test.ts`: **Property 13: Payroll Net Pay Invariant** — for any `fc.record({ grossPay: fc.float({ min: 0 }), deductions: fc.array(fc.float({ min: 0 })) })`, `netPay` must equal `grossPay - sum(deductions)` for all staff and all months
    - Create `__tests__/leave.test.ts`: **Property 14: Leave Balance Invariant** — for any `fc.record({ allocation: fc.integer({ min: 0, max: 30 }), approvedDays: fc.array(fc.integer({ min: 1, max: 5 })) })`, remaining balance must equal `allocation - sum(approvedDays)` and must never go below zero
    - **Validates: Requirements 13.3, 14.7**
    - Tag: `// Feature: learnova-advanced-features, Property 13–14`

  - [ ] 4.6 Checkpoint — ensure Sprint 4 tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Sprint 5: Communication & Admissions
  - [ ] 5.1 Build bulk broadcast page at `app/(app)/communications/broadcast/page.tsx`
    - Create `useBroadcastService.ts` with `previewMutation` POSTing to `BROADCAST_ENDPOINTS.PREVIEW_RECIPIENTS` and `sendMutation` POSTing to `BROADCAST_ENDPOINTS.SEND`
    - Two-step UI: (1) compose message + select recipient group (class parents or outstanding fees) → show estimated recipient count from preview; (2) confirm recipient count → send
    - Disable Send button if recipient count is zero; display "No recipients match the selected criteria" warning
    - On send success, display delivery summary toast with `{ sent, delivered, failed }` counts; invalidate `queryKeys.BROADCAST_HISTORY`
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6_

  - [ ] 5.2 Build notice board management page at `app/(app)/communications/notice-board/page.tsx`
    - Create `useNoticeBoardService.ts` with `useQuery` (keyed by `queryKeys.NOTICE_BOARD`), `createMutation`, `updateMutation`, `deleteMutation`, `pinMutation`, and `unpinMutation` using `NOTICE_BOARD_ENDPOINTS`
    - Also call `useNoticeBoardService` from the dashboard home page with `{ limit: 5, pinned: true }` to display the top 5 active announcements; add a "View All" link
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

  - [ ] 5.3 Build public application portal at `app/(public)/[tenantSlug]/admissions/apply/page.tsx`
    - Use `publicApiClient(tenantSlug)` from `lib/public-api-client.ts` — do NOT use the authenticated `api-client.ts`
    - Build a multi-field form with React Hook Form + Zod requiring: first name, last name, date of birth, gender, desired class level, guardian name, guardian phone, guardian email, and at least one document upload (PDF/JPG/PNG ≤ 5 MB)
    - Validate file type and size client-side before upload; display inline field-level errors
    - On successful submission, display the generated Application_Number with tracking instructions
    - _Requirements: 18.1, 18.2, 18.3, 18.5, 18.6, 18.7_

  - [ ] 5.4 Build public status tracking page at `app/(public)/[tenantSlug]/admissions/track/page.tsx`
    - Use `publicApiClient(tenantSlug)` to fetch `ADMISSIONS_EXTENDED_ENDPOINTS.PUBLIC_TRACK` with the entered Application_Number
    - Display current application status and relevant details; show a descriptive message for each status stage
    - _Requirements: 18.4_

  - [ ] 5.5 Build admission workflow admin page at `app/(app)/admissions/page.tsx` and `[id]/page.tsx`
    - Create `useAdmissionsWorkflowService.ts` with `useQuery` for all applications and `updateStatusMutation` PATCHing to `ADMISSIONS_EXTENDED_ENDPOINTS.UPDATE_STATUS`
    - Implement client-side `VALID_TRANSITIONS` guard before calling the mutation; reject invalid transitions with a validation error and leave status unchanged
    - On `offer-sent` transition, trigger offer letter generation; on `accepted` → `enrolled`, prompt admin to confirm enrollment which calls `ADMISSIONS_EXTENDED_ENDPOINTS.ENROLL`
    - Require rejection reason input when transitioning to `rejected`
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_

  - [ ] 5.6 Build document management on admission detail page
    - Create `useDocumentService.ts` with `uploadMutation` POSTing multipart form data to `ADMISSIONS_EXTENDED_ENDPOINTS.UPLOAD_DOCUMENT` and `deleteMutation` DELETEing `ADMISSIONS_EXTENDED_ENDPOINTS.DELETE_DOCUMENT`
    - Validate file type (PDF/JPG/PNG) and size (≤ 5 MB) client-side before upload; display inline error without making an API call if validation fails
    - Show confirmation prompt before delete; invalidate the admission detail query on success
    - _Requirements: 20.1, 20.2, 20.4, 20.5_

  - [ ]* 5.7 Write property-based tests for admission status transitions (P16) and notification scoping (P15)
    - Create `__tests__/admissions.test.ts`: **Property 16: Admission Status Forward-Only Transitions** — for any `fc.constantFrom(...AdmissionStatus values)` current status and any next status, only transitions in `VALID_TRANSITIONS[current]` must be accepted; all others must be rejected and status must remain unchanged
    - Create `__tests__/notifications.test.ts` (or extend existing): **Property 15: Notification Recipient Scoping** — for any `fc.array(fc.record({ userId: fc.string(), linkedStudentIds: fc.array(fc.string()) }))`, a notification triggered by event E must be delivered to exactly the users linked to E and no others
    - **Validates: Requirements 15.7, 19.7**
    - Tag: `// Feature: learnova-advanced-features, Property 15–16`

  - [ ] 5.8 Checkpoint — ensure Sprint 5 tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Sprint 6: Timetable & Scheduling
  - [ ] 6.1 Build class timetable builder page at `app/(app)/academics/timetable/page.tsx`
    - Create `useClassTimetableService.ts` with `useQuery` for the timetable (keyed by `[queryKeys.CLASS_TIMETABLE, classArmId]`), `saveSlotMutation` POSTing to `CLASS_TIMETABLE_ENDPOINTS.SAVE_SLOT`, `deleteSlotMutation`, and `publishMutation`
    - Before saving a slot, call `CLASS_TIMETABLE_ENDPOINTS.CHECK_CONFLICT` with `{ teacherId, day, period, classArmId }`; if `hasConflict: true`, show inline warning "Teacher [name] is already assigned to [conflictingArm] during this period" and block the save mutation
    - Render a 5×N grid (days × periods) where each cell is a `TimetableSlot`; support marking a slot as free period
    - Draft timetables are only visible to school admins; published timetables are visible to all users in the class arm
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6_

  - [ ] 6.2 Build exam timetable page at `app/(app)/academics/timetable/exam/page.tsx`
    - Create `useExamTimetableService.ts` with `useQuery` (keyed by `[queryKeys.EXAM_TIMETABLE, termId]`), `createMutation`, `updateMutation`, `deleteMutation`, and `publishMutation` using `EXAM_TIMETABLE_ENDPOINTS`
    - Client-side overlap check before saving: compare new entry's `(classArmId, date, startTime, endTime)` against existing entries in the query cache; display conflict warning if overlap detected
    - Display entries sorted by date and start time; on publish, invalidate `queryKeys.EXAM_TIMETABLE`
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 22.6_

  - [ ]* 6.3 Write property-based tests for teacher conflict invariant (P17) and published vs draft visibility (P18)
    - Create `__tests__/timetable.test.ts`: **Property 17: Teacher Conflict Invariant** — for any `fc.array(fc.record({ teacherId: fc.string(), day: fc.constantFrom("monday",...), period: fc.integer({ min: 1 }), classArmId: fc.string() }))`, no two slots in a published timetable may share the same `(teacherId, day, period)` with different `classArmId` values
    - Create `__tests__/visibility.test.ts`: **Property 18: Published vs Draft Visibility** — for any `fc.record({ isPublished: fc.boolean(), userRole: fc.constantFrom("school-admin", "teacher", "parent", "student") })`, when `isPublished == false` only `school-admin` may see the resource; when `isPublished == true` all roles in the target audience may see it
    - **Validates: Requirements 21.5, 21.6, 21.7, 22.2, 22.4**
    - Tag: `// Feature: learnova-advanced-features, Property 17–18`

  - [ ] 6.4 Checkpoint — ensure Sprint 6 tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Sprint 7: Parent & Student Experience
  - [ ] 7.1 Build result history page for parent portal at `app/(app)/parent/results/page.tsx`
    - Create `useParentResultHistoryService.ts` with `useQuery` fetching `RESULT_ENGINE_ENDPOINTS.GET_STUDENT` for the selected child ID (from `ChildSelectorContext`); filter client-side to only include records where `isPublished === true`
    - Group results by session client-side using `groupBy`; within each session list terms in chronological order
    - Display full subject breakdown (CA scores, exam score, total, grade, remark), overall position, and overall average when a term is selected
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

  - [ ] 7.2 Build result history page for student portal at `app/(app)/student/results/page.tsx`
    - Create `useStudentResultHistoryService.ts` with `useQuery` fetching `RESULT_ENGINE_ENDPOINTS.GET_STUDENT` scoped to `useAuthStore().user.id`; filter client-side to `isPublished === true` only
    - Same grouping and display logic as parent portal result history
    - _Requirements: 23.1, 23.2, 23.3, 23.4, 23.5_

  - [ ] 7.3 Build teacher assignments management page at `app/(app)/academics/assignments/page.tsx` (teacher view)
    - Create `useTeacherAssignmentService.ts` with `useQuery` (keyed by `queryKeys.ASSIGNMENTS`), `createMutation`, `updateMutation`, and `deleteMutation` using `ASSIGNMENTS_ENDPOINTS`
    - Build create/edit dialog requiring: title, description, class arm, subject, due date, max score, and optional file attachment (multipart upload)
    - _Requirements: 24.1, 24.2, 24.3_

  - [ ] 7.4 Build student assignments page at `app/(app)/student/assignments/page.tsx`
    - Create `useStudentAssignmentService.ts` with `useQuery` for assignments scoped to the student's class arm, sorted by due date
    - Add `submitMutation` POSTing multipart form data; detect late submission client-side (`new Date() > new Date(assignment.dueDate)`) and set `isLate: true` in the payload; display "Late Submission" indicator
    - Accept file uploads: PDF, DOC, DOCX, JPG, PNG up to 10 MB; validate client-side before upload
    - _Requirements: 24.4, 24.5, 24.7_

  - [ ] 7.5 Build teacher grading page for submissions
    - Add a Submissions view to the teacher assignments page showing all submissions per assignment
    - Add `gradeMutation` PATCHing to the submission endpoint with `{ score, feedback }`; validate `0 <= score <= assignment.maxScore` client-side before calling mutation
    - On grade success, send notification to student (backend-triggered); invalidate `queryKeys.ASSIGNMENTS`
    - _Requirements: 24.6, 24.8_

  - [ ]* 7.6 Write property-based tests for assignment score bounds (P19) and no duplicate notifications (P20)
    - Create `__tests__/assignments.test.ts`: **Property 19: Assignment Score Bounds Invariant** — for any `fc.record({ score: fc.float(), maxScore: fc.float({ min: 0 }) })`, any attempt to record a score where `score < 0` or `score > maxScore` must be rejected; valid scores in `[0, maxScore]` must be accepted
    - Create or extend `__tests__/notifications.test.ts`: **Property 20: No Duplicate Absence Notifications** — for any `fc.array(fc.record({ studentId: fc.string(), date: fc.string(), status: fc.constantFrom("absent", "present") }))`, regardless of how many times an "absent" record is saved for the same (studentId, date), exactly one notification must be sent
    - **Validates: Requirements 24.8, 25.4**
    - Tag: `// Feature: learnova-advanced-features, Property 19–20`

  - [ ] 7.7 Checkpoint — ensure Sprint 7 tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Sprint 8: Super Admin & Platform
  - [ ] 8.1 Build tenant onboarding wizard at `app/onboarding/`
    - Create `useOnboardingWizardService.ts` with `useQuery` for onboarding state (keyed by `queryKeys.ONBOARDING_STATE`) and `saveStepMutation` that persists step data to the backend after each Next click
    - On load, fetch current onboarding state and resume from the last completed step; redirect new tenants to the wizard on first login if onboarding is not complete
    - Build five step components: `SchoolProfileStep` (reuse `UpdateSchoolProfileForm`), `FeeStructureStep`, `ClassStructureStep`, `StaffSetupStep`, `FirstSessionStep`
    - Render a progress indicator showing complete/in-progress/pending steps; on all five steps complete, mark onboarding done and redirect to main dashboard
    - If a step save fails, stay on the current step and show a toast error; re-enable the Next button for retry
    - _Requirements: 26.1, 26.2, 26.3, 26.4, 26.5, 26.6_

  - [ ] 8.2 Build usage metrics page at `app/super-admin/tenants/usage/page.tsx`
    - Create `useSuperAdminMetricsService.ts` with `useQuery` (keyed by `[queryKeys.SUPER_ADMIN_USAGE, filters]`) fetching `SUPER_ADMIN_METRICS_ENDPOINTS.GET_USAGE`
    - Compute aggregate totals client-side from the usage array (total MRR = sum of all tenant MRR, etc.)
    - Render a sortable, filterable table with columns: tenant name, plan tier, student count, staff count, storage used (GB), last active date, MRR; support filtering by plan tier and status
    - Clicking a tenant row navigates to the tenant detail page
    - _Requirements: 27.1, 27.2, 27.3, 27.4, 27.5_

  - [ ] 8.3 Implement plan limit enforcement UI
    - In `useStudentService.createMutation.onError` and `useStaffService.createMutation.onError`, check for `statusCode === 403` and `message.includes("limit")`
    - When matched, render a `PlanLimitErrorDialog` component with the error message and a direct link to `/subscription` for upgrade
    - _Requirements: 28.1, 28.2, 28.4, 28.5_

  - [ ] 8.4 Build custom domain settings page at `app/(app)/settings/custom-domain/page.tsx`
    - Create `useCustomDomainService.ts` with `useQuery` (keyed by `queryKeys.CUSTOM_DOMAIN`) for current domain config and `saveDomainMutation` POSTing to `CUSTOM_DOMAIN_ENDPOINTS.SAVE`
    - On save success, display a DNS instructions dialog showing the CNAME record from `data.cnameRecord`
    - Add `verifyMutation` POSTing to `CUSTOM_DOMAIN_ENDPOINTS.VERIFY`; display "Domain Active" status when `status === "active"`
    - Display "This domain is already registered to another school" error on 409 from save
    - _Requirements: 29.1, 29.2, 29.4, 29.5_

  - [ ]* 8.5 Write property-based test for plan limit enforcement (P21)
    - Create `__tests__/plan-limits.test.ts`: **Property 21: Plan Limit Enforcement** — for any `fc.record({ currentCount: fc.integer({ min: 0 }), limit: fc.integer({ min: 0 }) })`, when `currentCount >= limit` the create mutation must be rejected with a 403 and `PlanLimitErrorDialog` must be shown; when `currentCount < limit` the mutation must proceed normally
    - **Validates: Requirements 28.1, 28.2, 28.5**
    - Tag: `// Feature: learnova-advanced-features, Property 21: Plan Limit Enforcement`

  - [ ] 8.6 Checkpoint — ensure Sprint 8 tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Sprint 9: Cross-Cutting
  - [ ] 9.1 Build audit trail page at `app/(app)/audit/page.tsx`
    - Create `useAuditTrailService.ts` with paginated `useQuery` using the existing `AUDIT_ENDPOINTS.GET_ALL` (keyed by `[queryKeys.AUDIT_LOGS, filters, page]`)
    - Add filter controls for actor, action type, resource type, and date range passed as query params; default page size of 25 entries
    - Render a read-only paginated data table; for deleted resources, display the last known state (name, ID) from the audit entry's `resourceSummary` field
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5, 30.6_

  - [ ] 9.2 Add CSV export buttons to Students, Results, Invoices, and Payments pages
    - In `useStudentService.ts`, add `exportMutation` calling `EXPORT_ENDPOINTS.STUDENTS` with current filters as a blob; trigger download via `triggerCsvDownload(blob, "students.csv")`
    - In `useResultEngineService.ts`, add `exportMutation` calling `EXPORT_ENDPOINTS.RESULTS` with `{ termId, classArmId }` as a blob; trigger download via `triggerCsvDownload(blob, "results.csv")`
    - In `useInvoicesService.ts`, add `exportMutation` calling `EXPORT_ENDPOINTS.INVOICES` with current filters as a blob; trigger download via `triggerCsvDownload(blob, "invoices.csv")`
    - In `usePaymentsService.ts`, add `exportMutation` calling `EXPORT_ENDPOINTS.PAYMENTS` with current filters as a blob; trigger download via `triggerCsvDownload(blob, "payments.csv")`
    - Add an Export CSV button to each respective page that calls the export mutation
    - _Requirements: 31.1, 31.2, 31.3, 31.4, 31.5_

  - [ ] 9.3 Build academic calendar page at `app/(app)/academics/calendar/page.tsx`
    - Create `useCalendarService.ts` with `useQuery` (keyed by `queryKeys.CALENDAR_EVENTS`), `createMutation`, `updateMutation`, `deleteMutation`, and `publishMutation` using `CALENDAR_ENDPOINTS`
    - Render a monthly calendar view using `react-day-picker` with a custom `DayContent` renderer showing colored dots per event type (term-start/end, exam-period, holiday, school-event)
    - Support switching between monthly and list views; clicking an event shows details in a popover
    - Only school admins see unpublished events; all authenticated users see published events
    - _Requirements: 32.1, 32.2, 32.3, 32.4, 32.5, 32.6_

  - [ ] 9.4 Add PWA manifest and service worker registration
    - Create `public/manifest.json` with `name`, `short_name`, icons (192×192 and 512×512 PNG), `theme_color`, `background_color`, `display: "standalone"`, and `start_url: "/"`
    - Register service worker in `app/layout.tsx` via a client component with `useEffect`; create `app/offline/page.tsx` as the offline fallback page
    - Add caching strategy for new routes (timetable, results, calendar): cache-first for static assets, network-first for API requests
    - _Requirements: 33.1, 33.2, 33.3, 33.4, 33.5_

  - [ ]* 9.5 Add PWA update banner component (optional)
    - Create `components/pwa/UpdateBanner.tsx` that detects a waiting service worker and displays a "New version available — click to update" banner; on confirmation, calls `registration.waiting.postMessage({ type: "SKIP_WAITING" })` and reloads the page
    - Register a `controllerchange` listener in the SW registration client component to trigger the banner
    - _Requirements: 33.6_

  - [ ]* 9.6 Write property-based tests for CSV export round-trip (P22) and service worker cache round-trip (P23)
    - Create `__tests__/csv-export.test.ts`: **Property 22: CSV Export Round-Trip** — for any `fc.array(fc.record({...student fields with fc.string() values}))`, parsing the exported CSV back using standard CSV parsing must produce records where every field value matches the source; no data loss, encoding corruption, or type coercion
    - Create `__tests__/pwa.test.ts`: **Property 23: Service Worker Cache Round-Trip** — for any `fc.record({ url: fc.webUrl(), body: fc.string() })`, a resource cached by the service worker and retrieved offline must have the same body content, status code, and content-type as the original fetch response
    - **Validates: Requirements 31.6, 33.7**
    - Tag: `// Feature: learnova-advanced-features, Property 22–23`

  - [ ] 9.7 Final checkpoint — ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP (PWA update banner 9.5, report card ZIP test 2.3, and all property-based test sub-tasks)
- Each sprint is self-contained and can be executed independently in order
- Property tests use `fast-check` with Vitest; each runs a minimum of 100 iterations
- All service hooks follow the pattern established by `useStaffService` and `useStudentService`
- All HTTP calls go through `lib/api-client.ts` (authenticated) or `lib/public-api-client.ts` (public admissions) — never import `axios` or `fetch` directly in pages
- The `publicApiClient` in Sprint 5 intentionally omits the 401 refresh interceptor
- Plan limit 403 errors in Sprint 8 are surfaced via `PlanLimitErrorDialog` — not a generic toast
