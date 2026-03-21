# Requirements Document

## Introduction

Learnova is a multi-tenant SaaS school management system built with Next.js 16, React 19, TypeScript,
TanStack Query, Zustand, React Hook Form + Zod, shadcn/ui, Tailwind CSS v4, and Recharts.

A significant portion of the frontend is already implemented with real API integration (Sessions, Terms,
Classes, Subjects, Students, Staff, Settings, Subscription, Onboarding, Super Admin Schools). However,
roughly half the application still uses inline mock functions, hardcoded arrays, or `mockApi` calls
instead of real backend endpoints.

This document specifies the requirements to complete the frontend by:
1. Establishing a proper API foundation layer
2. Wiring all partially-implemented pages to real backend endpoints
3. Building the missing Parent Portal and Student Portal pages
4. Adding the Notifications center, Communications wiring, and Reports analytics
5. Polishing with error/loading boundaries, dark mode, and PWA support

The backend (NestJS) has working endpoints for auth, sessions, terms, classes, subjects, grading,
students, staff, guardians, settings, roles, subscriptions, onboarding, and tenants. Assessment,
attendance, finance, results, discipline, admissions, communications, and reports services are
stubbed on the backend and will return placeholder data until fully implemented — the frontend
must handle these gracefully with proper loading and empty states.


## Glossary

- **API_Client**: The centralized HTTP client module (`lib/api-client.ts`) responsible for all
  outbound requests, auth header injection, tenant slug injection, and error normalization.
- **API_Routes**: The constants file (`lib/api-routes.ts`) that holds all backend endpoint path strings.
- **TanStack_Query**: The server-state management library used for data fetching, caching, and
  cache invalidation throughout the application.
- **Tenant_Slug**: The subdomain or path segment that identifies the school tenant, injected into
  every API request header as `X-Tenant-Slug`.
- **Auth_Token**: The JWT access token stored in the auth store (Zustand), injected as
  `Authorization: Bearer <token>` into every API request.
- **Grading_System**: A named set of grade bands (letter, minScore, maxScore, GPA, remark) used
  to derive a student's letter grade from a numeric total score.
- **CA_Score**: A Continuous Assessment score entered by a teacher for a specific student, subject,
  term, and CA component (e.g. CA1, CA2).
- **Exam_Score**: The terminal examination score for a student in a specific subject and term.
- **Term_Result**: The computed academic result for a student in a term, comprising all CA scores,
  exam score, total, average, grade, and rank.
- **Invoice**: A billing document issued to a student for one or more fee items in a term.
- **Fee_Structure**: The set of fee types and amounts applicable to a class or all classes for a term.
- **Ledger**: The general financial ledger recording all credit (income) and debit (expense) entries.
- **Guardian**: A parent or legal guardian linked to one or more students.
- **Parent_Portal**: The set of pages accessible to users with the `parent` persona, scoped to
  their linked children only.
- **Student_Portal**: The set of pages accessible to users with the `student` persona, scoped to
  their own data only.
- **Notification**: A system-generated alert delivered to a user about an event (result published,
  fee due, message received, etc.).
- **Paystack**: The payment gateway used for online fee payments by parents and subscription
  payments by school admins.
- **Webhook**: A server-to-server HTTP callback from Paystack to the backend confirming payment
  success, used as the authoritative source of truth for recording payments.
- **PWA**: Progressive Web App — a web application that can be installed on a device and supports
  offline access via a service worker and web manifest.
- **Super_Admin**: A system-level administrator who manages all tenants, plans, and platform config.
- **Audit_Log**: A tamper-evident record of user actions (login, data changes, deletions) stored
  by the backend and displayed in the super-admin audit page.


## Requirements

---

### Requirement 1: API Foundation Layer

**User Story:** As a frontend developer, I want a centralized API client and complete endpoint
constants, so that all pages use consistent auth, tenant injection, and error handling without
duplicating HTTP logic.

#### Acceptance Criteria

1. THE API_Routes SHALL define endpoint path constants for all missing modules: grading systems,
   assessments (CA scores, exam scores, timetable), attendance, results, finance (invoices,
   payments, ledger, fee structures), discipline, admissions, communications (messages),
   notifications, reports, and super-admin audit logs.

2. THE API_Client SHALL inject the Auth_Token as `Authorization: Bearer <token>` into every
   outbound HTTP request header.

3. THE API_Client SHALL inject the Tenant_Slug as an `X-Tenant-Slug` header into every outbound
   HTTP request that targets a tenant-scoped endpoint.

4. WHEN the backend returns a 401 Unauthorized response, THE API_Client SHALL attempt a token
   refresh using the refresh endpoint and retry the original request exactly once before
   redirecting the user to the login page.

5. WHEN the backend returns a 4xx or 5xx error, THE API_Client SHALL normalize the error into a
   consistent `ApiError` shape containing `statusCode`, `message`, and optional `errors` array,
   so that all pages can display meaningful error messages without parsing raw HTTP responses.

6. THE API_Client SHALL be the single HTTP abstraction used by all TanStack_Query query functions
   and mutation functions throughout the application — no page SHALL import `fetch` or `axios`
   directly.

7. FOR ALL requests made through the API_Client, THE API_Client SHALL include the correct
   Auth_Token and Tenant_Slug in the request headers (round-trip property: token set in store →
   request sent → headers contain that token).


---

### Requirement 2: Cache Invalidation Consistency

**User Story:** As a user, I want list pages to always reflect the latest data after I create,
update, or delete a record, so that I never see stale information.

#### Acceptance Criteria

1. WHEN a create, update, or delete mutation succeeds on any resource, THE TanStack_Query cache
   for the corresponding list query key SHALL be invalidated so the list refetches automatically.

2. FOR ALL list pages (grading systems, assessments, attendance, results, finance, discipline,
   admissions, communications, notifications), after any successful mutation THE page SHALL
   display the updated list without requiring a manual page refresh.

3. THE TanStack_Query query keys SHALL follow the convention defined in
   `app/constants/queryKeys.ts` — no page SHALL use ad-hoc string literals as query keys.

---

### Requirement 3: Grading System API Wiring

**User Story:** As a school admin, I want the Grading Systems page to save and load data from
the real backend, so that grading configurations persist across sessions.

#### Acceptance Criteria

1. WHEN the Grading Systems page loads, THE Grading_System list SHALL be fetched from the
   backend via `GET /academics/grading-system` using TanStack_Query.

2. WHEN a user submits the create grading system form, THE API_Client SHALL POST the payload to
   `/academics/grading-system` and THE TanStack_Query cache for grading systems SHALL be
   invalidated on success.

3. WHEN a user submits the edit grading system form, THE API_Client SHALL PATCH the payload to
   `/academics/grading-system/:id` and THE TanStack_Query cache SHALL be invalidated on success.

4. IF the backend returns an error when saving a grading system, THEN THE Grading_System form
   SHALL display the error message returned by the API_Client without closing the dialog.

5. THE inline `fetchGradingSystems` mock function in `app/(app)/academics/grading/page.tsx`
   SHALL be removed and replaced with a TanStack_Query `useQuery` call using the API_Client.


---

### Requirement 4: Super Admin Dashboard and Stub Pages

**User Story:** As a super admin, I want the dashboard to show real tenant statistics and the
audit log to show real system events, so that I can monitor the platform accurately.

#### Acceptance Criteria

1. WHEN the Super Admin Dashboard loads, THE Super_Admin dashboard stats (total tenants, active
   subscriptions, total revenue, pending onboarding) SHALL be fetched from the backend tenant
   stats API and displayed — the hardcoded values (12, 10, $12,450, 3) SHALL be removed.

2. WHEN the Super Admin Audit Log page loads, THE Audit_Log entries SHALL be fetched from the
   backend via `GET /audit` with pagination support, replacing the hardcoded `AUDIT_LOGS` array.

3. WHEN the Super Admin Config page loads, THE system configuration values SHALL be fetched from
   the backend and pre-populated in the form fields — the form SHALL save changes via the API.

4. IF the backend audit or config endpoint is unavailable, THEN THE Super_Admin pages SHALL
   display a descriptive error state rather than an empty or broken UI.

---

### Requirement 5: Assessment Module Wiring

**User Story:** As a teacher, I want to enter CA scores and exam scores against real backend
data, so that student assessments are persisted and available for result computation.

#### Acceptance Criteria

1. WHEN the CA Entry page loads, THE class, subject, and term dropdowns SHALL be populated from
   the real backend APIs (classes, subjects, terms) — the `fetchClasses`, `fetchSubjects`, and
   `fetchTerms` mock calls SHALL be replaced with API_Client calls.

2. WHEN a teacher selects a class, subject, and term, THE CA Entry page SHALL fetch any
   previously saved CA scores for that combination from the backend and pre-populate the score
   inputs.

3. WHEN a teacher clicks Save Scores, THE API_Client SHALL POST the score entries to the
   assessments CA endpoint and THE TanStack_Query cache for CA scores SHALL be invalidated.

4. WHEN the Examinations page loads, THE examination list SHALL be fetched from the backend via
   the assessments exams endpoint — the `mockApi.getExaminations` and `mockApi.getSessions`
   calls SHALL be replaced.

5. WHEN a user creates or edits an examination, THE API_Client SHALL POST or PATCH to the
   backend and THE TanStack_Query cache SHALL be invalidated on success.

6. WHEN the Timetable page loads, THE exam timetable entries SHALL be fetched from the backend —
   the hardcoded `MOCK_TIMETABLE` array SHALL be removed.

7. IF the assessment backend endpoints return placeholder data (backend stubs not yet complete),
   THEN THE assessment pages SHALL display an appropriate empty state with a message indicating
   data is not yet available, rather than crashing or showing stale mock data.


---

### Requirement 6: Attendance Module Wiring

**User Story:** As a teacher, I want attendance records to be saved to and loaded from the real
backend, so that attendance history is accurate and reportable.

#### Acceptance Criteria

1. WHEN the Attendance page loads with a class and date selected, THE previously saved attendance
   records for that class and date SHALL be fetched from the backend and used to pre-populate
   the attendance status buttons.

2. WHEN a teacher clicks Save Attendance, THE API_Client SHALL POST the attendance records to
   the backend attendance endpoint — the `saveAttendance` stub in `lib/api` SHALL be replaced
   with a real API_Client call.

3. WHEN the backend returns existing attendance for a date, THE Attendance page SHALL display
   those records as read-only with an option to edit, preventing accidental duplicate submissions.

4. IF the attendance backend endpoint returns a stub response, THEN THE Attendance page SHALL
   display an empty state and allow the teacher to mark attendance, saving locally as a draft
   until the backend is ready.

---

### Requirement 7: Results Module Wiring

**User Story:** As a school admin, I want to view, compute, and publish student results from
real backend data, so that result management is accurate and auditable.

#### Acceptance Criteria

1. WHEN the Results page loads, THE session and class dropdowns SHALL be populated from the real
   backend — the `mockApi.getSessions` and `mockApi.getClasses` calls SHALL be replaced.

2. WHEN a session, term, and class are selected, THE student results list SHALL be fetched from
   the backend results endpoint and displayed in the results table.

3. FOR ALL displayed Term_Result records, THE total score shown SHALL equal the sum of all
   CA_Score values plus the Exam_Score for that student and subject, as computed by the backend.

4. WHEN a school admin clicks Publish Results for a class and term, THE API_Client SHALL POST
   to the results publish endpoint and THE results SHALL be marked as published in the backend.

5. WHEN results are published, THE student and parent portals SHALL be able to view those results.

6. WHEN results are not yet published, THE student and parent portals SHALL NOT display those
   results — the portal pages SHALL show a "Results not yet published" message.

7. THE hardcoded results array in `app/(app)/results/page.tsx` SHALL be removed entirely.


---

### Requirement 8: Discipline and Admissions Wiring

**User Story:** As a school admin, I want discipline incidents and admission applications to be
loaded from and saved to the real backend, so that these records are persistent and accurate.

#### Acceptance Criteria

1. WHEN the Discipline page loads, THE incident list SHALL be fetched from the backend via the
   discipline endpoint — the `fetchDisciplineIncidents` stub SHALL be replaced with a real
   API_Client call.

2. WHEN a staff member submits the Report Incident form, THE API_Client SHALL POST the incident
   to the backend and THE TanStack_Query cache for discipline incidents SHALL be invalidated.

3. WHEN the Admissions page loads, THE application list SHALL be fetched from the backend via
   the admissions endpoint — the `fetchAdmissions` stub SHALL be replaced with a real
   API_Client call.

4. WHEN an admin approves or rejects an application from the detail dialog, THE API_Client SHALL
   PATCH the application status to the backend and THE TanStack_Query cache SHALL be invalidated.

5. IF the discipline or admissions backend endpoints return stub data, THEN THE pages SHALL
   display an appropriate empty state rather than crashing.

---

### Requirement 9: Finance Module Wiring

**User Story:** As a finance officer, I want invoices, payments, and ledger entries to be loaded
from the real backend, so that financial records are accurate and the stats cards reflect reality.

#### Acceptance Criteria

1. WHEN the Invoices page loads, THE invoice list SHALL be fetched from the backend via the
   finance invoices endpoint — the `fetchInvoices` stub SHALL be replaced with a real
   API_Client call.

2. THE invoice stats cards (Total Revenue, Outstanding, Collected, Active Invoices) SHALL be
   computed from the fetched invoice data — the hardcoded values (₦4.2M, ₦1.8M, ₦2.4M, 145)
   SHALL be removed.

3. FOR ALL invoice stats displayed, THE Total Revenue value SHALL equal the sum of `paidAmount`
   across all invoices, and the Outstanding value SHALL equal the sum of `balance` across all
   unpaid and partial invoices.

4. WHEN a finance officer creates an invoice via the Create Invoice dialog, THE API_Client SHALL
   POST to the invoices endpoint and THE TanStack_Query cache SHALL be invalidated.

5. WHEN the Payments page loads, THE payment records SHALL be fetched from the backend —
   the `mockApi.getStudents`, `mockApi.getFeeTypes`, and hardcoded payments array SHALL be
   replaced with real API_Client calls.

6. WHEN a finance officer records a payment via the Record Payment dialog, THE API_Client SHALL
   POST to the payments endpoint and THE TanStack_Query cache for both payments and invoices
   SHALL be invalidated.

7. WHEN the Ledger page loads, THE transaction list SHALL be fetched from the backend ledger
   endpoint — the hardcoded `MOCK_TRANSACTIONS` array SHALL be removed.

8. THE ledger summary stats (Total Income, Total Expenses, Net Flow) SHALL be computed from the
   fetched transaction data — the hardcoded values SHALL be removed.

9. FOR ALL ledger summaries, THE Net Flow value SHALL equal Total Income minus Total Expenses
   as computed from the fetched transaction records.


---

### Requirement 10: Fee Structure Management Page

**User Story:** As a finance officer, I want a dedicated page to create and manage fee types and
fee structures per class and term, so that invoices can be generated from a defined fee schedule.

#### Acceptance Criteria

1. THE system SHALL provide a Fee Structure page at `/finance/fee-structure` that lists all
   defined fee types fetched from the backend.

2. WHEN a finance officer creates a new fee type via the Add Fee Type dialog, THE API_Client
   SHALL POST to the fee structure endpoint and THE TanStack_Query cache SHALL be invalidated.

3. WHEN a finance officer edits a fee type, THE API_Client SHALL PATCH to the fee structure
   endpoint and THE TanStack_Query cache SHALL be invalidated.

4. WHEN a finance officer deletes a fee type, THE API_Client SHALL DELETE from the fee structure
   endpoint and THE TanStack_Query cache SHALL be invalidated.

5. THE Fee Structure page SHALL display each fee type's name, description, applicable classes,
   amount, and active status.

---

### Requirement 11: Subject-Teacher-Class Assignment Page

**User Story:** As a school admin, I want to assign subjects to teachers and classes, so that
teachers know which subjects they teach and the system can scope CA entry correctly.

#### Acceptance Criteria

1. THE system SHALL provide a Subject Assignment page at `/academics/assignments` that displays
   the current subject-teacher-class assignments fetched from the backend.

2. WHEN an admin creates a new assignment via the Assign Subject dialog, THE API_Client SHALL
   POST the assignment (subjectId, teacherId, classArmId) to the backend and THE TanStack_Query
   cache SHALL be invalidated.

3. WHEN an admin removes an assignment, THE API_Client SHALL DELETE the assignment from the
   backend and THE TanStack_Query cache SHALL be invalidated.

4. IF an admin attempts to assign the same subject to the same class arm more than once, THEN
   THE system SHALL display a validation error and prevent the duplicate assignment.

5. THE Subject Assignment page SHALL display teacher name, subject name, and class arm name for
   each assignment in a searchable, filterable table.


---

### Requirement 12: Parent Portal — Children List

**User Story:** As a parent, I want to see a list of my linked children with their profile
summaries, so that I can quickly navigate to any child's information.

#### Acceptance Criteria

1. THE system SHALL provide a Children page at `/parent/children` that lists all students linked
   to the authenticated Guardian.

2. WHEN the Children page loads, THE Guardian's linked students SHALL be fetched from the backend
   guardians endpoint — the hardcoded `MY_CHILDREN` array in `parent-dashboard.tsx` SHALL be
   replaced with a real API_Client call.

3. FOR ALL data displayed on the Parent_Portal, THE data SHALL only include students whose
   guardian record references the authenticated Guardian's user ID — no other students' data
   SHALL be accessible.

4. WHEN a parent clicks on a child's profile card, THE system SHALL navigate to that child's
   detail view showing class, admission number, and class teacher.

5. IF the authenticated Guardian has no linked students, THEN THE Children page SHALL display
   an empty state with guidance to contact the school admin.

---

### Requirement 13: Parent Portal — Results

**User Story:** As a parent, I want to view my child's published term results, so that I can
monitor their academic progress.

#### Acceptance Criteria

1. THE system SHALL provide a Results page at `/parent/results` where a parent can select a
   child and view their published Term_Result records.

2. WHEN a parent selects a child and a term, THE Term_Result for that child and term SHALL be
   fetched from the backend results endpoint.

3. WHILE a Term_Result is not published, THE Parent_Portal results page SHALL display a
   "Results not yet available" message and SHALL NOT show any score data.

4. WHEN a Term_Result is published, THE Parent_Portal results page SHALL display the subject
   breakdown (CA scores, exam score, total, grade) and the overall position and average.

5. FOR ALL results displayed in the Parent_Portal, THE data SHALL be scoped to the selected
   child who is linked to the authenticated Guardian — results for other students SHALL NOT
   be accessible.


---

### Requirement 14: Parent Portal — Attendance

**User Story:** As a parent, I want to view my child's attendance summary and calendar, so that
I can track their school attendance.

#### Acceptance Criteria

1. THE system SHALL provide an Attendance page at `/parent/attendance` where a parent can select
   a child and view their attendance records for the current term.

2. WHEN a parent selects a child, THE attendance summary (total days, present, absent, late,
   excused, attendance percentage) SHALL be fetched from the backend attendance endpoint.

3. THE Parent_Portal attendance page SHALL display a calendar view highlighting each school day
   with a color-coded status (present, absent, late, excused).

4. FOR ALL attendance data displayed in the Parent_Portal, THE data SHALL be scoped to the
   selected child linked to the authenticated Guardian.

---

### Requirement 15: Parent Portal — Payments

**User Story:** As a parent, I want to view my child's outstanding invoices and pay fees online
via Paystack, so that I can settle school fees conveniently.

#### Acceptance Criteria

1. THE system SHALL provide a Payments page at `/parent/payments` where a parent can view
   invoices for their selected child.

2. WHEN the Payments page loads, THE Invoice list for the selected child SHALL be fetched from
   the backend finance invoices endpoint, filtered to the authenticated Guardian's children.

3. WHEN a parent clicks Pay on an unpaid or partial invoice, THE system SHALL initialize a
   Paystack payment by calling the backend initialize-payment endpoint and opening the Paystack
   payment modal with the returned authorization URL.

4. WHEN the Paystack payment modal closes after a transaction, THE system SHALL NOT record the
   payment on the frontend — THE payment SHALL only be recorded after the backend receives and
   verifies the Paystack webhook callback.

5. WHEN the parent returns to the Payments page after a transaction, THE invoice list SHALL be
   refetched from the backend to reflect the updated payment status as confirmed by the webhook.

6. FOR ALL payment data displayed in the Parent_Portal, THE data SHALL be scoped to invoices
   belonging to children linked to the authenticated Guardian.


---

### Requirement 16: Parent Portal — Messages

**User Story:** As a parent, I want to send and receive messages with teachers, so that I can
communicate about my child's progress without visiting the school.

#### Acceptance Criteria

1. THE system SHALL provide a Messages page at `/parent/messages` with an inbox/compose UI
   similar to the existing `communications/messages` page.

2. WHEN the Parent_Portal Messages page loads, THE message list SHALL be fetched from the
   backend communications endpoint scoped to the authenticated Guardian's user ID.

3. WHEN a parent composes and sends a message, THE API_Client SHALL POST to the messages
   endpoint and THE TanStack_Query cache for messages SHALL be invalidated.

4. WHEN a parent opens an unread message, THE API_Client SHALL PATCH the message status to
   `read` and THE unread count in the navigation badge SHALL decrease by 1.

---

### Requirement 17: Parent Dashboard Wiring

**User Story:** As a parent, I want the dashboard to show real data for my selected child, so
that the overview is accurate and actionable.

#### Acceptance Criteria

1. WHEN the Parent Dashboard loads, THE Guardian's linked children SHALL be fetched from the
   backend and used to populate the child selector — the hardcoded `MY_CHILDREN` array SHALL
   be removed.

2. WHEN a child is selected, THE dashboard stats (outstanding fees, attendance percentage,
   unread messages, latest result status) SHALL be fetched from the backend and displayed.

3. THE hardcoded stats values (₦25,000 outstanding, 95% attendance, "2 New" messages) in
   `components/dashboards/parent-dashboard.tsx` SHALL be replaced with real API data.


---

### Requirement 18: Student Portal Pages

**User Story:** As a student, I want dedicated pages to view my own results, attendance, and
exam timetable, so that I can track my academic progress independently.

#### Acceptance Criteria

1. THE system SHALL provide a Results page at `/student/results` where the authenticated student
   can view their own published Term_Result records by selecting a term.

2. WHEN the Student_Portal Results page loads, THE Term_Result for the authenticated student
   SHALL be fetched from the backend results endpoint scoped to the student's own ID.

3. WHILE a Term_Result is not published, THE Student_Portal results page SHALL display a
   "Results not yet published" message and SHALL NOT show score data.

4. THE system SHALL provide an Attendance page at `/student/attendance` where the authenticated
   student can view their own attendance summary and calendar for the current term.

5. WHEN the Student_Portal Attendance page loads, THE attendance records SHALL be fetched from
   the backend scoped to the authenticated student's ID.

6. THE system SHALL provide an Exams page at `/student/exams` where the authenticated student
   can view their upcoming exam timetable.

7. WHEN the Student_Portal Exams page loads, THE exam timetable entries for the student's class
   SHALL be fetched from the backend assessments timetable endpoint.

8. FOR ALL data displayed in the Student_Portal, THE data SHALL be scoped exclusively to the
   authenticated student — no other student's data SHALL be accessible.

---

### Requirement 19: Student Dashboard Wiring

**User Story:** As a student, I want the dashboard to show my real GPA, attendance, and schedule,
so that I have an accurate overview of my academic standing.

#### Acceptance Criteria

1. WHEN the Student Dashboard loads, THE student profile SHALL be fetched from the backend using
   the authenticated student's ID — the hardcoded `CURRENT_STUDENT_ID = "student-1"` constant
   SHALL be replaced with the authenticated user's actual student ID.

2. WHEN the Student Dashboard loads, THE current term results SHALL be fetched from the backend
   and used to compute and display the student's GPA and average score.

3. THE hardcoded attendance stat (96%, "Present 48/50 days") in `student-dashboard.tsx` SHALL
   be replaced with data fetched from the backend attendance endpoint.

4. THE hardcoded schedule in `student-dashboard.tsx` SHALL be replaced with data fetched from
   the backend timetable endpoint for the student's class.


---

### Requirement 20: Notifications Center

**User Story:** As any authenticated user, I want a notifications center page where I can view
all my notifications and mark them as read, so that I stay informed about important events.

#### Acceptance Criteria

1. THE system SHALL provide a Notifications page at `/notifications` that lists all Notification
   records for the authenticated user, fetched from the backend notifications endpoint.

2. WHEN the Notifications page loads, THE notifications SHALL be displayed in reverse
   chronological order with unread notifications visually distinguished from read ones.

3. WHEN a user clicks Mark as Read on a notification, THE API_Client SHALL PATCH the
   notification status to `read` and THE unread count in the topbar notification badge SHALL
   decrease by exactly 1.

4. WHEN a user clicks Mark All as Read, THE API_Client SHALL PATCH all unread notifications
   to `read` and THE topbar notification badge SHALL show zero unread.

5. THE Notifications page SHALL support filtering by notification type (info, warning, success,
   error) via a filter control.

6. WHEN a notification has an associated `link` field, THE notification item SHALL be a
   clickable link that navigates to that route.

7. FOR ALL notification unread counts displayed, THE count SHALL equal the number of Notification
   records where `isRead` is false for the authenticated user.

---

### Requirement 21: Communications Wiring

**User Story:** As a staff member or admin, I want the messages inbox to load real messages from
the backend, so that internal communications are persistent and searchable.

#### Acceptance Criteria

1. WHEN the Communications Messages page loads, THE message list SHALL be fetched from the
   backend communications endpoint — the `fetchMessages` stub SHALL be replaced with a real
   API_Client call.

2. WHEN a user sends a message via the compose dialog, THE API_Client SHALL POST to the messages
   endpoint and THE TanStack_Query cache for messages SHALL be invalidated.

3. WHEN a user opens an unread message, THE API_Client SHALL PATCH the message status to `read`.

4. WHEN a user sends a reply in the message thread view, THE API_Client SHALL POST the reply to
   the backend and THE message thread SHALL update to show the new reply.


---

### Requirement 22: Reports and Analytics Wiring

**User Story:** As a school admin, I want the reports page to display charts based on real
backend analytics data, so that the insights are accurate and reflect actual school performance.

#### Acceptance Criteria

1. WHEN the Reports page loads, THE attendance trend data for the selected term SHALL be fetched
   from the backend reports endpoint — the hardcoded `ATTENDANCE_DATA` array SHALL be removed.

2. WHEN the Reports page loads, THE fee collection data by class SHALL be fetched from the
   backend reports endpoint — the hardcoded `FINANCE_DATA` array SHALL be removed.

3. WHEN the Reports page loads, THE academic performance grade distribution data SHALL be fetched
   from the backend reports endpoint — the hardcoded `PERFORMANCE_DATA` array SHALL be removed.

4. THE quick stats (Average Attendance, Fee Recovery, Pass Rate) SHALL be computed from the
   fetched report data — the hardcoded percentages (94.5%, 78%, 88%) SHALL be removed.

5. WHEN a user changes the term selector, THE Reports page SHALL refetch all chart data for the
   selected term and update all charts simultaneously.

6. IF the reports backend endpoint returns stub data, THEN THE Reports page SHALL display
   skeleton loaders while fetching and an empty state if no data is returned.

---

### Requirement 23: Error and Loading Boundaries

**User Story:** As a user, I want every page to show a meaningful loading state while data is
fetching and a recoverable error state if something goes wrong, so that the app never appears
broken or frozen.

#### Acceptance Criteria

1. THE system SHALL provide a `loading.tsx` file for each major route group: `(app)`, `(auth)`,
   `super-admin`, `onboarding`, and each sub-route that performs data fetching.

2. THE system SHALL provide an `error.tsx` file for each major route group that displays a
   user-friendly error message and a "Try Again" button that calls `reset()`.

3. WHEN a page is loading data, THE loading state SHALL use skeleton components consistent with
   the page layout rather than a generic spinner.

4. WHEN an `error.tsx` boundary catches an error, THE error page SHALL display the error message
   from the API_Client's normalized `ApiError` shape where available.


---

### Requirement 24: Dark Mode Toggle

**User Story:** As a user, I want to toggle between light and dark mode from the topbar, so that
I can use the application comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE topbar SHALL include a dark mode toggle button that switches the application between light
   and dark themes using the existing Tailwind CSS v4 dark mode configuration.

2. WHEN a user toggles the theme, THE selected theme SHALL be persisted to `localStorage` so
   that the preference is restored on the next page load.

3. WHEN the application first loads, THE system SHALL read the user's OS-level color scheme
   preference (`prefers-color-scheme`) as the default theme if no stored preference exists.

---

### Requirement 25: PWA Support

**User Story:** As a user on a mobile device, I want to install the Learnova app to my home
screen and access key pages offline, so that I can use the app without a reliable internet
connection.

#### Acceptance Criteria

1. THE system SHALL include a valid `manifest.json` (or `manifest.webmanifest`) at the root
   with the app name, icons (192×192 and 512×512), theme color, background color, and
   `display: standalone`.

2. THE system SHALL register a service worker that caches the application shell (HTML, CSS, JS
   bundles) so that the app loads from cache when offline.

3. WHEN the user is offline, THE service worker SHALL serve cached pages and display an offline
   indicator banner rather than a browser error page.

4. THE service worker SHALL use a cache-first strategy for static assets and a network-first
   strategy for API requests, falling back to cached responses when the network is unavailable.


---

## Correctness Properties

The following properties must hold at all times and are suitable for property-based testing.

### Property 1: API Client Header Injection (Requirement 1)

For every HTTP request dispatched by the API_Client:
- The `Authorization` header MUST equal `Bearer <current_auth_token>` where `current_auth_token`
  is the value stored in the Zustand auth store at the time of the request.
- The `X-Tenant-Slug` header MUST equal the `tenantSlug` value from the Zustand tenant context
  store at the time of the request.

This property must hold for all endpoints, all HTTP methods (GET, POST, PATCH, DELETE), and all
combinations of auth token and tenant slug values.

### Property 2: Cache Invalidation After Mutations (Requirement 2)

For any resource R with a list query key K:
- After a successful create mutation on R, a subsequent read of K MUST return a list that
  includes the newly created record.
- After a successful update mutation on R with ID i, a subsequent read of K MUST return a list
  where the record with ID i reflects the updated values.
- After a successful delete mutation on R with ID i, a subsequent read of K MUST return a list
  that does NOT contain a record with ID i.

This property must hold for all resources: grading systems, assessments, attendance, results,
invoices, payments, fee structures, discipline incidents, admissions, messages, notifications.

### Property 3: Finance Stats Invariant (Requirements 9, 10)

For any set of Invoice records I fetched from the backend:
- `displayed_total_revenue` MUST equal `sum(i.paidAmount for i in I)`
- `displayed_outstanding` MUST equal `sum(i.balance for i in I where i.status in ['unpaid', 'partial', 'overdue'])`
- `displayed_net_flow` (ledger) MUST equal `sum(t.amount for t in T where t.type == 'credit') - sum(t.amount for t in T where t.type == 'debit')`

These invariants must hold for any arbitrary set of invoice and transaction records returned
by the backend, not just the current dataset.

### Property 4: Result Score Computation (Requirement 7)

For any Term_Result record R returned by the backend:
- `R.totalScore` MUST equal `sum(R.subjects[s].caScores[c].score for all s, c) + sum(R.subjects[s].examScore for all s)`
- `R.subjects[s].grade` MUST be the letter grade from the active Grading_System where
  `grading_system.minScore <= R.subjects[s].totalScore <= grading_system.maxScore`

This property must hold for all students, all subjects, and all possible score combinations
within the valid range [0, maxScore].

### Property 5: Parent Portal Data Isolation (Requirements 12–17)

For any authenticated Guardian G:
- Every API request made from the Parent_Portal MUST include G's auth token.
- Every response displayed in the Parent_Portal MUST contain only data for students S where
  `S.guardians` contains a guardian record with `userId == G.userId`.
- No student data for students not linked to G SHALL ever be rendered in the Parent_Portal,
  regardless of URL manipulation or query parameter changes.

### Property 6: Student Portal Data Isolation (Requirements 18–19)

For any authenticated Student U:
- Every API request made from the Student_Portal MUST include U's auth token.
- Every response displayed in the Student_Portal MUST contain only data where `studentId == U.studentId`.
- No other student's results, attendance, or timetable SHALL be accessible from the
  Student_Portal, regardless of URL manipulation.

### Property 7: Paystack Payment Integrity (Requirement 15)

For any payment flow initiated from the Parent_Portal:
- The frontend SHALL call the backend initialize-payment endpoint to get an authorization URL.
- The frontend SHALL open the Paystack modal with that URL.
- The frontend SHALL NOT call any record-payment or mark-paid endpoint after the modal closes.
- The invoice status SHALL only change from `unpaid`/`partial` to `paid` after the backend
  processes the Paystack webhook callback.
- A subsequent refetch of the invoice list after the modal closes MUST reflect the backend's
  authoritative payment status, not any frontend-assumed status.

### Property 8: Notification Unread Count Invariant (Requirement 20)

For any authenticated user U with notification set N:
- `displayed_unread_count` MUST equal `count(n in N where n.isRead == false)`
- After marking notification n as read: `new_unread_count` MUST equal `old_unread_count - 1`
- After marking all as read: `new_unread_count` MUST equal `0`

These invariants must hold for any arbitrary number of notifications and any sequence of
mark-read operations.
