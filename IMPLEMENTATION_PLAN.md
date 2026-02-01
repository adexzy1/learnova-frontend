# Implementation Plan - Missing Frontend Pages

## Goal Description

Complete the frontend implementation by building the missing pages identified from the sidebar navigation and project requirements. This includes sub-pages for existing modules (Academics, Finance, Assessments) and entire new modules (Staff, Parent Portal, Student Portal, Communication, Discipline, Reports, Settings).

## Proposed Changes

### 1. Missing Sub-pages for Existing Modules

Fill in the gaps in `academics`, `assessments`, and `finance`.

#### [NEW] [Terms Management]

- List terms, create/edit term modal.
- Columns: Name, Start Date, End Date, Status (Active/Inactive).

#### [NEW] [Grading Systems]

- Configure grading rules (A, B, C, etc.) and score ranges.

#### [NEW] [Timetable]

- View class timetables.
- Edit mode for admins.

#### [NEW] [Invoices]

- List invoices with status filter (Paid, Pending, Overdue).
- Create invoice action.

#### [NEW] [Ledger]

- Table view of financial transactions (Credit/Debit).
- Filters by date and category.

### 2. Staff Management Module

#### [NEW] [Staff List]

- Grid/List view of staff.
- Add Staff button (Slide-over or Modal).

### 3. Communication & Discipline

#### [NEW] [Messages]

- Inbox interface.
- Compose message form (SMS/Email/In-app).

#### [NEW] [Discipline]

- Incident log table.
- Record incident form.

### 4. Reports & Settings

#### [NEW] [Reports Dashboard]

- Analytics charts (Student population, attendance trends, financial overview).

#### [NEW] [Settings]

- tabs for School Profile, Academic Config, Branding.

### 5. Portals (Student & Parent)

#### [NEW] [Student Dashboard]

- Overview for logged-in student.

#### [NEW] [Parent Dashboard]

- Overview for logged-in parent.
- Child selector if multiple children.
