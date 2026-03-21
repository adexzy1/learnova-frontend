# Requirements Document

## Introduction

Learnova Advanced Features extends the existing Learnova multi-tenant SaaS school management
system (Next.js 16 frontend + NestJS backend) with a comprehensive set of capabilities that go
beyond the basic API wiring covered in the `learnova-frontend-completion` spec.

This document specifies requirements for eight capability domains:

1. **Core Academic Operations** — result computation, report card generation, promotion/retention,
   and class arm management.
2. **Finance** — fee structure templates, bulk invoice generation, payment reconciliation,
   discounts/scholarships, expense tracking, and financial reports.
3. **Staff & HR** — subject assignments, staff attendance, payroll basics, and leave management.
4. **Communication** — automated notifications, bulk SMS/email broadcast, and notice board.
5. **Admissions** — public application portal, multi-step admission workflow, and document
   management.
6. **Timetable & Scheduling** — class timetable builder and exam timetable publication.
7. **Parent & Student Experience** — result history, homework/assignment tracking, and attendance
   notifications.
8. **Super Admin / Platform** — tenant onboarding wizard, usage metrics, plan limit enforcement,
   and white-labeling.
9. **Cross-Cutting** — audit trail, data export, academic calendar, and PWA/offline support.

The backend (NestJS) is multi-tenant; every tenant-scoped request carries an `X-Tenant-Slug`
header. The frontend uses TanStack Query v5 for server state, Zustand for client state,
shadcn/ui + Tailwind CSS v4 for UI, and React Hook Form + Zod for forms.

## Glossary

- **Result_Engine**: The backend service that computes a student's total score (CA + Exam),
  derives the letter grade from the active Grading_System, and ranks all students in a class arm.
- **Report_Card**: A formatted, printable PDF document per student per term containing grades,
  positions, teacher remarks, principal remarks, attendance summary, and school branding.
- **Promotion_Workflow**: The end-of-session process that bulk-moves students from one class
  level to the next (e.g. JSS1 → JSS2) or retains them based on academic performance.
- **Class_Arm**: A named subdivision of a class level (e.g. JSS1A, JSS1B). Each arm has its
  own student roster, class teacher, and timetable.
- **Fee_Template**: A reusable fee schedule that defines fee line items and amounts for a
  specific class level and term, used to bulk-generate invoices.
- **Bulk_Invoice_Job**: A background job that creates one Invoice per student in a class arm
  from a Fee_Template in a single admin action.
- **Payment_Reconciliation**: The process of matching an incoming payment record against an
  open Invoice, updating the paid amount, balance, and status.
- **Discount**: A named reduction applied to a student's invoice (e.g. sibling discount,
  scholarship waiver) expressed as a fixed amount or percentage.
- **Expense**: A debit entry in the school's financial ledger representing an outgoing payment
  (salary, utility, supply).
- **Staff_Attendance**: A daily record of whether a staff member was present, absent, or on
  approved leave.
- **Payroll_Record**: A monthly salary disbursement record for a staff member, tracking gross
  pay, deductions, net pay, and payment status.
- **Leave_Request**: A formal request by a staff member for time off, subject to admin approval,
  with a leave type, date range, and remaining balance.
- **Automated_Notification**: A system-triggered alert sent to one or more users when a
  predefined event occurs (fee due, result published, 3+ absences, exam timetable released).
- **Broadcast_Message**: A bulk SMS or email message sent by an admin to all parents of a
  class, or all students/parents with outstanding fees.
- **Notice_Board**: A school-wide announcement visible to all authenticated users on their
  dashboard home page.
- **Admission_Application**: A prospective student's application submitted via the public portal,
  progressing through a defined workflow: Application → Review → Entrance Exam → Offer →
  Acceptance → Enrollment.
- **Class_Timetable**: A weekly grid assigning subjects to periods for a class arm, ensuring no
  teacher is double-booked across arms in the same period.
- **Exam_Timetable**: A published schedule of examination dates, times, and venues per subject
  and class, visible to students, parents, and teachers.
- **Assignment**: A homework or classwork task posted by a teacher for a class arm, with a due
  date, description, and optional file attachment.
- **Submission**: A student's response to an Assignment, optionally including a file upload,
  graded by the teacher.
- **Tenant_Onboarding_Wizard**: A guided multi-step setup flow for a new school tenant covering
  school profile, fee structure, class structure, staff, and first session creation.
- **Plan_Limit**: A hard cap on the number of students, staff, or storage defined by the
  tenant's subscription plan.
- **White_Label**: A configuration that maps a custom domain (e.g. portal.school.com) to a
  specific tenant's Learnova instance.
- **Audit_Trail**: A tenant-scoped, append-only log of user actions (create, update, delete,
  publish, approve) with actor, timestamp, resource type, and resource ID.
- **Academic_Calendar**: A visual calendar showing term start/end dates, exam periods, public
  holidays, and school events for the current session.
- **PWA**: Progressive Web App — installable web application with a service worker enabling
  offline access to previously loaded pages and data.
- **Grading_System**: (inherited) A named set of grade bands used to derive a letter grade from
  a numeric total score.
- **CA_Score**: (inherited) A Continuous Assessment score for a student, subject, term, and
  CA component.
- **Exam_Score**: (inherited) The terminal examination score for a student in a subject and term.
- **Term_Result**: (inherited) The computed academic result for a student in a term.
- **Invoice**: (inherited) A billing document issued to a student for fee items in a term.
- **Guardian**: (inherited) A parent or legal guardian linked to one or more students.
- **Tenant_Slug**: (inherited) The subdomain/path segment identifying the school tenant,
  injected as `X-Tenant-Slug` in every API request.

## Requirements

---

## Domain 1: Core Academic Operations

---

### Requirement 1: Result Computation Engine

**User Story:** As a school admin, I want the system to automatically compute student totals,
apply the grading scale, rank students, and flag failures, so that result processing is
accurate, consistent, and free of manual calculation errors.

#### Acceptance Criteria

1. WHEN a school admin triggers result computation for a class arm and term, THE Result_Engine
   SHALL compute each student's total score as the sum of all CA_Score values plus the
   Exam_Score for every subject in that class arm.

2. FOR ALL computed total scores, THE Result_Engine SHALL derive the letter grade and remark by
   matching the total score against the active Grading_System's grade bands — a score that
   falls within `[minScore, maxScore]` SHALL receive that band's letter and remark.

3. WHEN result computation completes for a class arm and term, THE Result_Engine SHALL rank
   students by their overall average score in descending order and assign ordinal positions
   (1st, 2nd, 3rd, …) with ties sharing the same position.

4. THE Result_Engine SHALL compute each subject's class average as the arithmetic mean of all
   students' total scores for that subject in the class arm.

5. WHEN a student's total score in any subject is below the passing threshold defined in the
   active Grading_System, THE Result_Engine SHALL flag that subject result as a failure.

6. IF a CA_Score or Exam_Score is missing for a student-subject combination when computation
   is triggered, THEN THE Result_Engine SHALL treat the missing score as zero and include a
   warning indicator on that subject result.

7. FOR ALL result computations, THE Result_Engine SHALL be idempotent — triggering computation
   twice for the same class arm and term SHALL produce the same ranks, totals, and grades as
   triggering it once (idempotence property).

8. WHEN result computation is triggered, THE Result_Engine SHALL complete the computation and
   persist all Term_Result records within 30 seconds for a class arm of up to 60 students.

---

### Requirement 2: Report Card Generation

**User Story:** As a school admin, I want to generate a formatted, downloadable PDF report card
per student per term, so that parents receive an official academic record with school branding.

#### Acceptance Criteria

1. THE system SHALL provide a Report Card generation page where an admin selects a session,
   term, and class arm, then generates report cards for all students in that arm.

2. WHEN an admin clicks Generate Report Card for a student, THE system SHALL produce a PDF
   containing: student name, admission number, class, term, session, subject-by-subject
   breakdown (CA scores, exam score, total, grade, remark), overall position, overall average,
   class teacher's remark, principal's remark, attendance summary, and school branding
   (logo, name, colors).

3. WHEN an admin clicks Download All for a class arm, THE system SHALL generate a ZIP archive
   containing one PDF report card per student in that arm.

4. WHILE Term_Result records for a class arm are not yet published, THE Report Card generation
   page SHALL disable the Generate and Download All buttons and display a "Results must be
   published before generating report cards" message.

5. IF the school branding (logo, colors) has not been configured in tenant settings, THEN THE
   Report Card PDF SHALL use default Learnova branding and display a warning to the admin.

6. THE Report Card PDF SHALL be printable on A4 paper with all content fitting within a single
   page per student.

7. FOR ALL generated Report_Card PDFs, parsing the PDF text content and re-generating from the
   same Term_Result data SHALL produce a document with identical scores, grades, and positions
   (round-trip property: data → PDF → extracted data matches source data).

---

### Requirement 3: Promotion and Retention Workflow

**User Story:** As a school admin, I want to bulk-promote students to the next class level at
the end of a session and retain students who did not meet promotion criteria, so that class
rosters are updated accurately for the new session.

#### Acceptance Criteria

1. THE system SHALL provide a Promotion page where an admin selects a completed session and
   initiates the promotion workflow for one or more class levels.

2. WHEN an admin initiates promotion for a class level, THE system SHALL display a preview
   list showing each student's promotion status (promote / retain) based on the configured
   promotion rules (e.g. minimum average score, maximum number of failed subjects).

3. WHEN an admin confirms bulk promotion for a class level, THE system SHALL move all students
   marked "promote" to the next class level arm and leave students marked "retain" in their
   current class arm for the new session.

4. WHEN promotion is confirmed, THE system SHALL archive the completed session so that its
   Term_Result records remain readable but no new scores can be entered against it.

5. IF a student is manually overridden from "retain" to "promote" or vice versa before
   confirmation, THEN THE system SHALL record the override with the admin's name and timestamp
   in the Audit_Trail.

6. WHEN promotion is confirmed, THE system SHALL send an Automated_Notification to each
   affected student's Guardian indicating the student's promotion status for the new session.

7. THE Promotion page SHALL prevent initiating promotion for a session that has not been
   archived — the Promote button SHALL be disabled until the session is marked complete.

8. FOR ALL promotion operations, THE total number of students across all class arms after
   promotion SHALL equal the total number of students before promotion (no students are
   created or deleted during promotion — invariant property).

---

### Requirement 4: Class Arm Management

**User Story:** As a school admin, I want to create, edit, and delete class arms within a class
level, so that the school's actual class structure (JSS1A, JSS1B, JSS1C) is accurately
represented in the system.

#### Acceptance Criteria

1. THE system SHALL provide a Class Arms management section within the Classes page that lists
   all arms for each class level with their name, capacity, and assigned class teacher.

2. WHEN an admin submits the Create Class Arm form with a valid name and class level, THE
   system SHALL create the new Class_Arm and display it in the class level's arm list.

3. WHEN an admin edits a Class_Arm's name, capacity, or class teacher, THE system SHALL update
   the record and reflect the change immediately in the UI.

4. WHEN an admin deletes a Class_Arm that has no enrolled students, THE system SHALL remove
   the arm and invalidate the class arms list.

5. IF an admin attempts to delete a Class_Arm that has enrolled students, THEN THE system SHALL
   display an error message "Cannot delete a class arm with enrolled students" and leave the
   arm unchanged.

6. IF an admin attempts to create a Class_Arm with a name that already exists within the same
   class level, THEN THE system SHALL display a validation error and prevent the duplicate.

7. THE Class_Arm name SHALL be between 1 and 20 characters and SHALL only contain alphanumeric
   characters and spaces.


---

## Domain 2: Finance

---

### Requirement 5: Fee Structure Templates

**User Story:** As a finance officer, I want to define reusable fee schedules per class level
and term, so that invoices can be generated consistently without re-entering fee items each term.

#### Acceptance Criteria

1. THE system SHALL provide a Fee Templates page where a finance officer can create, edit, and
   delete Fee_Templates.

2. WHEN a finance officer creates a Fee_Template, THE system SHALL require: template name,
   applicable class level(s), term, and at least one fee line item (description + amount).

3. WHEN a finance officer edits a Fee_Template, THE system SHALL update the template and
   reflect the change in the UI — existing invoices already generated from this template SHALL
   NOT be retroactively modified.

4. WHEN a finance officer deletes a Fee_Template that has no associated invoices, THE system
   SHALL remove the template.

5. IF a finance officer attempts to delete a Fee_Template that has associated invoices, THEN
   THE system SHALL display an error "Cannot delete a template with generated invoices" and
   leave the template unchanged.

6. THE Fee_Template total amount SHALL equal the sum of all its line item amounts (invariant
   property).

---

### Requirement 6: Bulk Invoice Generation

**User Story:** As a finance officer, I want to generate invoices for all students in a class
arm with one click using a fee template, so that term billing is completed quickly and
consistently.

#### Acceptance Criteria

1. THE system SHALL provide a Bulk Generate Invoices action on the Fee Templates page that
   allows a finance officer to select a Fee_Template and a target class arm.

2. WHEN a finance officer confirms bulk invoice generation, THE system SHALL create one Invoice
   per active student in the selected class arm using the selected Fee_Template's line items
   and amounts.

3. WHEN bulk invoice generation completes, THE system SHALL display a summary showing the
   number of invoices created and the total amount billed.

4. IF an Invoice already exists for a student in the selected class arm and term, THEN THE
   system SHALL skip that student and include them in a "skipped (already invoiced)" count in
   the summary — no duplicate invoices SHALL be created.

5. WHEN bulk invoice generation is triggered, THE system SHALL process all students in the
   class arm within 60 seconds for a class arm of up to 60 students.

6. FOR ALL bulk-generated invoices, each Invoice's total amount SHALL equal the sum of the
   Fee_Template's line item amounts (round-trip property: template → invoice → invoice total
   equals template total).

---

### Requirement 7: Payment Reconciliation

**User Story:** As a finance officer, I want to match incoming payments against open invoices,
update balances, and mark invoices as paid or partial, so that the school's financial records
are accurate.

#### Acceptance Criteria

1. THE system SHALL provide a Payment Reconciliation page listing all open (unpaid and partial)
   invoices with their student name, class, total amount, paid amount, and balance.

2. WHEN a finance officer records a payment against an Invoice, THE system SHALL add the
   payment amount to the Invoice's `paidAmount`, subtract it from the `balance`, and update
   the Invoice status to `paid` if `balance` reaches zero or `partial` if `balance` is greater
   than zero.

3. FOR ALL payment reconciliations, the Invoice `balance` SHALL equal `totalAmount` minus
   `paidAmount` after every payment (invariant property).

4. IF a finance officer attempts to record a payment amount greater than the Invoice's current
   balance, THEN THE system SHALL display a validation error "Payment exceeds outstanding
   balance" and reject the payment.

5. WHEN an Invoice status changes to `paid`, THE system SHALL send an Automated_Notification
   to the student's Guardian confirming full payment.

6. THE Payment Reconciliation page SHALL support filtering by class arm, payment status, and
   date range.

---

### Requirement 8: Discount and Scholarship Management

**User Story:** As a finance officer, I want to apply fee discounts and scholarship waivers to
individual student invoices, so that eligible students receive the correct reduced fee amount.

#### Acceptance Criteria

1. THE system SHALL provide a Discounts page where a finance officer can define named Discount
   types (e.g. "Sibling Discount", "Merit Scholarship") with a discount value expressed as
   either a fixed amount or a percentage.

2. WHEN a finance officer applies a Discount to a student's Invoice, THE system SHALL reduce
   the Invoice's `totalAmount` by the discount value and recalculate the `balance`.

3. FOR ALL discount applications, the resulting Invoice `balance` SHALL equal `totalAmount`
   minus `paidAmount` after the discount is applied (invariant property).

4. IF a discount application would reduce the Invoice `totalAmount` below zero, THEN THE
   system SHALL cap the discount at the Invoice `totalAmount` and display a warning.

5. WHEN a Discount is applied to an Invoice, THE system SHALL record the discount type, value,
   and the finance officer's name in the Invoice's audit history.

6. THE system SHALL allow multiple Discounts to be applied to a single Invoice, with each
   discount applied sequentially to the running total.

---

### Requirement 9: Expense Tracking

**User Story:** As a finance officer, I want to record school expenses alongside income, so
that the ledger reflects the school's true financial position.

#### Acceptance Criteria

1. THE system SHALL provide an Expenses section within the Finance module where a finance
   officer can record, edit, and delete expense entries.

2. WHEN a finance officer creates an expense entry, THE system SHALL require: description,
   amount, category (salary, utility, supply, maintenance, other), date, and optional
   reference number.

3. WHEN an expense entry is created, THE system SHALL add a debit entry to the financial
   Ledger with the expense amount, category, and date.

4. THE Ledger Net Flow SHALL equal the sum of all credit (income) entries minus the sum of all
   debit (expense) entries for the selected period (invariant property).

5. THE Expenses page SHALL support filtering by category and date range.

6. WHEN a finance officer deletes an expense entry, THE system SHALL remove the corresponding
   Ledger debit entry and recalculate the Net Flow.

---

### Requirement 10: Financial Reports

**User Story:** As a school admin or finance officer, I want term-end financial reports showing
revenue summary, outstanding debtors, and collection rates, so that I can assess the school's
financial health.

#### Acceptance Criteria

1. THE system SHALL provide a Financial Reports page with three report views: Term Revenue
   Summary, Outstanding Debtors List, and Collection Rate by Class.

2. WHEN the Term Revenue Summary report is generated for a selected term, THE system SHALL
   display total invoiced amount, total collected, total outstanding, and collection rate
   (collected ÷ invoiced × 100%).

3. WHEN the Outstanding Debtors List is generated for a selected term, THE system SHALL display
   each student with an outstanding balance, their class arm, total owed, and days overdue.

4. WHEN the Collection Rate by Class report is generated, THE system SHALL display each class
   arm's total invoiced, total collected, and collection rate percentage.

5. THE Financial Reports page SHALL allow exporting each report as a CSV file.

6. FOR ALL collection rate calculations, the collection rate SHALL equal total collected divided
   by total invoiced multiplied by 100, rounded to two decimal places (invariant property).


---

## Domain 3: Staff & HR

---

### Requirement 11: Staff Roles and Subject Assignments

**User Story:** As a school admin, I want to designate class teachers for each class arm and
assign subject teachers to specific subjects and class arms, so that the system can scope CA
entry and communications correctly.

#### Acceptance Criteria

1. THE system SHALL provide a Staff Assignments page where an admin can designate one staff
   member as the class teacher for each Class_Arm.

2. WHEN an admin assigns a class teacher to a Class_Arm, THE system SHALL update the arm's
   `classTeacherId` and display the teacher's name on the class arm card.

3. IF an admin attempts to assign a class teacher to a Class_Arm that already has a class
   teacher, THEN THE system SHALL replace the existing assignment and display a confirmation
   prompt before saving.

4. THE system SHALL allow an admin to assign a subject teacher to a subject-class arm
   combination, specifying the staff member, subject, and class arm.

5. IF an admin attempts to assign the same subject to the same class arm with a different
   teacher, THEN THE system SHALL replace the existing assignment after displaying a
   confirmation prompt.

6. WHEN a subject teacher assignment is saved, THE system SHALL restrict CA score entry for
   that subject-class arm combination to the assigned teacher and the school admin.

---

### Requirement 12: Staff Attendance

**User Story:** As a school admin, I want to track daily staff attendance separately from
student attendance, so that HR records are accurate and leave balances can be maintained.

#### Acceptance Criteria

1. THE system SHALL provide a Staff Attendance page where an admin or HR officer can mark each
   staff member as present, absent, or on approved leave for a selected date.

2. WHEN staff attendance is saved for a date, THE system SHALL persist the records and allow
   the admin to view or edit them on subsequent visits to that date.

3. WHEN the Staff Attendance page loads for a date that already has saved records, THE system
   SHALL pre-populate the attendance status for each staff member from the saved records.

4. THE Staff Attendance page SHALL display a monthly summary showing each staff member's
   present count, absent count, and leave days for the selected month.

5. IF a staff member is marked absent for 3 or more consecutive working days without an
   approved Leave_Request, THEN THE system SHALL flag the staff member's record with a
   "Consecutive Absence" warning visible to the admin.

---

### Requirement 13: Payroll Basics

**User Story:** As a school admin, I want to record monthly salary payments for each staff
member and track payment status, so that payroll history is available for HR and audit purposes.

#### Acceptance Criteria

1. THE system SHALL provide a Payroll page where an admin can view and manage monthly
   Payroll_Records for all staff members.

2. WHEN an admin creates a Payroll_Record for a staff member and month, THE system SHALL
   require: gross pay, deductions (itemized), net pay, and payment date.

3. THE Payroll_Record net pay SHALL equal gross pay minus the sum of all deductions (invariant
   property).

4. WHEN a Payroll_Record is marked as paid, THE system SHALL add a debit entry to the financial
   Ledger with category "salary" and the net pay amount.

5. IF an admin attempts to create a Payroll_Record for a staff member and month that already
   has a record, THEN THE system SHALL display an error "Payroll record already exists for
   this month" and prevent the duplicate.

6. THE Payroll page SHALL display a monthly summary of total gross pay, total deductions, and
   total net pay across all staff members.

---

### Requirement 14: Leave Management

**User Story:** As a staff member, I want to submit leave requests and track my leave balance,
and as an admin, I want to approve or reject requests, so that staff absences are formally
managed.

#### Acceptance Criteria

1. THE system SHALL provide a Leave Management page accessible to staff members where they can
   submit Leave_Requests specifying leave type, start date, end date, and reason.

2. WHEN a staff member submits a Leave_Request, THE system SHALL notify the school admin via
   an Automated_Notification and set the request status to "pending".

3. WHEN an admin approves a Leave_Request, THE system SHALL update the request status to
   "approved", deduct the leave days from the staff member's leave balance, and notify the
   staff member.

4. WHEN an admin rejects a Leave_Request, THE system SHALL update the request status to
   "rejected" and notify the staff member with the rejection reason.

5. IF a staff member submits a Leave_Request for dates that overlap with an existing approved
   Leave_Request for the same staff member, THEN THE system SHALL display a validation error
   and prevent the overlapping request.

6. THE system SHALL display each staff member's remaining leave balance by leave type (annual,
   sick, maternity, paternity, unpaid) on the Leave Management page.

7. FOR ALL leave balance calculations, the remaining balance SHALL equal the initial annual
   allocation minus the sum of approved leave days of that type taken in the current year
   (invariant property).


---

## Domain 4: Communication

---

### Requirement 15: Automated Notifications

**User Story:** As a school admin, I want the system to automatically send alerts to relevant
users when key events occur, so that parents, students, and staff are informed without manual
intervention.

#### Acceptance Criteria

1. WHEN an Invoice's due date is 3 days away and the Invoice status is not `paid`, THE system
   SHALL send a fee due reminder Automated_Notification to the student's Guardian.

2. WHEN Term_Result records for a class arm are published, THE system SHALL send a result
   publication Automated_Notification to every Guardian of a student in that class arm.

3. WHEN a student accumulates 3 or more consecutive absent attendance records, THE system SHALL
   send an attendance alert Automated_Notification to the student's Guardian.

4. WHEN an Exam_Timetable is published for a class arm, THE system SHALL send an exam timetable
   release Automated_Notification to every student and Guardian linked to that class arm.

5. THE Automated_Notification SHALL include: notification title, message body, the triggering
   event type, a link to the relevant page, and the recipient's user ID.

6. IF an Automated_Notification delivery fails (e.g. invalid contact), THEN THE system SHALL
   log the failure and retry delivery up to 3 times before marking the notification as failed.

7. FOR ALL Automated_Notifications, each notification SHALL be delivered to the correct
   recipient and SHALL NOT be delivered to users who are not linked to the triggering event
   (scoping invariant).

---

### Requirement 16: Bulk SMS/Email Broadcast

**User Story:** As a school admin, I want to send a bulk message to all parents of a class or
all students with outstanding fees, so that I can communicate important information efficiently.

#### Acceptance Criteria

1. THE system SHALL provide a Broadcast page where an admin can compose a message and select
   a recipient group: all parents of a specific class arm, or all guardians of students with
   outstanding invoices.

2. WHEN an admin selects a recipient group, THE system SHALL display the estimated recipient
   count before the message is sent.

3. WHEN an admin confirms a broadcast, THE system SHALL send the message via the configured
   channel (SMS, email, or both) to all members of the selected recipient group.

4. WHEN a broadcast is sent, THE system SHALL display a delivery summary showing the number
   of messages sent, delivered, and failed.

5. IF the selected recipient group has zero members, THEN THE system SHALL display a warning
   "No recipients match the selected criteria" and disable the Send button.

6. THE Broadcast page SHALL require the admin to confirm the recipient count before sending,
   preventing accidental mass messages.

---

### Requirement 17: Notice Board / Announcements

**User Story:** As a school admin, I want to post school-wide announcements visible to all
authenticated users on their dashboard, so that important information reaches everyone.

#### Acceptance Criteria

1. THE system SHALL provide a Notice Board management page where an admin can create, edit,
   pin, and delete announcements.

2. WHEN an admin creates an announcement, THE system SHALL require: title, body text, optional
   expiry date, and optional target audience (all users, staff only, parents only, students
   only).

3. WHEN an announcement is created, THE system SHALL display it on the dashboard home page for
   all users matching the target audience.

4. WHEN an announcement's expiry date is reached, THE system SHALL automatically hide it from
   the dashboard without deleting the record.

5. WHEN an admin pins an announcement, THE system SHALL display it at the top of the notice
   board above non-pinned announcements.

6. THE dashboard home page SHALL display a maximum of 5 active announcements, with a "View
   All" link to the full notice board.


---

## Domain 5: Admissions

---

### Requirement 18: Public Application Portal

**User Story:** As a prospective student or parent, I want to submit an application online
without creating an account, upload required documents, and track my application status, so
that I can apply to the school conveniently.

#### Acceptance Criteria

1. THE system SHALL provide a public-facing application page at
   `/{tenant-slug}/admissions/apply` accessible without authentication.

2. WHEN a prospective applicant submits the application form, THE system SHALL require:
   applicant's first name, last name, date of birth, gender, desired class level, parent/
   guardian name, guardian phone number, guardian email, and at least one document upload
   (birth certificate or previous school result).

3. WHEN an application is submitted successfully, THE system SHALL generate a unique
   Application_Number and display it to the applicant with instructions to use it for
   status tracking.

4. THE system SHALL provide a public status tracking page at
   `/{tenant-slug}/admissions/track` where an applicant can enter their Application_Number
   to view the current status of their application without logging in.

5. WHEN an applicant uploads a document, THE system SHALL accept PDF, JPG, and PNG files up
   to 5 MB per file.

6. IF an applicant submits the form with missing required fields, THEN THE system SHALL
   display inline validation errors for each missing field and prevent submission.

7. THE public application page SHALL be accessible without an `X-Tenant-Slug` header by
   using the tenant slug from the URL path.

---

### Requirement 19: Admission Workflow

**User Story:** As a school admin, I want to manage applications through a defined workflow
from review to enrollment, so that the admission process is structured and auditable.

#### Acceptance Criteria

1. THE system SHALL support the following Admission_Application status transitions:
   `pending` → `under-review` → `entrance-exam-scheduled` → `offer-sent` → `accepted` →
   `enrolled`, with `rejected` available from any status before `enrolled`.

2. WHEN an admin moves an application to `under-review`, THE system SHALL record the reviewer's
   name and timestamp.

3. WHEN an admin schedules an entrance exam for an application, THE system SHALL require an
   exam date, time, and venue, and send an Automated_Notification to the applicant's guardian
   email with the exam details.

4. WHEN an admin sends an offer letter, THE system SHALL generate a PDF offer letter with the
   school's branding and send it to the guardian's email address.

5. WHEN an application status is set to `accepted`, THE system SHALL prompt the admin to
   confirm enrollment, which creates a Student record and links the guardian.

6. WHEN an application is rejected at any stage, THE system SHALL require the admin to provide
   a rejection reason, which is stored on the application record.

7. FOR ALL status transitions, THE system SHALL only allow forward transitions or rejection —
   an application SHALL NOT be moved backward in the workflow (e.g. from `offer-sent` back to
   `pending`).

---

### Requirement 20: Document Management

**User Story:** As a school admin, I want to view, download, and manage documents uploaded by
applicants and enrolled students, so that student records are complete and accessible.

#### Acceptance Criteria

1. THE system SHALL display all uploaded documents for an Admission_Application in the
   application detail view, with document type, file name, upload date, and a download link.

2. WHEN an admin uploads an additional document to a student's record, THE system SHALL accept
   PDF, JPG, and PNG files up to 5 MB and associate the document with the student's profile.

3. WHEN an application is converted to an enrolled student, THE system SHALL transfer all
   uploaded application documents to the student's document record.

4. THE system SHALL allow an admin to delete a document from a student's record, with a
   confirmation prompt before deletion.

5. IF a document upload fails (e.g. file too large, unsupported format), THEN THE system SHALL
   display a descriptive error message and leave the existing documents unchanged.


---

## Domain 6: Timetable & Scheduling

---

### Requirement 21: Class Timetable Builder

**User Story:** As a school admin, I want to build a weekly class timetable by assigning
subjects to periods for each class arm, with automatic conflict detection for teachers, so
that the schedule is valid and ready to publish.

#### Acceptance Criteria

1. THE system SHALL provide a Timetable Builder page with a grid interface showing days of the
   week (columns) and periods (rows) for a selected class arm.

2. WHEN an admin assigns a subject and teacher to a period slot, THE system SHALL save the
   assignment and display the subject name and teacher name in that slot.

3. WHEN an admin assigns a teacher to a period slot, THE system SHALL check whether that
   teacher is already assigned to another class arm in the same period and, IF a conflict
   exists, THEN THE system SHALL display a conflict warning "Teacher [name] is already
   assigned to [class arm] during this period" and prevent the conflicting assignment.

4. THE system SHALL support marking a period slot as a free period (no subject or teacher
   assigned).

5. WHEN an admin publishes a class timetable, THE system SHALL make it visible to students,
   parents, and teachers assigned to that class arm.

6. WHILE a class timetable is in draft state, THE system SHALL only display it to school
   admins and not to students, parents, or teachers.

7. FOR ALL published timetables, no teacher SHALL appear in more than one class arm in the
   same period (teacher conflict invariant).

---

### Requirement 22: Exam Timetable Publication

**User Story:** As a school admin, I want to publish an exam timetable that is visible to
students, parents, and teachers, so that everyone knows the examination schedule in advance.

#### Acceptance Criteria

1. THE system SHALL provide an Exam Timetable page where an admin can create exam schedule
   entries specifying: subject, class arm, date, start time, end time, and venue.

2. WHEN an admin publishes the exam timetable for a term, THE system SHALL make all exam
   schedule entries for that term visible to students, parents, and teachers.

3. WHEN the exam timetable is published, THE system SHALL send an Automated_Notification to
   all students and guardians in the affected class arms (per Requirement 15.4).

4. WHILE the exam timetable is not yet published, THE system SHALL only display it to school
   admins.

5. IF two exam entries for the same class arm are scheduled at overlapping times, THEN THE
   system SHALL display a conflict warning and prevent the overlapping entry from being saved.

6. THE Exam Timetable page SHALL display entries sorted by date and start time.


---

## Domain 7: Parent & Student Experience

---

### Requirement 23: Student Result History

**User Story:** As a student or parent, I want to view academic results across all terms and
sessions, so that I have a complete historical academic record.

#### Acceptance Criteria

1. THE system SHALL provide a Result History page in both the Student Portal and Parent Portal
   that lists all published Term_Result records for the student across all sessions and terms.

2. WHEN a student or parent selects a specific term from the result history, THE system SHALL
   display the full subject breakdown (CA scores, exam score, total, grade, remark), overall
   position, and overall average for that term.

3. THE Result History page SHALL display results grouped by session, with terms listed in
   chronological order within each session.

4. FOR ALL result history data displayed, THE data SHALL only include Term_Result records where
   `isPublished` is true — unpublished results SHALL NOT be visible to students or parents.

5. WHEN a student or parent views a historical result, THE system SHALL display the grading
   scale that was active at the time of that result's computation.

---

### Requirement 24: Homework and Assignment Tracking

**User Story:** As a teacher, I want to post assignments for a class arm with a due date, and
as a student, I want to submit my work and receive a grade, so that homework is managed
digitally.

#### Acceptance Criteria

1. THE system SHALL provide an Assignments page for teachers where they can create, edit, and
   delete Assignments for a class arm.

2. WHEN a teacher creates an Assignment, THE system SHALL require: title, description, class
   arm, subject, due date, and maximum score. An optional file attachment SHALL be supported.

3. WHEN an Assignment is created, THE system SHALL send an Automated_Notification to all
   students in the target class arm informing them of the new assignment and due date.

4. THE system SHALL provide a Student Assignments page where a student can view all active
   assignments for their class arm, sorted by due date.

5. WHEN a student submits an Assignment, THE system SHALL record the submission timestamp and
   optionally accept a file upload (PDF, DOC, DOCX, JPG, PNG up to 10 MB).

6. WHEN a teacher grades a Submission, THE system SHALL record the score (between 0 and the
   Assignment's maximum score) and optional feedback, and notify the student.

7. IF a student attempts to submit an Assignment after the due date, THEN THE system SHALL
   mark the submission as "late" and still accept it, displaying a "Late Submission" indicator
   to the teacher.

8. FOR ALL graded submissions, the recorded score SHALL be between 0 and the Assignment's
   maximum score inclusive (invariant property).

---

### Requirement 25: Attendance Notifications to Parents

**User Story:** As a parent, I want to receive an automatic notification when my child is
marked absent, so that I am immediately aware of their attendance status.

#### Acceptance Criteria

1. WHEN a student is marked absent in the daily attendance record, THE system SHALL send an
   Automated_Notification to the student's primary Guardian within 5 minutes of the attendance
   record being saved.

2. THE attendance absence notification SHALL include: student name, date, class arm, and a
   link to the parent portal attendance page.

3. WHEN a student is marked present after being marked absent on the same day (correction),
   THE system SHALL send a follow-up notification to the Guardian indicating the correction.

4. THE system SHALL NOT send duplicate absence notifications for the same student and date if
   the attendance record is saved multiple times without changing the status.

5. FOR ALL absence notifications, THE notification SHALL only be sent to Guardians linked to
   the absent student — no other guardians SHALL receive the notification (scoping invariant).


---

## Domain 8: Super Admin / Platform

---

### Requirement 26: Tenant Onboarding Wizard

**User Story:** As a new school admin, I want a guided setup wizard that walks me through
configuring my school profile, fee structure, class structure, staff, and first session, so
that the system is ready to use without needing external support.

#### Acceptance Criteria

1. THE system SHALL provide a Tenant_Onboarding_Wizard with the following sequential steps:
   (1) School Profile, (2) Fee Structure, (3) Class Structure, (4) Staff Setup, (5) First
   Session & Term.

2. WHEN a new tenant logs in for the first time, THE system SHALL redirect them to the
   Tenant_Onboarding_Wizard if their onboarding is not complete.

3. WHEN a tenant admin completes a wizard step and clicks Next, THE system SHALL save the
   step's data to the backend and advance to the next step — the admin SHALL be able to
   return to a completed step to edit it.

4. WHEN all five wizard steps are completed, THE system SHALL mark the tenant's onboarding as
   complete and redirect the admin to the main dashboard.

5. IF a tenant admin closes the browser mid-wizard, THEN THE system SHALL resume from the
   last completed step when they log in again.

6. THE Tenant_Onboarding_Wizard SHALL display a progress indicator showing which steps are
   complete, in progress, and pending.

---

### Requirement 27: Usage and Billing Metrics

**User Story:** As a super admin, I want to view per-tenant usage metrics including student
count, storage used, last active date, plan tier, and MRR, so that I can monitor platform
health and billing.

#### Acceptance Criteria

1. THE system SHALL provide a Usage Metrics page in the super admin panel listing all tenants
   with: tenant name, plan tier, student count, staff count, storage used (GB), last active
   date, and monthly recurring revenue (MRR).

2. WHEN the Usage Metrics page loads, THE system SHALL fetch the metrics from the backend
   tenant stats API and display them in a sortable, filterable table.

3. THE Usage Metrics page SHALL display aggregate platform totals: total tenants, total active
   subscriptions, total MRR, and total storage used.

4. WHEN a super admin clicks on a tenant row, THE system SHALL navigate to that tenant's
   detail page showing full usage history and billing records.

5. THE Usage Metrics page SHALL support filtering tenants by plan tier and status (active,
   trial, suspended).

---

### Requirement 28: Plan Limit Enforcement

**User Story:** As a super admin, I want the system to enforce subscription plan limits so
that tenants cannot exceed their student or staff quotas without upgrading, so that plan
tiers are respected.

#### Acceptance Criteria

1. WHEN a school admin attempts to enroll a new student and the tenant's current student count
   equals the Plan_Limit for their subscription plan, THE system SHALL reject the enrollment
   with an error "Student limit reached. Please upgrade your plan to enroll more students."

2. WHEN a school admin attempts to create a new staff member and the tenant's current staff
   count equals the Plan_Limit for their subscription plan, THE system SHALL reject the
   creation with an error "Staff limit reached. Please upgrade your plan."

3. WHEN a tenant's student count reaches 90% of their Plan_Limit, THE system SHALL send an
   Automated_Notification to the school admin warning them that they are approaching the limit.

4. THE enrollment rejection error page SHALL include a direct link to the subscription upgrade
   page.

5. FOR ALL plan limit checks, THE system SHALL use the tenant's current active subscription
   plan limits — a tenant with no active subscription SHALL have a limit of zero for all
   resources.

---

### Requirement 29: White-Labeling and Custom Domains

**User Story:** As a school admin, I want to configure a custom domain for my school's portal,
so that parents and students access the system at a branded URL like
portal.greenvalleyschool.com.

#### Acceptance Criteria

1. THE system SHALL provide a Custom Domain settings page where a school admin can enter a
   custom domain name for their tenant.

2. WHEN a school admin saves a custom domain, THE system SHALL display DNS configuration
   instructions (CNAME record) that the admin must add to their domain registrar.

3. WHEN a request arrives at a configured custom domain, THE system SHALL resolve the
   Tenant_Slug from the custom domain mapping and serve the correct tenant's portal.

4. WHEN a custom domain is verified (DNS propagated), THE system SHALL mark the domain as
   active and display a "Domain Active" status on the settings page.

5. IF a custom domain is already in use by another tenant, THEN THE system SHALL display an
   error "This domain is already registered to another school" and prevent the duplicate
   registration.

6. THE system SHALL support HTTPS for all custom domains via automatic TLS certificate
   provisioning.


---

## Domain 9: Cross-Cutting

---

### Requirement 30: Audit Trail for Tenant Admins

**User Story:** As a school admin, I want to view a log of all significant actions taken by
users in my tenant, so that I can investigate changes and maintain accountability.

#### Acceptance Criteria

1. THE system SHALL provide an Audit Trail page in the school admin panel listing all
   Audit_Trail entries for the tenant, with: actor name, action type, resource type, resource
   ID, timestamp, and a summary of the change.

2. THE Audit_Trail SHALL record the following actions: student create/update/delete, staff
   create/update/deactivate, invoice create/update/delete, payment record, result publish,
   fee structure create/update/delete, and admission status change.

3. THE Audit_Trail page SHALL support filtering by actor, action type, resource type, and
   date range.

4. THE Audit_Trail entries SHALL be append-only — no user SHALL be able to edit or delete an
   audit entry through the UI.

5. WHEN an admin views an Audit_Trail entry for a deleted resource, THE system SHALL display
   the resource's last known state (name, ID) rather than a broken reference.

6. THE Audit_Trail page SHALL support pagination with a default page size of 25 entries.

---

### Requirement 31: Data Export

**User Story:** As a school admin, I want to export student records, results, and financial
data to Excel or CSV, so that I can use the data in external tools or for offline reporting.

#### Acceptance Criteria

1. THE system SHALL provide export buttons on the Students list page, Results page, Invoices
   page, and Payments page that download the current filtered data as a CSV file.

2. WHEN an admin clicks Export on the Students list, THE system SHALL generate a CSV file
   containing: admission number, first name, last name, class arm, gender, date of birth,
   enrollment date, and status for all students matching the current filter.

3. WHEN an admin clicks Export on the Results page for a selected term and class arm, THE
   system SHALL generate a CSV file containing each student's name, subject scores, total,
   average, grade, and position.

4. WHEN an admin clicks Export on the Invoices page, THE system SHALL generate a CSV file
   containing: invoice number, student name, class arm, total amount, paid amount, balance,
   status, and due date for all invoices matching the current filter.

5. THE exported CSV files SHALL use UTF-8 encoding and include a header row with column names.

6. FOR ALL CSV exports, parsing the exported CSV and re-importing the data SHALL produce
   records with values identical to the source data (round-trip property: export → parse →
   values match source).

---

### Requirement 32: Academic Calendar

**User Story:** As any authenticated user, I want to view a visual academic calendar showing
term dates, exam periods, holidays, and school events, so that I can plan around the school
schedule.

#### Acceptance Criteria

1. THE system SHALL provide an Academic Calendar page accessible to all authenticated users
   displaying a monthly calendar view.

2. THE Academic Calendar SHALL display the following event types with distinct color coding:
   term start/end dates, exam periods, public holidays, and school events.

3. WHEN a school admin creates a calendar event, THE system SHALL require: event title, event
   type, start date, end date (optional for single-day events), and optional description.

4. WHEN a school admin publishes a calendar event, THE system SHALL make it visible to all
   authenticated users in the tenant.

5. THE Academic Calendar page SHALL support switching between monthly and list views.

6. WHEN a user clicks on a calendar event, THE system SHALL display the event details in a
   popover or side panel.

---

### Requirement 33: Mobile App / PWA

**User Story:** As a parent or student, I want to install the Learnova portal as a PWA on my
mobile device and access previously loaded pages offline, so that I can check results and
schedules without a reliable internet connection.

#### Acceptance Criteria

1. THE system SHALL provide a web app manifest (`/manifest.json`) with `name`, `short_name`,
   icons (192×192 and 512×512 PNG), `theme_color`, `background_color`, `display: standalone`,
   and `start_url`.

2. THE system SHALL register a service worker that caches static assets (JS, CSS, fonts,
   icons) using a cache-first strategy.

3. WHEN a user visits a page while online, THE service worker SHALL cache the page response
   so that the page is accessible on subsequent offline visits.

4. WHEN a user attempts to navigate to a page that is not cached while offline, THE service
   worker SHALL serve the `/offline` fallback page.

5. WHEN a user is on a supported browser and the PWA install criteria are met, THE system
   SHALL display an "Install App" prompt or button.

6. WHEN the service worker is updated, THE system SHALL notify the user with a "New version
   available — click to update" banner and reload the page on confirmation.

7. FOR ALL service worker cache operations, a resource that is cached and then retrieved
   offline SHALL have the same content as when it was originally fetched (round-trip property:
   fetch → cache → retrieve offline → content matches original).
