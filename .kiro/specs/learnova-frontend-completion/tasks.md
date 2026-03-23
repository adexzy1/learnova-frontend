# Implementation Plan: Learnova Frontend Completion

## Overview

Five self-contained sprints that progressively wire the Learnova frontend to real backend APIs,
build missing portal pages, and add polish. Each sprint can be executed independently in order.

## Tasks

- [x] 1. Sprint 1: API Foundation Layer
  - [x] 1.1 Add missing endpoint constants to `lib/api-routes.ts`
    - Append `GRADING_ENDPOINTS`, `ASSESSMENT_ENDPOINTS`, `ATTENDANCE_ENDPOINTS`, `RESULTS_ENDPOINTS`, `DISCIPLINE_ENDPOINTS`, `ADMISSIONS_ENDPOINTS`, `FINANCE_ENDPOINTS`, `COMMUNICATIONS_ENDPOINTS`, `NOTIFICATIONS_ENDPOINTS`, `REPORTS_ENDPOINTS`, `AUDIT_ENDPOINTS`, `SUPER_ADMIN_CONFIG_ENDPOINTS`, `ASSIGNMENTS_ENDPOINTS`, and `GUARDIAN_ENDPOINTS` constant objects
    - Each group must include all CRUD variants (GET_ALL, GET_BY_ID, CREATE, UPDATE, DELETE) plus any action-specific endpoints (e.g. PUBLISH, INIT_PAYMENT, MARK_READ)
    - _Requirements: 1.1_

  - [x] 1.2 Create `lib/api-client.ts` — axios wrapper
    - Import the existing `lib/axios-client.ts` instance (which already handles cookie-based 401 refresh-retry)
    - Add a request interceptor that reads `useAuthStore().token` and injects `Authorization: Bearer <token>`
    - Add a request interceptor that reads the tenant context and injects `X-Tenant-Slug: <slug>`
    - Add a response interceptor that catches 4xx/5xx errors and throws a normalized `ApiError` (`{ statusCode, message, errors? }`) — never a raw `AxiosError`
    - Export the configured instance as the default export; all service hooks must import from here
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 1.3 Create `app/constants/queryKeys.ts` — centralized query key constants
    - Export a `queryKeys` object with string constants for every module: `GRADING_SYSTEMS`, `ASSESSMENTS_CA`, `ASSESSMENTS_EXAM`, `EXAMINATIONS`, `TIMETABLE`, `ATTENDANCE`, `ATTENDANCE_SUMMARY`, `RESULTS`, `DISCIPLINE`, `ADMISSIONS`, `INVOICES`, `PAYMENTS`, `LEDGER`, `FEE_STRUCTURES`, `MESSAGES`, `NOTIFICATIONS`, `REPORTS`, `AUDIT_LOGS`, `SUPER_ADMIN_STATS`, `SUPER_ADMIN_CONFIG`, `ASSIGNMENTS`, `MY_CHILDREN`
    - _Requirements: 2.3_

  - [x] 1.4 Add missing types to `types/index.ts`
    - Add `ApiError` interface: `{ statusCode: number; message: string; errors?: Record<string, string[]> }`
    - Add `FeeStructure` interface with `id`, `name`, `description`, `amount`, `applicableClasses`, `termId`, `isActive`
    - Add `SubjectAssignment` interface with `id`, `subjectId`, `subjectName`, `teacherId`, `teacherName`, `classArmId`, `classArmName`
    - Add `PaystackInitResponse` interface with `authorizationUrl`, `reference`, `accessCode`
    - Add `ReportData` and related point interfaces (`AttendanceTrendPoint`, `FeeCollectionPoint`, `PerformancePoint`)
    - _Requirements: 1.5_

  - [x] 1.5 Write property-based tests for `api-client.ts`
    - Create `__tests__/api-client.test.ts` using `fast-check` and Vitest
    - **Property 1: Header Injection** — for any `fc.string()` token T and slug S stored in mocked stores, every request dispatched through `api-client` must contain `Authorization: Bearer T` and `X-Tenant-Slug: S`
    - **Property 2: Error Normalization** — for any `fc.integer({ min: 400, max: 599 })` status code, the thrown error must be an `ApiError` with numeric `statusCode`, non-empty `message`, and never a raw `AxiosError`
    - Tag: `// Feature: learnova-frontend-completion, Property 1: Header Injection` and `Property 2: Error Normalization`
    - _Requirements: 1.2, 1.3, 1.5_

  - [x] 1.6 Checkpoint — ensure Sprint 1 tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [ ] 2. Sprint 2: Core Academic Modules
  - [x] 2.1 Wire grading systems page to real API
    - Create `app/(app)/academics/grading/_service/useGradingService.ts`
    - Replace the inline `fetchGradingSystems` mock in `app/(app)/academics/grading/page.tsx` with a `useQuery` call using `apiClient` and `queryKeys.GRADING_SYSTEMS`
    - Add `createMutation`, `updateMutation`, and `setDefaultMutation` using `apiClient` + `GRADING_ENDPOINTS`; invalidate `queryKeys.GRADING_SYSTEMS` on success
    - Display `ApiError.message` in the form dialog on error without closing it
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 2.2 Wire assessments CA entry page to real API
    - Create `app/(app)/academics/assessments/ca/_service/useCAService.ts`
    - Replace `fetchClasses`, `fetchSubjects`, `fetchTerms` mocks with `useQuery` calls using `apiClient` and existing `CLASS_ENDPOINTS`, `SUBJECT_ENDPOINTS`, `TERM_ENDPOINTS`
    - Fetch previously saved CA scores for selected class/subject/term combination and pre-populate inputs
    - Replace `saveCAScores` stub with a `useMutation` POSTing to `ASSESSMENT_ENDPOINTS.CA_SCORES_SAVE`; invalidate `queryKeys.ASSESSMENTS_CA` on success
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 2.3 Wire assessments examinations page to real API
    - Create `app/(app)/academics/assessments/exams/_service/useExaminationsService.ts`
    - Replace `mockApi.getExaminations` and `mockApi.getSessions` with `useQuery` calls using `apiClient` and `ASSESSMENT_ENDPOINTS`
    - Add `createMutation` and `updateMutation`; invalidate `queryKeys.EXAMINATIONS` on success
    - _Requirements: 5.4, 5.5_

  - [x] 2.4 Wire assessments timetable page to real API
    - Create `app/(app)/academics/assessments/timetable/_service/useTimetableService.ts`
    - Remove hardcoded `MOCK_TIMETABLE` array; replace with `useQuery` using `apiClient` and `ASSESSMENT_ENDPOINTS.TIMETABLE_GET`
    - Add `createMutation`, `updateMutation`, `deleteMutation`; invalidate `queryKeys.TIMETABLE` on success
    - _Requirements: 5.6, 5.7_

  - [x] 2.5 Wire attendance page to real API
    - Create `app/(app)/attendance/_service/useAttendanceService.ts`
    - Fetch existing attendance for selected class + date on mount; pre-populate status buttons
    - Replace `saveAttendance` stub with a `useMutation` POSTing to `ATTENDANCE_ENDPOINTS.SAVE`; invalidate `queryKeys.ATTENDANCE` on success
    - Show read-only view with edit option when backend returns existing records for a date
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 2.6 Wire results page to real API
    - Create `app/(app)/results/_service/useResultsService.ts`
    - Replace `mockApi.getSessions` and `mockApi.getClasses` with `useQuery` calls using `apiClient`
    - Remove hardcoded results array; fetch results from `RESULTS_ENDPOINTS.GET_CLASS_RESULTS` when session/term/class are selected
    - Add `publishMutation` POSTing to `RESULTS_ENDPOINTS.PUBLISH`; invalidate `queryKeys.RESULTS` on success
    - _Requirements: 7.1, 7.2, 7.4, 7.7_

  - [x] 2.7 Wire discipline page to real API
    - Create `app/(app)/discipline/_service/useDisciplineService.ts`
    - Replace `fetchDisciplineIncidents` stub with `useQuery` using `apiClient` and `DISCIPLINE_ENDPOINTS.GET_ALL`
    - Add `createMutation` and `updateStatusMutation`; invalidate `queryKeys.DISCIPLINE` on success
    - _Requirements: 8.1, 8.2, 8.5_

  - [x] 2.8 Wire admissions page to real API
    - Create `app/(app)/admissions/_service/useAdmissionsService.ts`
    - Replace `fetchAdmissions` stub with `useQuery` using `apiClient` and `ADMISSIONS_ENDPOINTS.GET_ALL`
    - Add `updateStatusMutation` (approve/reject) PATCHing to `ADMISSIONS_ENDPOINTS.UPDATE_STATUS`; invalidate `queryKeys.ADMISSIONS` on success
    - _Requirements: 8.3, 8.4, 8.5_

  - [x] 2.9 Write property-based tests for results and cache invalidation
    - Create `__tests__/results.test.ts`
    - **Property 4: Result Score Computation** — for any `fc.array(fc.record({ caScores: fc.array(fc.float({ min: 0, max: 100 })), examScore: fc.float({ min: 0, max: 100 }) }))`, the displayed `totalScore` must equal sum of all `caScores[i].score` plus `examScore`
    - Create `__tests__/cache-invalidation.test.ts`
    - **Property 3: Cache Invalidation** — for any resource type from `fc.oneof(...)`, after a successful mutation the list query must reflect the change on next read
    - Tag each test with `// Feature: learnova-frontend-completion, Property N: <text>`
    - _Requirements: 2.1, 2.2, 7.3_

  - [x] 2.10 Checkpoint — ensure Sprint 2 tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Sprint 3: Finance Module
  - [x] 3.1 Wire finance invoices page to real API
    - Create `app/(app)/finance/invoices/_service/useInvoicesService.ts`
    - Replace `fetchInvoices` stub with `useQuery` using `apiClient` and `FINANCE_ENDPOINTS.INVOICES_GET_ALL`
    - Compute stats cards (Total Revenue, Outstanding, Collected, Active Invoices) from fetched invoice data — remove hardcoded ₦4.2M/₦1.8M/₦2.4M/145 values
    - Add `createMutation`; invalidate `queryKeys.INVOICES` on success
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 3.2 Wire finance payments page to real API
    - Create `app/(app)/finance/payments/_service/usePaymentsService.ts`
    - Replace `mockApi.getStudents`, `mockApi.getFeeTypes`, and hardcoded payments array with `useQuery` calls using `apiClient`
    - Add `recordPaymentMutation` POSTing to `FINANCE_ENDPOINTS.PAYMENTS_CREATE`; invalidate both `queryKeys.PAYMENTS` and `queryKeys.INVOICES` on success
    - _Requirements: 9.5, 9.6_

  - [x] 3.3 Wire finance ledger page to real API
    - Create `app/(app)/finance/ledger/_service/useLedgerService.ts`
    - Remove hardcoded `MOCK_TRANSACTIONS`; replace with `useQuery` using `apiClient` and `FINANCE_ENDPOINTS.LEDGER_GET`
    - Compute summary stats (Total Income, Total Expenses, Net Flow) from fetched transaction data — remove hardcoded values
    - Net Flow = sum of credit amounts minus sum of debit amounts
    - _Requirements: 9.7, 9.8, 9.9_

  - [x] 3.4 Build fee structure management page at `/finance/fee-structure`
    - Create `app/(app)/finance/fee-structure/page.tsx` (new page)
    - Create `app/(app)/finance/fee-structure/_service/useFeeStructureService.ts` with `useQuery` for list and `createMutation`, `updateMutation`, `deleteMutation`
    - Create `app/(app)/finance/fee-structure/_components/` with a data table (columns: name, description, applicable classes, amount, active status) and add/edit/delete dialogs
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 3.5 Build subject-teacher-class assignment page at `/academics/assignments`
    - Create `app/(app)/academics/assignments/page.tsx` (new page)
    - Create `app/(app)/academics/assignments/_service/useAssignmentsService.ts` with `useQuery` for list and `createMutation`, `deleteMutation`
    - Create `app/(app)/academics/assignments/_components/` with a searchable/filterable table (columns: teacher name, subject name, class arm) and assign/delete dialogs
    - On duplicate assignment attempt (same subjectId + classArmId), display validation error and leave list unchanged
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [x] 3.6 Write property-based tests for finance stats and duplicate assignment prevention
    - Create `__tests__/finance-stats.test.ts`
    - **Property 5: Finance Stats Invariant** — for any `fc.array(fc.record({ paidAmount: fc.float({ min: 0 }), balance: fc.float({ min: 0 }), status: fc.constantFrom('unpaid','partial','paid','overdue') }))`, displayed total revenue must equal sum of `paidAmount` and outstanding must equal sum of `balance` for unpaid/partial/overdue invoices
    - Create `__tests__/assignments.test.ts`
    - **Property 10: Duplicate Assignment Prevention** — for any `fc.tuple(fc.string(), fc.string())` pair (subjectId, classArmId), a second create attempt for the same pair must be rejected and the list must remain unchanged
    - _Requirements: 9.3, 9.9, 11.4_

  - [x] 3.7 Checkpoint — ensure Sprint 3 tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Sprint 4: Parent Portal + Student Portal
  - [x] 4.1 Build parent portal layout with ChildSelectorContext
    - Create `app/(app)/parent/layout.tsx` with a `ChildSelectorContext` provider
    - Context shape: `{ children: Student[], selectedChildId: string | null, setSelectedChildId: (id: string) => void, isLoading: boolean }`
    - Fetch guardian's linked children once via `GUARDIAN_ENDPOINTS.GET_MY_CHILDREN` using `useQuery`; populate context
    - Render a child selector UI (dropdown or tab strip) visible on all parent portal pages
    - _Requirements: 12.1, 12.3_

  - [x] 4.2 Build `/parent/children` page
    - Create `app/(app)/parent/children/page.tsx`
    - List all students from `ChildSelectorContext`; each card shows name, class, admission number
    - Clicking a card navigates to child detail view
    - Show empty state with guidance if no children are linked
    - _Requirements: 12.1, 12.2, 12.4, 12.5_

  - [x] 4.3 Build `/parent/results` page
    - Create `app/(app)/parent/results/page.tsx`
    - Fetch published `TermResult` for `selectedChildId` + selected term from `RESULTS_ENDPOINTS.GET_STUDENT_RESULT`
    - Show subject breakdown (CA scores, exam score, total, grade) and overall position/average when published
    - Show "Results not yet available" message when result is not published or not found
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [x] 4.4 Build `/parent/attendance` page
    - Create `app/(app)/parent/attendance/page.tsx`
    - Fetch attendance summary and records for `selectedChildId` from `ATTENDANCE_ENDPOINTS.GET_SUMMARY`
    - Display summary stats (total days, present, absent, late, excused, percentage) and a color-coded calendar view
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [x] 4.5 Build `/parent/payments` page with Paystack flow
    - Create `app/(app)/parent/payments/page.tsx`
    - Fetch invoices for `selectedChildId` from `FINANCE_ENDPOINTS.INVOICES_GET_ALL`
    - Create `usePaystackPayment(invoiceId)` hook: calls `FINANCE_ENDPOINTS.INIT_PAYMENT` to get `authorizationUrl`, opens Paystack modal via `@paystack/inline-js`
    - On modal close: invalidate `queryKeys.INVOICES` — do NOT call any record-payment endpoint
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

  - [x] 4.6 Build `/parent/messages` page
    - Create `app/(app)/parent/messages/page.tsx`
    - Fetch messages scoped to authenticated guardian from `COMMUNICATIONS_ENDPOINTS.MESSAGES_GET`
    - Add compose and reply mutations; invalidate `queryKeys.MESSAGES` on success
    - Mark message as read on open via PATCH; decrease unread badge count
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

  - [x] 4.7 Wire parent dashboard to real API
    - In `components/dashboards/parent-dashboard.tsx`, replace hardcoded `MY_CHILDREN` array with data from `ChildSelectorContext`
    - Replace hardcoded stats (₦25,000 outstanding, 95% attendance, "2 New" messages) with values fetched from `GUARDIAN_ENDPOINTS.GET_CHILD_STATS` for the selected child
    - _Requirements: 17.1, 17.2, 17.3_

  - [x] 4.8 Build `/student/results` page
    - Create `app/(app)/student/results/page.tsx`
    - Fetch `TermResult` for `useAuthStore().user.id` + selected term from `RESULTS_ENDPOINTS.GET_STUDENT_RESULT`
    - Show subject breakdown when published; show "Results not yet published" when not
    - _Requirements: 18.1, 18.2, 18.3_

  - [x] 4.9 Build `/student/attendance` page
    - Create `app/(app)/student/attendance/page.tsx`
    - Fetch attendance records scoped to `useAuthStore().user.id` from `ATTENDANCE_ENDPOINTS.GET_SUMMARY`
    - Display summary stats and color-coded calendar view
    - _Requirements: 18.4, 18.5_

  - [x] 4.10 Build `/student/exams` page
    - Create `app/(app)/student/exams/page.tsx`
    - Fetch exam timetable for the student's class from `ASSESSMENT_ENDPOINTS.TIMETABLE_GET`
    - Display upcoming exams in a table/card list sorted by date
    - _Requirements: 18.6, 18.7_

  - [x] 4.11 Wire student dashboard to real API
    - In `components/dashboards/student-dashboard.tsx`, replace hardcoded `CURRENT_STUDENT_ID = "student-1"` with `useAuthStore().user.id`
    - Replace hardcoded GPA/average with values computed from fetched current-term results
    - Replace hardcoded attendance stat (96%, "Present 48/50 days") with data from `ATTENDANCE_ENDPOINTS.GET_SUMMARY`
    - Replace hardcoded schedule with data from `ASSESSMENT_ENDPOINTS.TIMETABLE_GET` for the student's class
    - _Requirements: 19.1, 19.2, 19.3, 19.4_

  - [x] 4.12 Write property-based tests for portal data isolation and Paystack integrity
    - Create `__tests__/parent-isolation.test.ts`
    - **Property 6: Parent Portal Data Isolation** — for any `fc.array(fc.record({ guardianId: fc.string(), studentId: fc.string() }))`, rendered data must only include students whose guardian record references the authenticated guardian's ID
    - Create `__tests__/student-isolation.test.ts`
    - **Property 7: Student Portal Data Isolation** — for any `fc.string()` student ID, all fetched data must have `studentId` equal to the authenticated user's ID
    - Create `__tests__/paystack.test.ts`
    - **Property 8: Paystack Payment Integrity** — for any `fc.record({ invoiceId: fc.string(), amount: fc.float({ min: 1 }) })`, the frontend must call initialize-payment, open the modal, and must NOT call record-payment after modal close
    - _Requirements: 12.3, 13.5, 14.4, 15.3, 15.4, 15.5, 15.6, 18.8_

  - [x] 4.13 Checkpoint — ensure Sprint 4 tests pass
    - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Sprint 5: Communications, Reports, Super Admin, Polish
  - [x] 5.1 Wire communications messages page to real API
    - Create `app/(app)/communications/messages/_service/useMessagesService.ts`
    - Replace `fetchMessages` stub with `useQuery` using `apiClient` and `COMMUNICATIONS_ENDPOINTS.MESSAGES_GET`
    - Add `sendMutation`, `replyMutation`, and `markReadMutation`; invalidate `queryKeys.MESSAGES` on success
    - _Requirements: 21.1, 21.2, 21.3, 21.4_

  - [x] 5.2 Build `/notifications` page
    - Create `app/(app)/notifications/page.tsx`
    - Create `app/(app)/notifications/_service/useNotificationsService.ts` with `useQuery` for list, `markReadMutation`, and `markAllReadMutation`
    - Display notifications in reverse chronological order; visually distinguish unread from read
    - Add filter control by type (info, warning, success, error)
    - Render notification items with `link` field as clickable navigation links
    - _Requirements: 20.1, 20.2, 20.5, 20.6_

  - [x] 5.3 Wire topbar notification badge to real unread count
    - In `components/layout/topbar.tsx`, add a `useQuery` for notifications using `queryKeys.NOTIFICATIONS`
    - Derive unread count as `notifications.filter(n => !n.isRead).length`
    - `markReadMutation` and `markAllReadMutation` from `useNotificationsService` must invalidate `queryKeys.NOTIFICATIONS` so the badge updates automatically
    - _Requirements: 20.3, 20.4, 20.7_

  - [x] 5.4 Wire reports page to real API
    - Create `app/(app)/reports/_service/useReportsService.ts`
    - Replace hardcoded `ATTENDANCE_DATA`, `FINANCE_DATA`, `PERFORMANCE_DATA` arrays with `useQuery` calls to `REPORTS_ENDPOINTS.ATTENDANCE_TREND`, `REPORTS_ENDPOINTS.FEE_COLLECTION`, `REPORTS_ENDPOINTS.PERFORMANCE`
    - Pass current term as query param; display existing Recharts charts with real data
    - _Requirements: 22.1 (implied)_

  - [x] 5.5 Wire super-admin dashboard to real tenant stats API
    - In `app/super-admin/page.tsx` (or dashboard component), replace hardcoded values (12 tenants, 10 active subscriptions, $12,450 revenue, 3 pending onboarding) with a `useQuery` call to the tenant stats endpoint
    - _Requirements: 4.1_

  - [x] 5.6 Build super-admin audit log page
    - Create `app/super-admin/audit/page.tsx`
    - Create `app/super-admin/audit/_service/useAuditService.ts` with paginated `useQuery` using `AUDIT_ENDPOINTS.GET_ALL`
    - Render a paginated data table of audit log entries (action, user, timestamp, details)
    - Show descriptive error state if endpoint is unavailable
    - _Requirements: 4.2, 4.4_

  - [x] 5.7 Build super-admin config page
    - Create `app/super-admin/config/page.tsx`
    - Fetch config via `SUPER_ADMIN_CONFIG_ENDPOINTS.GET`; pre-populate form fields
    - Save changes via `PATCH SUPER_ADMIN_CONFIG_ENDPOINTS.UPDATE` using `useMutation`
    - Show descriptive error state if endpoint is unavailable
    - _Requirements: 4.3, 4.4_

  - [x] 5.8 Add `loading.tsx` and `error.tsx` for major route groups
    - Create `app/(app)/loading.tsx` — full-page skeleton
    - Create `app/(app)/error.tsx` — error boundary displaying `ApiError.message` with a "Try Again" reset button
    - Create `app/super-admin/loading.tsx` and `app/super-admin/error.tsx`
    - Create `app/onboarding/loading.tsx` and `app/onboarding/error.tsx`
    - Create `loading.tsx` files for key sub-routes: `finance/invoices/`, `finance/payments/`, `finance/ledger/`, `results/`, `attendance/`, `discipline/`, `admissions/`
    - _Requirements: 4.4, 5.7 (implied)_

  - [x] 5.9 ~~Add dark mode toggle~~ — SKIPPED (schools bring their own brand colors)

  - [x] 5.10 ~~Add PWA support~~ — SKIPPED (optional for MVP)

  - [x] 5.11 Write property-based tests for notifications
    - Create `__tests__/notifications.test.ts`
    - **Property 9: Notification Unread Count Invariant** — for any `fc.array(fc.boolean())` representing `isRead` values, `displayed_unread_count` must equal `count(n where isRead == false)`; after marking one read the count decreases by 1; after marking all read the count is 0
    - Create `__tests__/theme.test.ts`
    - **Property 11: Theme Persistence Round-Trip** — for any `fc.constantFrom("light", "dark")` theme T, after a simulated page reload the active theme read from `localStorage` must equal T regardless of OS color scheme
    - _Requirements: 20.3, 20.4, 20.7, 24.2 (implied)_

  - [x] 5.12 Final checkpoint — ensure all tests pass
    - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP (only Sprint 5 task 10 — PWA)
- Each sprint is self-contained and can be executed independently in order
- Property tests use `fast-check` with Vitest; each runs a minimum of 100 iterations
- All service hooks follow the pattern established by `useStaffService` and `useStudentService`
- All HTTP calls go through `lib/api-client.ts` — never import `axios` or `fetch` directly in pages
- Backend stubs (assessment, attendance, results, discipline, admissions) return placeholder data — pages must handle empty states gracefully
