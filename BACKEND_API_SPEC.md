# Backend API Specification - School Management System

## Overview

This document outlines all the required APIs for the School Management System. The system follows a multi-tenant architecture where each school (tenant) has isolated data, managed through a central super-admin dashboard.

## Authentication & Authorization

### Base URL Structure

- **Super Admin**: `https://api.schoolsms.com/v1/admin/*`
- **Tenant**: `https://api.schoolsms.com/v1/tenant/{tenantSlug}/*`

### Headers

```
Authorization: Bearer {jwt_token}
X-Tenant-ID: {tenant_id} (for tenant-specific requests)
Content-Type: application/json
```

---

## 1. Authentication & Identity

### Auth Endpoints

| Method | Endpoint                | Description                 | Auth Required |
| ------ | ----------------------- | --------------------------- | ------------- |
| POST   | `/auth/login`           | User login                  | No            |
| POST   | `/auth/logout`          | User logout                 | Yes           |
| POST   | `/auth/refresh`         | Refresh JWT token           | Yes           |
| POST   | `/auth/forgot-password` | Request password reset      | No            |
| POST   | `/auth/reset-password`  | Reset password with token   | No            |
| GET    | `/auth/me`              | Get current user profile    | Yes           |
| PUT    | `/auth/me`              | Update current user profile | Yes           |
| PUT    | `/auth/me/password`     | Change password             | Yes           |

### Audit Logs (Super Admin Only)

| Method | Endpoint              | Description             |
| ------ | --------------------- | ----------------------- |
| GET    | `/admin/audit`        | List all audit logs     |
| GET    | `/admin/audit/{id}`   | Get audit log details   |
| GET    | `/admin/audit/export` | Export audit logs (CSV) |

---

## 2. Tenant Management (Super Admin)

| Method | Endpoint                           | Description                 |
| ------ | ---------------------------------- | --------------------------- |
| GET    | `/admin/tenants`                   | List all tenants            |
| POST   | `/admin/tenants`                   | Create new tenant           |
| GET    | `/admin/tenants/{id}`              | Get tenant details          |
| PUT    | `/admin/tenants/{id}`              | Update tenant               |
| DELETE | `/admin/tenants/{id}`              | Soft delete tenant          |
| PUT    | `/admin/tenants/{id}/status`       | Activate/Suspend tenant     |
| PUT    | `/admin/tenants/{id}/subscription` | Update subscription plan    |
| GET    | `/admin/tenants/{id}/stats`        | Get tenant usage statistics |

**POST `/admin/tenants` Payload**:

```json
{
  "name": "Springfield Academy",
  "slug": "springfield",
  "domain": "springfield.schoolsms.com",
  "adminEmail": "admin@springfield.edu",
  "plan": "pro",
  "maxStudents": 1000,
  "maxStaff": 100
}
```

---

## 3. Student Management

| Method | Endpoint                                  | Description                |
| ------ | ----------------------------------------- | -------------------------- |
| GET    | `/tenant/{slug}/students`                 | List students              |
| POST   | `/tenant/{slug}/students`                 | Create student             |
| GET    | `/tenant/{slug}/students/{id}`            | Get student details        |
| PUT    | `/tenant/{slug}/students/{id}`            | Update student             |
| DELETE | `/tenant/{slug}/students/{id}`            | Delete student             |
| GET    | `/tenant/{slug}/students/{id}/results`    | Get student results        |
| GET    | `/tenant/{slug}/students/{id}/attendance` | Get student attendance     |
| POST   | `/tenant/{slug}/students/bulk`            | Bulk import students (CSV) |
| GET    | `/tenant/{slug}/students/export`          | Export students            |

**POST `/tenant/{slug}/students` Payload**:

```json
{
  "admissionNumber": "ADM/2024/001",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "2010-05-15",
  "gender": "male",
  "classId": "class-123",
  "guardianId": "guardian-456",
  "medicalInfo": "None",
  "photo": "base64_or_url"
}
```

---

## 4. Admissions & Registration

| Method | Endpoint                                 | Description                                         |
| ------ | ---------------------------------------- | --------------------------------------------------- |
| GET    | `/tenant/{slug}/admissions`              | List applications                                   |
| POST   | `/tenant/{slug}/admissions`              | Submit new application                              |
| GET    | `/tenant/{slug}/admissions/{id}`         | Get application details                             |
| PUT    | `/tenant/{slug}/admissions/{id}`         | Update application                                  |
| PUT    | `/tenant/{slug}/admissions/{id}/status`  | Update status (Pending/Interview/Accepted/Rejected) |
| POST   | `/tenant/{slug}/admissions/{id}/approve` | Approve and convert to student                      |

---

## 5. Entrance Examinations

| Method | Endpoint                                       | Description          |
| ------ | ---------------------------------------------- | -------------------- |
| GET    | `/tenant/{slug}/exams/entrance`                | List entrance exams  |
| POST   | `/tenant/{slug}/exams/entrance`                | Create entrance exam |
| GET    | `/tenant/{slug}/exams/entrance/{id}`           | Get exam details     |
| PUT    | `/tenant/{slug}/exams/entrance/{id}`           | Update exam          |
| GET    | `/tenant/{slug}/exams/entrance/{id}/questions` | Get question bank    |
| POST   | `/tenant/{slug}/exams/entrance/{id}/questions` | Add question         |
| GET    | `/tenant/{slug}/exams/entrance/{id}/results`   | Get exam results     |
| POST   | `/tenant/{slug}/exams/entrance/{id}/publish`   | Publish results      |

---

## 6. Academic Structure

### Sessions

| Method | Endpoint                                          | Description    |
| ------ | ------------------------------------------------- | -------------- |
| GET    | `/tenant/{slug}/academics/sessions`               | List sessions  |
| POST   | `/tenant/{slug}/academics/sessions`               | Create session |
| PUT    | `/tenant/{slug}/academics/sessions/{id}`          | Update session |
| PUT    | `/tenant/{slug}/academics/sessions/{id}/activate` | Set as current |

### Terms

| Method | Endpoint                              | Description |
| ------ | ------------------------------------- | ----------- |
| GET    | `/tenant/{slug}/academics/terms`      | List terms  |
| POST   | `/tenant/{slug}/academics/terms`      | Create term |
| PUT    | `/tenant/{slug}/academics/terms/{id}` | Update term |

### Classes

| Method | Endpoint                                               | Description           |
| ------ | ------------------------------------------------------ | --------------------- |
| GET    | `/tenant/{slug}/academics/classes`                     | List classes          |
| POST   | `/tenant/{slug}/academics/classes`                     | Create class          |
| PUT    | `/tenant/{slug}/academics/classes/{id}`                | Update class          |
| GET    | `/tenant/{slug}/academics/classes/{id}/students`       | Get students in class |
| POST   | `/tenant/{slug}/academics/classes/{id}/assign-teacher` | Assign form teacher   |

### Subjects

| Method | Endpoint                                 | Description    |
| ------ | ---------------------------------------- | -------------- |
| GET    | `/tenant/{slug}/academics/subjects`      | List subjects  |
| POST   | `/tenant/{slug}/academics/subjects`      | Create subject |
| PUT    | `/tenant/{slug}/academics/subjects/{id}` | Update subject |

### Grading Systems

| Method | Endpoint                           | Description           |
| ------ | ---------------------------------- | --------------------- |
| GET    | `/tenant/{slug}/academics/grading` | Get grading config    |
| PUT    | `/tenant/{slug}/academics/grading` | Update grading config |

---

## 7. Assessment & Examinations

### Continuous Assessment (CA)

| Method | Endpoint                               | Description       |
| ------ | -------------------------------------- | ----------------- |
| GET    | `/tenant/{slug}/assessments/ca`        | List CA records   |
| POST   | `/tenant/{slug}/assessments/ca`        | Create CA         |
| PUT    | `/tenant/{slug}/assessments/ca/{id}`   | Update CA scores  |
| GET    | `/tenant/{slug}/assessments/ca/export` | Export CA records |

### Examinations

| Method | Endpoint                                       | Description        |
| ------ | ---------------------------------------------- | ------------------ |
| GET    | `/tenant/{slug}/assessments/exams`             | List exams         |
| POST   | `/tenant/{slug}/assessments/exams`             | Create exam        |
| PUT    | `/tenant/{slug}/assessments/exams/{id}`        | Update exam        |
| POST   | `/tenant/{slug}/assessments/exams/{id}/scores` | Submit exam scores |

### Timetable

| Method | Endpoint                               | Description             |
| ------ | -------------------------------------- | ----------------------- |
| GET    | `/tenant/{slug}/assessments/timetable` | Get timetable           |
| POST   | `/tenant/{slug}/assessments/timetable` | Create/Update timetable |

---

## 8. Results & Transcripts

| Method | Endpoint                                    | Description                  |
| ------ | ------------------------------------------- | ---------------------------- |
| GET    | `/tenant/{slug}/results`                    | List results by session/term |
| GET    | `/tenant/{slug}/results/student/{id}`       | Get student result           |
| POST   | `/tenant/{slug}/results/compute`            | Compute results              |
| POST   | `/tenant/{slug}/results/publish`            | Publish results              |
| GET    | `/tenant/{slug}/results/export/{studentId}` | Generate transcript (PDF)    |

---

## 9. Attendance

| Method | Endpoint                                 | Description                |
| ------ | ---------------------------------------- | -------------------------- |
| GET    | `/tenant/{slug}/attendance`              | List attendance records    |
| POST   | `/tenant/{slug}/attendance`              | Mark attendance            |
| PUT    | `/tenant/{slug}/attendance/{id}`         | Update attendance          |
| GET    | `/tenant/{slug}/attendance/student/{id}` | Get student attendance     |
| GET    | `/tenant/{slug}/attendance/class/{id}`   | Get class attendance       |
| GET    | `/tenant/{slug}/attendance/report`       | Generate attendance report |

---

## 10. Finance

### Invoices

| Method | Endpoint                                    | Description            |
| ------ | ------------------------------------------- | ---------------------- |
| GET    | `/tenant/{slug}/finance/invoices`           | List invoices          |
| POST   | `/tenant/{slug}/finance/invoices`           | Create invoice         |
| GET    | `/tenant/{slug}/finance/invoices/{id}`      | Get invoice details    |
| PUT    | `/tenant/{slug}/finance/invoices/{id}`      | Update invoice         |
| POST   | `/tenant/{slug}/finance/invoices/{id}/send` | Send invoice to parent |

### Payments

| Method | Endpoint                                       | Description         |
| ------ | ---------------------------------------------- | ------------------- |
| GET    | `/tenant/{slug}/finance/payments`              | List payments       |
| POST   | `/tenant/{slug}/finance/payments`              | Record payment      |
| GET    | `/tenant/{slug}/finance/payments/{id}`         | Get payment details |
| POST   | `/tenant/{slug}/finance/payments/{id}/receipt` | Generate receipt    |

### Ledger

| Method | Endpoint                                | Description           |
| ------ | --------------------------------------- | --------------------- |
| GET    | `/tenant/{slug}/finance/ledger`         | Get ledger entries    |
| POST   | `/tenant/{slug}/finance/ledger`         | Create ledger entry   |
| GET    | `/tenant/{slug}/finance/ledger/summary` | Get financial summary |

---

## 11. Staff Management

| Method | Endpoint                    | Description       |
| ------ | --------------------------- | ----------------- |
| GET    | `/tenant/{slug}/staff`      | List staff        |
| POST   | `/tenant/{slug}/staff`      | Create staff      |
| GET    | `/tenant/{slug}/staff/{id}` | Get staff details |
| PUT    | `/tenant/{slug}/staff/{id}` | Update staff      |
| DELETE | `/tenant/{slug}/staff/{id}` | Delete staff      |
| POST   | `/tenant/{slug}/staff/bulk` | Bulk import staff |

---

## 12. Communication

### Messages

| Method | Endpoint                                      | Description    |
| ------ | --------------------------------------------- | -------------- |
| GET    | `/tenant/{slug}/communications/messages`      | List messages  |
| POST   | `/tenant/{slug}/communications/messages`      | Send message   |
| GET    | `/tenant/{slug}/communications/messages/{id}` | Get message    |
| DELETE | `/tenant/{slug}/communications/messages/{id}` | Delete message |

### Notifications

| Method | Endpoint                                                | Description         |
| ------ | ------------------------------------------------------- | ------------------- |
| GET    | `/tenant/{slug}/communications/notifications`           | List notifications  |
| POST   | `/tenant/{slug}/communications/notifications`           | Create notification |
| PUT    | `/tenant/{slug}/communications/notifications/{id}/read` | Mark as read        |

---

## 13. Discipline & Behavior

| Method | Endpoint                                 | Description                    |
| ------ | ---------------------------------------- | ------------------------------ |
| GET    | `/tenant/{slug}/discipline`              | List incidents                 |
| POST   | `/tenant/{slug}/discipline`              | Record incident                |
| GET    | `/tenant/{slug}/discipline/{id}`         | Get incident details           |
| PUT    | `/tenant/{slug}/discipline/{id}`         | Update incident                |
| GET    | `/tenant/{slug}/discipline/student/{id}` | Get student discipline history |

---

## 14. Reports & Analytics

| Method | Endpoint                             | Description               |
| ------ | ------------------------------------ | ------------------------- |
| GET    | `/tenant/{slug}/reports/dashboard`   | Get dashboard analytics   |
| GET    | `/tenant/{slug}/reports/students`    | Student population report |
| GET    | `/tenant/{slug}/reports/attendance`  | Attendance trends         |
| GET    | `/tenant/{slug}/reports/finance`     | Financial overview        |
| GET    | `/tenant/{slug}/reports/performance` | Academic performance      |
| POST   | `/tenant/{slug}/reports/custom`      | Generate custom report    |

---

## 15. Settings & Configuration

### School Profile

| Method | Endpoint                          | Description           |
| ------ | --------------------------------- | --------------------- |
| GET    | `/tenant/{slug}/settings/profile` | Get school profile    |
| PUT    | `/tenant/{slug}/settings/profile` | Update school profile |

### Branding

| Method | Endpoint                                | Description         |
| ------ | --------------------------------------- | ------------------- |
| GET    | `/tenant/{slug}/settings/branding`      | Get branding config |
| PUT    | `/tenant/{slug}/settings/branding`      | Update branding     |
| POST   | `/tenant/{slug}/settings/branding/logo` | Upload logo         |

### Roles & Permissions

| Method | Endpoint                              | Description          |
| ------ | ------------------------------------- | -------------------- |
| GET    | `/tenant/{slug}/settings/roles`       | List roles           |
| POST   | `/tenant/{slug}/settings/roles`       | Create role          |
| PUT    | `/tenant/{slug}/settings/roles/{id}`  | Update role          |
| DELETE | `/tenant/{slug}/settings/roles/{id}`  | Delete role          |
| GET    | `/tenant/{slug}/settings/permissions` | List all permissions |

---

## Data Models

### User

```json
{
  "id": "uuid",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "super-admin|school-admin|teacher|parent|student",
  "permissions": ["array of strings"],
  "tenantId": "uuid",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Tenant

```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "domain": "string",
  "plan": "free|pro|enterprise",
  "status": "active|suspended|trial",
  "subscriptionExpiry": "date",
  "maxStudents": "number",
  "maxStaff": "number",
  "branding": {...},
  "academicConfig": {...}
}
```

### Student

```json
{
  "id": "uuid",
  "tenantId": "uuid",
  "admissionNumber": "string",
  "firstName": "string",
  "lastName": "string",
  "dateOfBirth": "date",
  "gender": "male|female",
  "currentClassId": "uuid",
  "guardianId": "uuid",
  "status": "active|graduated|withdrawn",
  "medicalInfo": "string",
  "photo": "url"
}
```

---

## Error Responses

All endpoints return standard HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Response Format**:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

---

## Pagination

List endpoints support pagination:

```
GET /tenant/{slug}/students?page=1&limit=20&sort=createdAt:desc
```

**Response**:

```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## Webhooks (Optional)

For real-time integrations:

| Event              | Description          |
| ------------------ | -------------------- |
| `student.created`  | New student enrolled |
| `payment.received` | New payment recorded |
| `result.published` | Results published    |
| `tenant.suspended` | Tenant suspended     |
