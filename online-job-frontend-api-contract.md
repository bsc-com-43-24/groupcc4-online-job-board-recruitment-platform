# Group CC2 Recruitment API — Frontend Integration Contract

**API version:** 1.0.0  
**OpenAPI version:** 3.1.0  
**Server declared by source:** `http://api.online-job.mikhy.me`  
**Source contact:** Group CC2

> Purpose: This document is an implementation contract for an AI coding agent refactoring an existing frontend to integrate with the Group CC2 Recruitment API. The OpenAPI source is authoritative for endpoint behavior. Where the source is incomplete or inconsistent, this contract flags the gap rather than inventing behavior.

## 1. Instructions to the frontend-refactoring agent

1. Inspect the existing repository before changing code. Identify framework, routing, state management, API clients, authentication flow, role-specific layouts, forms, and current feature coverage.
2. Treat this contract and the supplied `api-specification.json` as the backend source of truth. Do not invent endpoints, fields, enum values, or response wrappers.
3. Preserve the current visual design and UX unless a change is required to support the API. Avoid an unnecessary redesign.
4. Implement a centralized API client. Keep the base URL in environment configuration; do not scatter endpoint strings throughout components.
5. Attach `Authorization: Bearer <token>` to operations that declare bearer security. Do not attach a token to public operations unless required by the backend.
6. Build role-aware UI for `JOB_SEEKER`, `EMPLOYER`, and `ADMIN`. Never treat hiding a button as authorization; backend authorization remains authoritative.
7. Respect multipart upload requirements and exact field names. Do not JSON-encode file bytes or manually set a multipart boundary.
8. Handle documented success codes including `204` (no response body), `202`, and `201`; do not assume every success returns JSON.
9. Parse backend error payloads defensively. Display field-level validation messages when `fieldErrors` are present, and handle `401`, `403`, `404`, `409`, `413`, `429`, and `503` distinctly.
10. Do not assume a response schema from a sample alone. Use the schema definitions below and preserve unknown fields where practical.
11. Before coding, produce a frontend-to-endpoint mapping and identify screens that have no supporting endpoint. Do not silently remove unsupported UI; report it.
12. After implementation, run the project’s existing checks, add/update API integration tests, and provide a list of changed files, assumptions, and unresolved backend questions.

## 2. API-wide conventions

- **Base URL in OpenAPI:** `http://api.online-job.mikhy.me`. This is HTTP, not HTTPS. Confirm deployment/TLS configuration before production use; do not silently rewrite the declared URL.
- **API prefix:** Most application routes begin with `/api`.
- **Identifiers:** Path IDs are generally UUID strings; use the exact IDs returned by the API.
- **Dates:** Date-only fields use ISO `YYYY-MM-DD`; date-time fields use ISO date-time format.
- **Authentication:** Bearer JWT in `Authorization` header for secured operations.
- **Roles:** `JOB_SEEKER`, `EMPLOYER`, `ADMIN`; public registration cannot create `ADMIN` accounts.
- **Pagination:** Where documented, `page` is zero-based; default `page=0`, `size=20`, maximum `size=100` for job browsing and employer jobs. Shortlist pagination documents defaults but not maximum.
- **Content types:** JSON for ordinary data; `multipart/form-data` for uploads.
- **Do not infer:** token field name, token expiry/refresh behavior, exact error `code` enum, or unspecified response fields unless defined below.

## 3. Authentication and role behavior

| Capability | JOB_SEEKER | EMPLOYER | ADMIN |
|---|:---:|:---:|:---:|
| Public registration | Yes (only role allowed) | No via public register | No |
| Browse active jobs | Yes | Not documented for this role | Not documented |
| Apply to jobs / manage own applications | Yes | No | No |
| Maintain job-seeker profile and documents | Yes | No | No |
| Submit employer verification request | Yes | Not documented | No |
| Create/manage companies and jobs | No | Yes | Not documented |
| Review applications for owned jobs | No | Yes | No |
| Retained shortlisted candidate history | No | Yes | Not documented |
| Administer users and employer requests | No | No | Yes |

### Authentication implementation notes
- `POST /api/auth/login` returns `LoginResponse`; inspect its schema before wiring token extraction.
- `GET /api/auth/me` returns `CurrentUserResponse`; `GET /api/users/me` returns `UserResponse`. Both claim to identify the current user. Confirm whether they differ before choosing one canonical frontend call.
- `POST /api/auth/logout` invalidates the authenticated account's current token version and returns `204`.
- Password change and reset return `204`; do not attempt to parse a JSON body.
- No refresh-token endpoint is documented. Do not build a refresh flow against an invented route.
- No token persistence mechanism is prescribed by the API. Choose storage according to the existing frontend architecture and security review; do not assume localStorage is mandated by the contract.

## 4. Endpoint catalogue

**Total documented operations:** 55 across 42 paths.

### `GET /`

**No summary**

- **Tag:** root-controller
- **Operation ID:** `root`
- **Authentication:** Inherits no global security declaration in this operation; confirm behavior with backend. (No operation-level security entry.)

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | OK | `*/*`: object |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `401` | Authentication is required or credentials are invalid. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /actuator/health`

**Check application health**

- **Tag:** Health
- **Operation ID:** `not specified`
- **Purpose / behavior:** Public readiness check. Component details are disabled.
- **Authentication:** Public; no security requirement declared.

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Application health is UP | `application/json`: HealthResponse |

### `GET /api/admin/employer-requests`

**List pending employer upgrade requests**

- **Tag:** Users
- **Operation ID:** `pending`
- **Purpose / behavior:** Returns upgrade requests awaiting an administrator decision. Requires an ADMIN bearer token.
- **Authentication:** bearerAuth.

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns pending upgrade requests. | `*/*`: array of EmployerUpgradeResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller must have the ADMIN role. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/admin/employer-requests/{requestId}`

**Get an employer verification application**

- **Tag:** Users
- **Operation ID:** `get_4`
- **Purpose / behavior:** Returns company details and review status. ADMIN bearer token required.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `requestId` | path | Yes | string (uuid) |  |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Verification application details. | `*/*`: EmployerUpgradeResponse |
| `403` | ADMIN role required. | `application/json`: ApiErrorResponse |
| `404` | Request not found. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `401` | Authentication is required or credentials are invalid. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `PATCH /api/admin/employer-requests/{requestId}/approve`

**Approve an employer upgrade request**

- **Tag:** Users
- **Operation ID:** `approve`
- **Purpose / behavior:** Approves requestId and upgrades the applicant to employer. Requires an ADMIN bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `requestId` | path | Yes | string (uuid) | UUID of the employer upgrade request. |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the approved request. | `*/*`: EmployerUpgradeResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller must have the ADMIN role. | `application/json`: ApiErrorResponse |
| `404` | Request was not found. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/admin/employer-requests/{requestId}/document`

**Get a temporary link to a company registration document**

- **Tag:** Users
- **Operation ID:** `document`
- **Purpose / behavior:** Returns a short lived signed URL. ADMIN bearer token required.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `requestId` | path | Yes | string (uuid) |  |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Signed private document URL. | `*/*`: DocumentLink |
| `403` | ADMIN role required. | `application/json`: ApiErrorResponse |
| `404` | Request not found. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `401` | Authentication is required or credentials are invalid. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `PATCH /api/admin/employer-requests/{requestId}/reject`

**Reject an employer upgrade request**

- **Tag:** Users
- **Operation ID:** `reject`
- **Purpose / behavior:** Rejects requestId with a reason. Requires an ADMIN bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `requestId` | path | Yes | string (uuid) | UUID of the employer upgrade request. |

- **Request body required:** Yes.
- **Body notes:** Reason for rejecting the request.
- **Content-Type:** `application/json`; schema: `EmployerUpgradeDecision`.
```json
{
  "reason": "Business details could not be verified."
}
```

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the rejected request. | `*/*`: EmployerUpgradeResponse |
| `400` | Request body is malformed or fails validation. | `application/json`: ApiErrorResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller must have the ADMIN role. | `application/json`: ApiErrorResponse |
| `404` | Request was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/admin/users`

**List users**

- **Tag:** Users
- **Operation ID:** `list_1`
- **Purpose / behavior:** Returns user accounts visible to the authenticated administrator. Requires an ADMIN bearer token.
- **Authentication:** bearerAuth.

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns user account details. | `*/*`: array of UserResponse |
| `401` | A valid bearer token is required | `application/json`: ApiErrorResponse |
| `403` | The caller must have the ADMIN role | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `POST /api/admin/users`

**Create a job seeker or employer account**

- **Tag:** Users
- **Operation ID:** `create_2`
- **Purpose / behavior:** Creates an active account for the selected role. Only JOB_SEEKER and EMPLOYER are allowed; ADMIN accounts must use the role-assignment workflow.
- **Authentication:** bearerAuth.

- **Request body required:** Yes.
- **Content-Type:** `application/json`; schema: `CreateAccountRequest`.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `201` | The account was created. | `*/*`: UserResponse |
| `400` | The email, password, or role is invalid. | `application/json`: ApiErrorResponse |
| `401` | A valid bearer token is required | `application/json`: ApiErrorResponse |
| `403` | The caller must have the ADMIN role | `application/json`: ApiErrorResponse |
| `409` | The email is already registered. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/admin/users/{id}`

**Get a user by ID**

- **Tag:** Users
- **Operation ID:** `get_3`
- **Purpose / behavior:** Returns the account identified by id. Requires an ADMIN bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `id` | path | Yes | string (uuid) | UUID of the user account. |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the user account. | `*/*`: UserResponse |
| `401` | A valid bearer token is required | `application/json`: ApiErrorResponse |
| `403` | The caller must have the ADMIN role | `application/json`: ApiErrorResponse |
| `404` | User was not found. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `PATCH /api/admin/users/{id}/remove`

**Remove a user account**

- **Tag:** Users
- **Operation ID:** `remove`
- **Purpose / behavior:** Removes the account identified by id. Requires an ADMIN bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `id` | path | Yes | string (uuid) | UUID of the user account. |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the resulting user account representation. | `*/*`: UserResponse |
| `401` | A valid bearer token is required | `application/json`: ApiErrorResponse |
| `403` | The caller must have the ADMIN role | `application/json`: ApiErrorResponse |
| `404` | User was not found. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `PATCH /api/admin/users/{id}/role`

**Assign administrator role**

- **Tag:** Users
- **Operation ID:** `assignRole`
- **Purpose / behavior:** Promotes the user identified by id to administrator. Requires an ADMIN bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `id` | path | Yes | string (uuid) | UUID of the user account. |

- **Request body required:** Yes.
- **Body notes:** The only supported role value is ADMIN.
- **Content-Type:** `application/json`; schema: `AssignAdminRoleRequest`.
```json
{
  "role": "ADMIN"
}
```

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the updated user account. | `*/*`: UserResponse |
| `400` | Request body is malformed or role is not ADMIN. | `application/json`: ApiErrorResponse |
| `401` | A valid bearer token is required | `application/json`: ApiErrorResponse |
| `403` | The caller must have the ADMIN role | `application/json`: ApiErrorResponse |
| `404` | User was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `PATCH /api/admin/users/{id}/suspend`

**Suspend a user account**

- **Tag:** Users
- **Operation ID:** `suspend`
- **Purpose / behavior:** Suspends the account identified by id. Requires an ADMIN bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `id` | path | Yes | string (uuid) | UUID of the user account. |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the updated user account. | `*/*`: UserResponse |
| `401` | A valid bearer token is required | `application/json`: ApiErrorResponse |
| `403` | The caller must have the ADMIN role | `application/json`: ApiErrorResponse |
| `404` | User was not found. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/applications`

**List my applications**

- **Tag:** Application
- **Operation ID:** `mine`
- **Purpose / behavior:** Returns applications submitted by the authenticated job seeker. Requires a JOB_SEEKER bearer token.
- **Authentication:** bearerAuth.

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the caller's applications. | `*/*`: array of ApplicationResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted to view applications. | `application/json`: ApiErrorResponse |
| `503` | Application service is unavailable. | `*/*`: array of ApplicationResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `POST /api/applications`

**Apply to a job**

- **Tag:** Application
- **Operation ID:** `apply`
- **Purpose / behavior:** Creates a PENDING application for the authenticated job seeker. Applicant identity, application ID, status, and timestamps are assigned by the server. Each application requires its own PDF CV (maximum 5 MiB) and plain text cover letter (maximum 10,000 characters).
- **Authentication:** bearerAuth.

- **Request body required:** Yes.
- **Body notes:** Multipart form with a jobId and the PDF CV to submit for this application. The CV is preserved for this application and does not replace profile documents.
- **Content-Type:** `multipart/form-data`; schema: `ApplicationSubmissionRequest`.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `201` | Application created | `*/*`: ApplicationResponse |
| `400` | Missing job ID/CV, PROFILE_INCOMPLETE, or invalid CV | `application/json`: ApiErrorResponse |
| `413` | CV exceeds the 5 MiB upload limit | `*/*`: ApiError |
| `401` | Authentication is required | `application/json`: ApiErrorResponse |
| `403` | Only active job seekers may apply | `application/json`: ApiErrorResponse |
| `404` | Job posting does not exist | `application/json`: ApiErrorResponse |
| `409` | Job is not accepting applications or this seeker already applied | `application/json`: ApiErrorResponse |
| `503` | Job posting service is unavailable | `*/*`: ApiError |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/applications/{applicationId}`

**Get my application**

- **Tag:** Application
- **Operation ID:** `one`
- **Purpose / behavior:** Returns the application identified by applicationId if it belongs to the authenticated job seeker. Requires a JOB_SEEKER bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `applicationId` | path | Yes | string (uuid) | UUID of the application. |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the application. | `*/*`: ApplicationResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted to view this application. | `application/json`: ApiErrorResponse |
| `404` | Application was not found. | `application/json`: ApiErrorResponse |
| `503` | Application service is unavailable. | `*/*`: ApplicationResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `PATCH /api/applications/{applicationId}`

**Update my pending application**

- **Tag:** Application
- **Operation ID:** `updateMultipart`
- **Purpose / behavior:** Updates the cover letter while the related job is still accepting applications.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `applicationId` | path | Yes | string (uuid) |  |
| `coverLetter` | query | No | string |  |

- **Request body required:** Yes.
- **Content-Type:** `multipart/form-data`; schema: `object`.
- **Content-Type:** `application/json`; schema: `ApplicationUpdateRequest`.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Application updated | `*/*`: ApplicationResponse |
| `400` | Invalid cover letter | `application/json`: ApiErrorResponse |
| `404` | Application not found | `application/json`: ApiErrorResponse |
| `409` | Application already decided or withdrawn | `application/json`: ApiErrorResponse |
| `413` | CV exceeds the upload limit | `*/*`: ApplicationResponse |
| `503` | Document storage is unavailable | `*/*`: ApplicationResponse |
| `401` | Authentication is required or credentials are invalid. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `DELETE /api/applications/{applicationId}`

**Withdraw my pending application**

- **Tag:** Application
- **Operation ID:** `withdraw`
- **Purpose / behavior:** Logical withdrawal retains application, CV, and decision history. Repeating withdrawal succeeds with 204. Only PENDING applications may be withdrawn.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `applicationId` | path | Yes | string (uuid) |  |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `204` | Withdrawn or already withdrawn | No body documented |
| `404` | Application not found | `application/json`: ApiErrorResponse |
| `409` | Application already decided | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `401` | Authentication is required or credentials are invalid. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `POST /api/auth/change-password`

**Change password**

- **Tag:** Auth
- **Operation ID:** `changePassword`
- **Purpose / behavior:** Changes the authenticated account password after verifying the current password. Requires a valid bearer token.
- **Authentication:** bearerAuth.

- **Request body required:** Yes.
- **Body notes:** Current password and new password (12 to 72 characters).
- **Content-Type:** `application/json`; schema: `ChangePasswordRequest`.
```json
{
  "currentPassword": "StrongPassword123!",
  "newPassword": "EvenStrongerPassword123!"
}
```

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `204` | Password changed. | No body documented |
| `400` | Request body is malformed, fails validation, or the new password is not accepted. | `application/json`: ApiErrorResponse |
| `401` | A valid bearer token is required or the current password is invalid. | `application/json`: ApiErrorResponse |
| `500` | Unexpected server error. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |

### `POST /api/auth/forgot-password`

**Request a password reset**

- **Tag:** Auth
- **Operation ID:** `forgotPassword`
- **Purpose / behavior:** Accepts an account email and starts the password recovery flow. Returns a response that does not disclose whether the account exists.
- **Authentication:** Inherits no global security declaration in this operation; confirm behavior with backend. (No operation-level security entry.)

- **Request body required:** Yes.
- **Body notes:** Email address for the account.
- **Content-Type:** `application/json`; schema: `ForgotPasswordRequest`.
```json
{
  "email": "applicant@example.com"
}
```

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `202` | Password reset request accepted. | `*/*`: PasswordResetResponse |
| `400` | Request body is malformed or fails validation. | `application/json`: ApiErrorResponse |
| `500` | Unexpected server error. | `application/json`: ApiErrorResponse |
| `401` | Authentication is required or credentials are invalid. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |

### `POST /api/auth/login`

**Log in**

- **Tag:** Auth
- **Operation ID:** `login`
- **Purpose / behavior:** Authenticates an account with its email and password and returns a bearer token.
- **Authentication:** Inherits no global security declaration in this operation; confirm behavior with backend. (No operation-level security entry.)

- **Request body required:** Yes.
- **Body notes:** Account credentials.
- **Content-Type:** `application/json`; schema: `LoginRequest`.
```json
{
  "email": "applicant@example.com",
  "password": "StrongPassword123!"
}
```

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Credentials accepted; returns the token response. | `*/*`: LoginResponse |
| `400` | Request body is malformed or fails validation. | `application/json`: ApiErrorResponse |
| `401` | Credentials are invalid. | `application/json`: ApiErrorResponse |
| `500` | Unexpected server error. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |

### `POST /api/auth/logout`

**Log out**

- **Tag:** Auth
- **Operation ID:** `logout`
- **Purpose / behavior:** Invalidates the authenticated account's current token version. Requires a valid bearer token.
- **Authentication:** bearerAuth.

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `204` | Logout completed. | No body documented |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `500` | Unexpected server error. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |

### `GET /api/auth/me`

**Get the current authenticated user**

- **Tag:** Auth
- **Operation ID:** `currentUser_1`
- **Purpose / behavior:** Returns the account associated with the valid bearer token.
- **Authentication:** bearerAuth.

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the current account details. | `*/*`: CurrentUserResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `500` | Unexpected server error. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |

### `POST /api/auth/register`

**Register a job seeker account**

- **Tag:** Auth
- **Operation ID:** `register`
- **Purpose / behavior:** Creates a new account. Public registration accepts the JOB_SEEKER role only; credentials must satisfy the request validation rules.
- **Authentication:** Inherits no global security declaration in this operation; confirm behavior with backend. (No operation-level security entry.)

- **Request body required:** Yes.
- **Body notes:** Email, password, and optional JOB_SEEKER role.
- **Content-Type:** `application/json`; schema: `RegisterRequest`.
```json
{
  "email": "applicant@example.com",
  "password": "StrongPassword123!",
  "role": "JOB_SEEKER"
}
```

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `201` | Account created; returns the registered account details. | `*/*`: RegisterResponse |
| `400` | Request body is malformed or fails validation. | `application/json`: ApiErrorResponse |
| `409` | Email is already registered. | `application/json`: ApiErrorResponse |
| `500` | Unexpected server error. | `application/json`: ApiErrorResponse |
| `401` | Authentication is required or credentials are invalid. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |

### `POST /api/auth/reset-password`

**Reset password**

- **Tag:** Auth
- **Operation ID:** `resetPassword`
- **Purpose / behavior:** Sets a new password using a valid one-time reset token.
- **Authentication:** Inherits no global security declaration in this operation; confirm behavior with backend. (No operation-level security entry.)

- **Request body required:** Yes.
- **Body notes:** Reset token and new password (12 to 72 characters).
- **Content-Type:** `application/json`; schema: `PasswordResetRequest`.
```json
{
  "resetToken": "reset-token-from-email",
  "newPassword": "NewStrongPassword123!"
}
```

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `204` | Password reset completed. | No body documented |
| `400` | Request body is malformed, fails validation, or the reset token is invalid. | `application/json`: ApiErrorResponse |
| `500` | Unexpected server error. | `application/json`: ApiErrorResponse |
| `401` | Authentication is required or credentials are invalid. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |

### `GET /api/companies`

**List my companies**

- **Tag:** Company
- **Operation ID:** `list`
- **Purpose / behavior:** Returns companies owned by the authenticated EMPLOYER. Requires a bearer token.
- **Authentication:** bearerAuth.

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the employer's companies. | `*/*`: array of CompanyResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller is not an active employer. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `POST /api/companies`

**Create a company**

- **Tag:** Company
- **Operation ID:** `create_1`
- **Purpose / behavior:** Creates a company owned by the authenticated EMPLOYER. Requires a bearer token.
- **Authentication:** bearerAuth.

- **Request body required:** Yes.
- **Body notes:** Company name and optional company details.
- **Content-Type:** `application/json`; schema: `CompanyRequest`.
```json
{
  "name": "Acme Technologies",
  "description": "Software company",
  "contactEmail": "contact@acme.example",
  "contactPhone": "+265999000111",
  "location": "Blantyre"
}
```

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `201` | Company created; returns the company details. | `*/*`: CompanyResponse |
| `400` | Request body is malformed or fails validation. | `application/json`: ApiErrorResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller is not an active employer. | `application/json`: ApiErrorResponse |
| `409` | A company with this name already exists for the employer. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/companies/{companyId}`

**Get my company**

- **Tag:** Company
- **Operation ID:** `get_1`
- **Purpose / behavior:** Returns the company identified by companyId if owned by the authenticated EMPLOYER. Requires a bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `companyId` | path | Yes | string (uuid) | UUID of the company. |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns company details. | `*/*`: CompanyResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller is not an active employer. | `application/json`: ApiErrorResponse |
| `404` | Company was not found for this employer. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `PUT /api/companies/{companyId}`

**Update my company**

- **Tag:** Company
- **Operation ID:** `update_2`
- **Purpose / behavior:** Replaces company details for companyId if it is owned by the authenticated EMPLOYER. Requires a bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `companyId` | path | Yes | string (uuid) | UUID of the company. |

- **Request body required:** Yes.
- **Body notes:** Company name and optional company details.
- **Content-Type:** `application/json`; schema: `CompanyRequest`.
```json
{
  "name": "Acme Technologies",
  "description": "Software company",
  "contactEmail": "contact@acme.example",
  "contactPhone": "+265999000111",
  "location": "Blantyre"
}
```

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns updated company details. | `*/*`: CompanyResponse |
| `400` | Request body is malformed or fails validation. | `application/json`: ApiErrorResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller is not an active employer. | `application/json`: ApiErrorResponse |
| `404` | Company was not found for this employer. | `application/json`: ApiErrorResponse |
| `409` | A company with this name already exists for the employer. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/employer-requests`

**List my employer upgrade requests**

- **Tag:** Users
- **Operation ID:** `own`
- **Purpose / behavior:** Returns upgrade requests submitted by the authenticated user. Requires a bearer token.
- **Authentication:** bearerAuth.

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the caller's upgrade requests. | `*/*`: array of EmployerUpgradeResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The account is not permitted to view requests. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `POST /api/employer-requests`

**Submit an employer verification application**

- **Tag:** Users
- **Operation ID:** `submit`
- **Purpose / behavior:** Submits company details as JSON in the application multipart part and a required PDF registration document in the document part. Requires a JOB_SEEKER bearer token.
- **Authentication:** bearerAuth.

- **Request body required:** Yes.
- **Content-Type:** `multipart/form-data`; schema: `EmployerVerificationMultipartRequest`.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `201` | Request submitted; returns request details. | `*/*`: EmployerUpgradeResponse |
| `400` | Multipart parts are malformed or fail validation. | `application/json`: ApiErrorResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The account is not permitted to submit this request. | `application/json`: ApiErrorResponse |
| `409` | An upgrade request cannot be submitted in the account's current state. | `application/json`: ApiErrorResponse |
| `413` | Registration document exceeds 5 MiB. | `*/*`: EmployerUpgradeResponse |
| `503` | Private document storage is unavailable. | `*/*`: EmployerUpgradeResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/employer-requests/`

**List my employer upgrade requests**

- **Tag:** Users
- **Operation ID:** `own_1`
- **Purpose / behavior:** Returns upgrade requests submitted by the authenticated user. Requires a bearer token.
- **Authentication:** bearerAuth.

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the caller's upgrade requests. | `*/*`: array of EmployerUpgradeResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The account is not permitted to view requests. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `POST /api/employer-requests/`

**Submit an employer verification application**

- **Tag:** Users
- **Operation ID:** `submit_1`
- **Purpose / behavior:** Submits company details as JSON in the application multipart part and a required PDF registration document in the document part. Requires a JOB_SEEKER bearer token.
- **Authentication:** bearerAuth.

- **Request body required:** Yes.
- **Content-Type:** `multipart/form-data`; schema: `EmployerVerificationMultipartRequest`.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `201` | Request submitted; returns request details. | `*/*`: EmployerUpgradeResponse |
| `400` | Multipart parts are malformed or fail validation. | `application/json`: ApiErrorResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The account is not permitted to submit this request. | `application/json`: ApiErrorResponse |
| `409` | An upgrade request cannot be submitted in the account's current state. | `application/json`: ApiErrorResponse |
| `413` | Registration document exceeds 5 MiB. | `*/*`: EmployerUpgradeResponse |
| `503` | Private document storage is unavailable. | `*/*`: EmployerUpgradeResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/employer-requests/{requestId}`

**Get my employer verification submission**

- **Tag:** Users
- **Operation ID:** `ownOne`
- **Purpose / behavior:** Returns only the authenticated applicant's submission and its status.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `requestId` | path | Yes | string (uuid) |  |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Submission status and details. | `*/*`: EmployerUpgradeResponse |
| `404` | Submission not found for this applicant. | `application/json`: ApiErrorResponse |
| `403` | JOB_SEEKER or EMPLOYER role required. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `401` | Authentication is required or credentials are invalid. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/employer/applications`

**List applications for my jobs**

- **Tag:** Application
- **Operation ID:** `applications`
- **Purpose / behavior:** Returns applications for jobs owned by the authenticated EMPLOYER, including applicant display names and the metadata for each application's submitted CV. Requires a bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `jobId` | query | No | string (uuid) | Optional UUID to filter applications by job. |
| `status` | query | No | string (enum: PENDING, SHORTLISTED, REJECTED) | Optional application status filter. |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns matching applications. | `*/*`: array of ApplicationResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted to review applications. | `application/json`: ApiErrorResponse |
| `400` | A query parameter has an invalid format. | `application/json`: ApiErrorResponse |
| `503` | Application service is unavailable. | `*/*`: array of ApplicationResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/employer/applications/{applicationId}`

**Get an application for my jobs**

- **Tag:** Application
- **Operation ID:** `application`
- **Purpose / behavior:** Returns the application and its submitted CV metadata when it belongs to one of the authenticated employer's jobs. Requires an EMPLOYER bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `applicationId` | path | Yes | string (uuid) | UUID of the application. |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the application. | `*/*`: ApplicationResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted to access this application. | `application/json`: ApiErrorResponse |
| `404` | Application was not found. | `application/json`: ApiErrorResponse |
| `503` | Application service is unavailable. | `*/*`: ApplicationResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/employer/applications/{applicationId}/cv`

**Get an application's submitted CV**

- **Tag:** Application
- **Operation ID:** `applicationCv`
- **Purpose / behavior:** Returns a short-lived private download link for the CV submitted with this application. Only the employer that owns the application's job may request it.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `applicationId` | path | Yes | string (uuid) |  |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns a short-lived download link. | `*/*`: DownloadResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller is not authorized for this job. | `application/json`: ApiErrorResponse |
| `404` | Application was not found. | `application/json`: ApiErrorResponse |
| `503` | Document storage is unavailable. | `*/*`: DownloadResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/employer/applications/{applicationId}/profile`

**Get an applicant profile**

- **Tag:** Application
- **Operation ID:** `applicationProfile`
- **Purpose / behavior:** Returns the profile for an application belonging to one of the authenticated employer's jobs.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `applicationId` | path | Yes | string (uuid) | UUID of the application. |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | OK | `*/*`: ProfileResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `401` | Authentication is required or credentials are invalid. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `PATCH /api/employer/applications/{applicationId}/status`

**Update an application status**

- **Tag:** Shortlisting, Application
- **Operation ID:** `changeStatus`
- **Purpose / behavior:** Sets the status of an application belonging to an authenticated employer's job. Requires an EMPLOYER bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `applicationId` | path | Yes | string (uuid) | UUID of the application. |

- **Request body required:** Yes.
- **Body notes:** New application status.
- **Content-Type:** `application/json`; schema: `ApplicationStatusRequest`.
```json
{
  "status": "SHORTLISTED"
}
```

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the updated application. | `*/*`: ApplicationResponse |
| `400` | Request body is malformed or status is invalid. | `application/json`: ApiErrorResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted to update this application. | `application/json`: ApiErrorResponse |
| `404` | Application was not found. | `application/json`: ApiErrorResponse |
| `409` | The requested status transition is not allowed. | `application/json`: ApiErrorResponse |
| `503` | Application service is unavailable. | `*/*`: ApplicationResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/employer/jobs`

**List my job postings**

- **Tag:** Job
- **Operation ID:** `myJobs`
- **Purpose / behavior:** Returns a page of the authenticated EMPLOYER's job postings. Requires a bearer token. Page defaults to 0 and size to 20; results are sorted newest first.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `status` | query | No | string (enum: ACTIVE, EXPIRED, CLOSED) | Optional effective job status filter. |
| `page` | query | No | integer (int32) | Zero-based page index (default 0). |
| `size` | query | No | integer (int32) | Page size (default 20; maximum 100). |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns a page of the employer's jobs. | `*/*`: PageResponseJobResponse |
| `400` | Status query parameter has an invalid value. | `application/json`: ApiErrorResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller does not have the EMPLOYER role. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/employer/shortlisted-candidates`

**List retained shortlisted candidates**

- **Tag:** Shortlisting
- **Operation ID:** `list_2`
- **Purpose / behavior:** Returns retained shortlist records for jobs owned by the authenticated employer. Records remain available after application withdrawal, removal from active application views, or job expiry.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `page` | query | No | integer (int32) |  |
| `size` | query | No | integer (int32) |  |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | OK | `*/*`: PageResponseShortlistCandidateResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `401` | Authentication is required or credentials are invalid. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/employer/shortlisted-candidates/{candidateId}`

**Get a retained shortlisted candidate**

- **Tag:** Shortlisting
- **Operation ID:** `get_2`
- **Purpose / behavior:** Returns one immutable shortlist record when it belongs to a job owned by the authenticated employer.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `candidateId` | path | Yes | string (uuid) |  |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | OK | `*/*`: ShortlistCandidateResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `401` | Authentication is required or credentials are invalid. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/jobs`

**Browse job postings**

- **Tag:** Job
- **Operation ID:** `browse`
- **Purpose / behavior:** Returns a page of active, non-expired jobs to a JOB_SEEKER. Requires a bearer token. Page defaults to 0 and size to 20; results are sorted newest first.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `location` | query | No | string | Filter by location text. |
| `q` | query | No | string | Search job title and description. |
| `page` | query | No | integer (int32) | Zero-based page index (default 0). |
| `size` | query | No | integer (int32) | Page size (default 20; maximum 100). |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns a page of matching jobs. | `*/*`: PageResponseJobResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller does not have the JOB_SEEKER role. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `POST /api/jobs`

**Create a job posting**

- **Tag:** Job
- **Operation ID:** `create`
- **Purpose / behavior:** Creates a job posting for a company owned by the authenticated EMPLOYER. Requires a bearer token.
- **Authentication:** bearerAuth.

- **Request body required:** Yes.
- **Body notes:** Job details. The employer identity comes from the bearer token.
- **Content-Type:** `application/json`; schema: `JobRequest`.
```json
{
  "companyId": "11111111-1111-1111-1111-111111111111",
  "title": "Senior Java Developer",
  "description": "Build backend services.",
  "requiredQualifications": "Java 21, Spring Boot, PostgreSQL",
  "dueDate": "2099-12-31",
  "location": "Blantyre"
}
```

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `201` | Job created; returns the posting and its location header. | `*/*`: JobResponse |
| `400` | Request body is malformed, fails validation, or dueDate is not after today. | `application/json`: ApiErrorResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller does not have the EMPLOYER role. | `application/json`: ApiErrorResponse |
| `404` | The company was not found for this employer. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/jobs/{jobId}`

**Get a job posting**

- **Tag:** Job
- **Operation ID:** `get`
- **Purpose / behavior:** Returns the job identified by jobId. Employers can view their own jobs; job seekers can view active jobs. Requires a bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `jobId` | path | Yes | string (uuid) | UUID of the job posting. |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the job posting. | `*/*`: JobResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted to view jobs. | `application/json`: ApiErrorResponse |
| `404` | Job was not found or is not visible to this caller. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `PUT /api/jobs/{jobId}`

**Update a job posting**

- **Tag:** Job
- **Operation ID:** `update_1`
- **Purpose / behavior:** Replaces jobId's details when the job and selected company belong to the authenticated EMPLOYER. Requires a bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `jobId` | path | Yes | string (uuid) | UUID of the job posting. |

- **Request body required:** Yes.
- **Body notes:** Replacement job details.
- **Content-Type:** `application/json`; schema: `JobRequest`.
```json
{
  "companyId": "11111111-1111-1111-1111-111111111111",
  "title": "Senior Java Developer",
  "description": "Build backend services.",
  "requiredQualifications": "Java 21, Spring Boot, PostgreSQL",
  "dueDate": "2099-12-31",
  "location": "Blantyre"
}
```

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns updated job details. | `*/*`: JobResponse |
| `400` | Request body is malformed, fails validation, or dueDate is not after today. | `application/json`: ApiErrorResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller does not have the EMPLOYER role. | `application/json`: ApiErrorResponse |
| `404` | Job or owned company was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `DELETE /api/jobs/{jobId}`

**Delete a job posting**

- **Tag:** Job
- **Operation ID:** `delete`
- **Purpose / behavior:** Deletes jobId if it belongs to the authenticated EMPLOYER. Requires a bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `jobId` | path | Yes | string (uuid) | UUID of the job posting. |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `204` | Job deleted. | No body documented |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller does not have the EMPLOYER role. | `application/json`: ApiErrorResponse |
| `404` | Job was not found for this employer. | `application/json`: ApiErrorResponse |
| `409` | Job has submitted applications and cannot be deleted. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `PATCH /api/jobs/{jobId}/close`

**Close a job posting**

- **Tag:** Job
- **Operation ID:** `close`
- **Purpose / behavior:** Closes jobId if it belongs to the authenticated EMPLOYER. Closing an already closed job returns it unchanged. Requires a bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `jobId` | path | Yes | string (uuid) | UUID of the job posting. |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the closed job posting. | `*/*`: JobResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller does not have the EMPLOYER role. | `application/json`: ApiErrorResponse |
| `404` | Job was not found for this employer. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/profile`

**Get my profile**

- **Tag:** Profile
- **Operation ID:** `read`
- **Purpose / behavior:** Returns the profile belonging to the authenticated JOB_SEEKER. Requires a bearer token.
- **Authentication:** bearerAuth.

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the job seeker's profile. | `*/*`: ProfileResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted to access a profile. | `application/json`: ApiErrorResponse |
| `404` | Profile was not found. | `application/json`: ApiErrorResponse |
| `503` | Profile service is unavailable. | `*/*`: ProfileResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `PUT /api/profile`

**Create or update my profile**

- **Tag:** Profile
- **Operation ID:** `update`
- **Purpose / behavior:** Creates or replaces the authenticated JOB_SEEKER's profile using the request body. Requires a bearer token.
- **Authentication:** bearerAuth.

- **Request body required:** Yes.
- **Body notes:** Profile display name and optional contact details.
- **Content-Type:** `application/json`; schema: `ProfileRequest`.
```json
{
  "displayName": "Jane Applicant",
  "phone": "+265999000111",
  "biography": "Backend developer with five years of experience."
}
```

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the saved profile. | `*/*`: ProfileResponse |
| `400` | Request body is malformed or fails validation. | `application/json`: ApiErrorResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted to update a profile. | `application/json`: ApiErrorResponse |
| `503` | Profile service is unavailable. | `*/*`: ProfileResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/profile/documents`

**List my documents**

- **Tag:** Profile
- **Operation ID:** `documents`
- **Purpose / behavior:** Returns private documents belonging to the authenticated JOB_SEEKER. Requires a bearer token.
- **Authentication:** bearerAuth.

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the caller's document metadata. | `*/*`: array of DocumentResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted to access documents. | `application/json`: ApiErrorResponse |
| `503` | Document storage is unavailable. | `*/*`: array of DocumentResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `POST /api/profile/documents`

**Upload a profile document**

- **Tag:** Profile
- **Operation ID:** `upload`
- **Purpose / behavior:** Uploads a private PDF document for the authenticated JOB_SEEKER using multipart form data. Files must be valid PDFs no larger than 5 MiB. Requires a bearer token.
- **Authentication:** bearerAuth.

- **Request body required:** Yes.
- **Body notes:** Multipart file part named file; PDF, maximum 5 MiB.
- **Content-Type:** `multipart/form-data`; schema: `object`.
  - Example `file`: file

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `201` | Document uploaded; returns its metadata. | `*/*`: DocumentResponse |
| `400` | File is missing, invalid, or request is malformed. | `application/json`: ApiErrorResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted to upload documents. | `application/json`: ApiErrorResponse |
| `413` | File exceeds the configured upload limit. | `*/*`: DocumentResponse |
| `503` | Document storage is unavailable. | `*/*`: DocumentResponse |
| `404` | The requested resource was not found. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `DELETE /api/profile/documents/{documentId}`

**Delete a profile document**

- **Tag:** Profile
- **Operation ID:** `delete_1`
- **Purpose / behavior:** Deletes documentId if it belongs to the authenticated JOB_SEEKER. Requires a bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `documentId` | path | Yes | string (uuid) | UUID of the document. |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `204` | Document deleted. | No body documented |
| `400` | A document referenced by a submitted application cannot be deleted. | `application/json`: ApiErrorResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted to delete this document. | `application/json`: ApiErrorResponse |
| `404` | Document was not found. | `application/json`: ApiErrorResponse |
| `503` | Document storage is unavailable. | No body documented |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/profile/documents/{documentId}/download`

**Get a document download**

- **Tag:** Profile
- **Operation ID:** `download`
- **Purpose / behavior:** Returns download details for documentId if it belongs to the authenticated JOB_SEEKER. Requires a bearer token.
- **Authentication:** bearerAuth.

**Parameters**

| Name | In | Required | Type | Description |
|---|---|---:|---|---|
| `documentId` | path | Yes | string (uuid) | UUID of the document. |

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns document download details. | `*/*`: DownloadResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The caller is not permitted to download this document. | `application/json`: ApiErrorResponse |
| `404` | Document was not found. | `application/json`: ApiErrorResponse |
| `503` | Document storage is unavailable. | `*/*`: DownloadResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

### `GET /api/users/me`

**Get the current user**

- **Tag:** Users
- **Operation ID:** `currentUser`
- **Purpose / behavior:** Returns the account associated with the authenticated bearer token.
- **Authentication:** bearerAuth.

- **Request body:** None.

**Responses**

| HTTP | Meaning | Response schema |
|---:|---|---|
| `200` | Returns the authenticated user's account details. | `*/*`: UserResponse |
| `401` | A valid bearer token is required. | `application/json`: ApiErrorResponse |
| `403` | The account is not permitted to access this resource. | `application/json`: ApiErrorResponse |
| `404` | The authenticated account was not found. | `application/json`: ApiErrorResponse |
| `400` | Invalid request; see the shared error schema. | `application/json`: ApiErrorResponse |
| `409` | The request conflicts with existing state. | `application/json`: ApiErrorResponse |
| `429` | The request rate limit was exceeded. | `application/json`: ApiErrorResponse |
| `500` | An unexpected error occurred. | `application/json`: ApiErrorResponse |

## 5. Data models and schema reference

The following field tables are generated from `components.schemas`. A field marked “No / not marked” is not listed as required by the OpenAPI schema; this does not necessarily mean the backend accepts null or empty values. Follow explicit constraints and validate with backend behavior.

### `ApiFieldError`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `field` | string | No / not marked | Example: `email` |
| `message` | string | No / not marked | Example: `must be a valid email address` |

### `ApiErrorResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `timestamp` | unspecified (date-time) | No / not marked | format=date-time |
| `status` | unspecified (int32) | No / not marked | format=int32 |
| `code` | unspecified | No / not marked |  |
| `message` | unspecified | No / not marked |  |
| `path` | unspecified | No / not marked |  |
| `correlationId` | unspecified | No / not marked |  |
| `fieldErrors` | unspecified | No / not marked |  |

### `ProfileRequest`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `displayName` | string (length 0–200) | Yes | Public display name; Example: `Jane Applicant`; maxLength=200; minLength=0 |
| `fullName` | string (length 0–200) | No / not marked | Full legal name; defaults to displayName when omitted; Example: `Jane Mary Applicant`; maxLength=200; minLength=0 |
| `dateOfBirth` | string (date) | No / not marked | Date of birth; Example: `1995-06-15`; format=date |
| `phone` | string (length 0–50) | No / not marked | Optional contact phone number; Example: `+265999000111`; maxLength=50; minLength=0 |
| `location` | string (length 0–255) | No / not marked | Current town, city, or address; Example: `Blantyre`; maxLength=255; minLength=0 |
| `biography` | string (length 0–10000) | No / not marked | Optional professional biography; Example: `Backend developer with five years of experience.`; maxLength=10000; minLength=0 |

### `ProfileResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `displayName` | string | No / not marked |  |
| `fullName` | string | No / not marked |  |
| `dateOfBirth` | string (date) | No / not marked | format=date |
| `phone` | string | No / not marked |  |
| `location` | string | No / not marked |  |
| `biography` | string | No / not marked |  |
| `createdAt` | string (date-time) | No / not marked | format=date-time |
| `updatedAt` | string (date-time) | No / not marked | format=date-time |

### `JobRequest`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `companyId` | string (uuid) | Yes | Company represented by the authenticated employer; Example: `11111111-1111-1111-1111-111111111111`; format=uuid |
| `title` | string (length 0–255) | Yes | Job title; Example: `Senior Java Developer`; maxLength=255; minLength=0 |
| `description` | string (length 0–10000) | Yes | Full job description; Example: `Build and maintain recruitment platform services.`; maxLength=10000; minLength=0 |
| `requiredQualifications` | string (length 0–5000) | Yes | Required qualifications; Example: `Java 21, Spring Boot, PostgreSQL`; maxLength=5000; minLength=0 |
| `dueDate` | string (date) | Yes | Date after which applications are no longer accepted; Example: `2099-12-31`; format=date |
| `location` | string (length 0–255) | Yes | Job location; Example: `Blantyre`; maxLength=255; minLength=0 |

### `JobResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `id` | string (uuid) | No / not marked | format=uuid |
| `employerId` | string (uuid) | No / not marked | format=uuid |
| `companyId` | string (uuid) | No / not marked | format=uuid |
| `title` | string | No / not marked |  |
| `description` | string | No / not marked |  |
| `requiredQualifications` | string | No / not marked |  |
| `dueDate` | string (date) | No / not marked | format=date |
| `location` | string | No / not marked |  |
| `status` | string (enum: ACTIVE, EXPIRED, CLOSED) | No / not marked | Allowed: `ACTIVE`, `EXPIRED`, `CLOSED` |
| `createdAt` | string (date-time) | No / not marked | format=date-time |
| `updatedAt` | string (date-time) | No / not marked | format=date-time |

### `CompanyRequest`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `name` | string (length 0–255) | Yes | Example: `Acme Technologies`; maxLength=255; minLength=0 |
| `description` | string (length 0–10000) | No / not marked | Example: `Software and recruitment technology company.`; maxLength=10000; minLength=0 |
| `contactEmail` | string (email; length 0–254) | No / not marked | Example: `contact@acme.example`; maxLength=254; minLength=0; format=email |
| `contactPhone` | string (length 0–50) | No / not marked | Example: `+265999000111`; maxLength=50; minLength=0 |
| `location` | string (length 0–255) | No / not marked | Example: `Blantyre`; maxLength=255; minLength=0 |

### `CompanyResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `id` | string (uuid) | No / not marked | format=uuid |
| `employerId` | string (uuid) | No / not marked | format=uuid |
| `name` | string | No / not marked |  |
| `description` | string | No / not marked |  |
| `contactEmail` | string | No / not marked |  |
| `contactPhone` | string | No / not marked |  |
| `location` | string | No / not marked |  |
| `createdAt` | string (date-time) | No / not marked | format=date-time |
| `updatedAt` | string (date-time) | No / not marked | format=date-time |
| `vatNumber` | string | No / not marked |  |
| `registrationNumber` | string | No / not marked |  |

### `DocumentResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `id` | string (uuid) | No / not marked | format=uuid |
| `originalFilename` | string | No / not marked |  |
| `contentType` | string | No / not marked |  |
| `byteSize` | integer (int64) | No / not marked | format=int64 |
| `createdAt` | string (date-time) | No / not marked | format=date-time |

### `EmployerUpgradeRequestBody`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `companyName` | string (length 0–255) | Yes | Example: `Acme Technologies`; maxLength=255; minLength=0 |
| `businessDescription` | string (length 0–10000) | Yes | maxLength=10000; minLength=0 |
| `contactEmail` | string (email; length 0–254) | Yes | maxLength=254; minLength=0; format=email |
| `contactPhone` | string (length 0–50) | Yes | maxLength=50; minLength=0 |
| `location` | string (length 0–255) | Yes | Example: `Blantyre`; maxLength=255; minLength=0 |
| `vatNumber` | string (length 0–80) | Yes | maxLength=80; minLength=0 |
| `registrationNumber` | string (length 0–80) | Yes | maxLength=80; minLength=0 |

### `EmployerVerificationMultipartRequest`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `application` | `EmployerUpgradeRequestBody` | Yes | JSON company and contact details. |
| `document` | string (binary) | Yes | Private company registration proof, PDF only, maximum 5 MiB.; format=binary |

### `EmployerUpgradeResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `id` | string (uuid) | No / not marked | format=uuid |
| `userId` | string (uuid) | No / not marked | format=uuid |
| `companyName` | string | No / not marked |  |
| `businessDescription` | string | No / not marked |  |
| `contactEmail` | string | No / not marked |  |
| `contactPhone` | string | No / not marked |  |
| `location` | string | No / not marked |  |
| `status` | string (enum: PENDING, APPROVED, REJECTED) | No / not marked | Allowed: `PENDING`, `APPROVED`, `REJECTED` |
| `reviewedBy` | string (uuid) | No / not marked | format=uuid |
| `reviewedAt` | string (date-time) | No / not marked | format=date-time |
| `rejectionReason` | string | No / not marked |  |
| `createdAt` | string (date-time) | No / not marked | format=date-time |
| `updatedAt` | string (date-time) | No / not marked | format=date-time |
| `vatNumber` | string | No / not marked |  |
| `registrationNumber` | string | No / not marked |  |
| `companyId` | string (uuid) | No / not marked | format=uuid |
| `documentOriginalFilename` | string | No / not marked |  |
| `documentContentType` | string | No / not marked |  |
| `documentSize` | integer (int64) | No / not marked | format=int64 |

### `PasswordResetRequest`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `resetToken` | string (length 0–128) | Yes | One-time reset token; Example: `reset-token-from-forgot-password`; maxLength=128; minLength=0 |
| `newPassword` | string (length 12–72) | Yes | Example: `NewStrongPassword123!`; maxLength=72; minLength=12 |
| `newPasswordByteLengthValid` | boolean | No / not marked |  |

### `RegisterRequest`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `email` | string (email; length 0–254) | Yes | Account email address; Example: `applicant@example.com`; maxLength=254; minLength=0; format=email |
| `password` | string (length 12–72) | Yes | Account password, 12–72 characters; Example: `StrongPassword123!`; maxLength=72; minLength=12 |
| `role` | string (enum: JOB_SEEKER) | No / not marked | Only JOB_SEEKER is permitted during public registration; Example: `JOB_SEEKER`; Allowed: `JOB_SEEKER` |
| `roleAllowed` | boolean | No / not marked |  |
| `passwordByteLengthValid` | boolean | No / not marked |  |

### `RegisterResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `id` | string (uuid) | No / not marked | format=uuid |
| `email` | string | No / not marked |  |
| `role` | string (enum: JOB_SEEKER, EMPLOYER, ADMIN) | No / not marked | Allowed: `JOB_SEEKER`, `EMPLOYER`, `ADMIN` |
| `status` | string (enum: ACTIVE, SUSPENDED, REMOVED) | No / not marked | Allowed: `ACTIVE`, `SUSPENDED`, `REMOVED` |

### `LoginRequest`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `email` | string (email; length 0–254) | Yes | Example: `applicant@example.com`; maxLength=254; minLength=0; format=email |
| `password` | string (length 0–72) | Yes | Example: `StrongPassword123!`; maxLength=72; minLength=0 |
| `passwordByteLengthValid` | boolean | No / not marked |  |

### `LoginResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `accessToken` | string | No / not marked |  |
| `tokenType` | string | No / not marked |  |
| `expiresIn` | integer (int64) | No / not marked | format=int64 |

### `ForgotPasswordRequest`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `email` | string (email; length 0–254) | Yes | Example: `applicant@example.com`; maxLength=254; minLength=0; format=email |

### `PasswordResetResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `message` | string | No / not marked |  |
| `resetToken` | string | No / not marked |  |

### `ChangePasswordRequest`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `currentPassword` | string (length 0–72) | Yes | Example: `StrongPassword123!`; maxLength=72; minLength=0 |
| `newPassword` | string (length 12–72) | Yes | Example: `EvenStrongerPassword123!`; maxLength=72; minLength=12 |
| `newPasswordDifferent` | boolean | No / not marked |  |
| `newPasswordByteLengthValid` | boolean | No / not marked |  |

### `ApplicationSubmissionRequest`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `jobId` | string (uuid) | Yes | UUID of the job posting.; format=uuid |
| `cv` | string (binary) | Yes | PDF CV for this application (maximum 5 MiB).; format=binary |
| `coverLetter` | string (length 0–10000) | Yes | Plain text cover letter (maximum 10,000 characters).; maxLength=10000; minLength=0 |

### `ApplicationResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `id` | string (uuid) | No / not marked | format=uuid |
| `jobId` | string (uuid) | No / not marked | format=uuid |
| `applicantId` | string (uuid) | No / not marked | format=uuid |
| `applicantDisplayName` | string | No / not marked |  |
| `applicantProfile` | `ProfileResponse` | No / not marked |  |
| `cv` | `DocumentResponse` | No / not marked |  |
| `status` | string (enum: PENDING, SHORTLISTED, REJECTED) | No / not marked | Allowed: `PENDING`, `SHORTLISTED`, `REJECTED` |
| `submittedAt` | string (date-time) | No / not marked | format=date-time |
| `updatedAt` | string (date-time) | No / not marked | format=date-time |
| `shortlistedAt` | string (date-time) | No / not marked | format=date-time |
| `rejectedAt` | string (date-time) | No / not marked | format=date-time |
| `job` | `JobSummaryResponse` | No / not marked |  |
| `coverLetter` | string | No / not marked |  |

### `JobSummaryResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `id` | string (uuid) | No / not marked | format=uuid |
| `title` | string | No / not marked |  |
| `location` | string | No / not marked |  |
| `dueDate` | string (date) | No / not marked | format=date |
| `status` | string | No / not marked |  |

### `ApiError`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `timestamp` | string (date-time) | No / not marked | Example: `2026-11-23T14:35:20Z`; format=date-time |
| `status` | integer (int32) | No / not marked | Example: `404`; format=int32 |
| `code` | string | No / not marked | Example: `RESOURCE_NOT_FOUND` |
| `message` | string | No / not marked | Example: `The requested resource was not found.` |
| `path` | string | No / not marked | Example: `/api/jobs/123` |
| `correlationId` | string | No / not marked | Example: `7f8c2a91-6a62-4c68-9bd5-279b68ac4e37` |
| `fieldErrors` | array of `ApiFieldError` | No / not marked |  |

### `CreateAccountRequest`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `email` | string (email; length 0–254) | Yes | Example: `account@example.com`; maxLength=254; minLength=0; format=email |
| `password` | string (length 12–72) | Yes | Example: `StrongPassword123!`; maxLength=72; minLength=12 |
| `role` | string (enum: JOB_SEEKER, EMPLOYER) | Yes | Allowed: `JOB_SEEKER`, `EMPLOYER` |
| `roleAllowed` | boolean | No / not marked |  |
| `passwordByteLengthValid` | boolean | No / not marked |  |

### `UserResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `id` | string (uuid) | No / not marked | format=uuid |
| `email` | string | No / not marked |  |
| `role` | string (enum: JOB_SEEKER, EMPLOYER, ADMIN) | No / not marked | Allowed: `JOB_SEEKER`, `EMPLOYER`, `ADMIN` |
| `accountStatus` | string (enum: ACTIVE, SUSPENDED, REMOVED) | No / not marked | Allowed: `ACTIVE`, `SUSPENDED`, `REMOVED` |
| `createdAt` | string (date-time) | No / not marked | format=date-time |
| `updatedAt` | string (date-time) | No / not marked | format=date-time |

### `ApplicationStatusRequest`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `status` | string (enum: PENDING, SHORTLISTED, REJECTED) | Yes | Allowed: `PENDING`, `SHORTLISTED`, `REJECTED` |

### `ApplicationUpdateRequest`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `coverLetter` | string (length 0–10000) | Yes | maxLength=10000; minLength=0 |

### `AssignAdminRoleRequest`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `role` | string (enum: JOB_SEEKER, EMPLOYER, ADMIN) | Yes | Allowed: `JOB_SEEKER`, `EMPLOYER`, `ADMIN` |
| `adminRole` | boolean | No / not marked |  |

### `EmployerUpgradeDecision`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `reason` | string (length 0–2000) | Yes | maxLength=2000; minLength=0 |

### `DownloadResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `url` | string (uri) | No / not marked | format=uri |
| `expiresAt` | string (date-time) | No / not marked | format=date-time |

### `PageResponseJobResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `content` | array of `JobResponse` | No / not marked |  |
| `page` | integer (int32) | No / not marked | format=int32 |
| `size` | integer (int32) | No / not marked | format=int32 |
| `totalElements` | integer (int64) | No / not marked | format=int64 |
| `totalPages` | integer (int32) | No / not marked | format=int32 |

### `PageResponseShortlistCandidateResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `content` | array of `ShortlistCandidateResponse` | No / not marked |  |
| `page` | integer (int32) | No / not marked | format=int32 |
| `size` | integer (int32) | No / not marked | format=int32 |
| `totalElements` | integer (int64) | No / not marked | format=int64 |
| `totalPages` | integer (int32) | No / not marked | format=int32 |

### `ShortlistCandidateResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `id` | string (uuid) | No / not marked | format=uuid |
| `applicationId` | string (uuid) | No / not marked | format=uuid |
| `jobId` | string (uuid) | No / not marked | format=uuid |
| `jobTitle` | string | No / not marked |  |
| `jobSeekerId` | string (uuid) | No / not marked | format=uuid |
| `applicantProfile` | `ProfileResponse` | No / not marked |  |
| `cv` | `DocumentResponse` | No / not marked |  |
| `shortlistedAt` | string (date-time) | No / not marked | format=date-time |
| `retainedAt` | string (date-time) | No / not marked | format=date-time |

### `CurrentUserResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `id` | string (uuid) | No / not marked | format=uuid |
| `email` | string | No / not marked |  |
| `role` | string (enum: JOB_SEEKER, EMPLOYER, ADMIN) | No / not marked | Allowed: `JOB_SEEKER`, `EMPLOYER`, `ADMIN` |
| `status` | string (enum: ACTIVE, SUSPENDED, REMOVED) | No / not marked | Allowed: `ACTIVE`, `SUSPENDED`, `REMOVED` |

### `DocumentLink`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `url` | string (uri) | No / not marked | format=uri |

### `HealthResponse`

| Field | Type | Required | Description / constraints |
|---|---|---:|---|
| `status` | unspecified | No / not marked | Example: `UP` |

## 6. Frontend workflows implied by the API

### Job seeker journey
1. Register using `POST /api/auth/register` (public registration creates `JOB_SEEKER` only).
2. Log in using `POST /api/auth/login`; retain the returned token according to the app's security model.
3. Load current identity using `GET /api/auth/me` or `/api/users/me` after confirming which response is canonical.
4. Read or create/update profile using `GET` / `PUT /api/profile`.
5. Upload optional private profile documents using `POST /api/profile/documents`; list with `GET` and download metadata/link with `/api/profile/documents/{documentId}/download`.
6. Browse jobs using `GET /api/jobs` with optional `q`, `location`, `page`, and `size`.
7. Apply using `POST /api/applications` multipart form. Each application has its own PDF CV; profile documents do not replace this submitted CV. The description says a plain-text cover letter is required, but the published multipart schema must be checked carefully for its exact property.
8. Track applications with `GET /api/applications` and `GET /api/applications/{applicationId}`; update pending application via PATCH; withdraw pending application via DELETE.
9. If seeking employer access, submit a verification request with `POST /api/employer-requests`, then list/read own requests.
10. Change password, request reset, and complete reset through the auth endpoints.

### Employer journey
1. Employer access is obtained through the employer verification/approval workflow; the OpenAPI describes approval as upgrading the applicant to employer.
2. Load current user; list/create/update owned companies.
3. Create jobs under an owned `companyId`; list own jobs with optional status/page/size; get, update, close, or delete a job.
4. Review applications with `GET /api/employer/applications`, optionally filtering by `jobId` and status.
5. Open an application, inspect applicant profile, and request a short-lived CV download link.
6. Update application status using `PATCH /api/employer/applications/{applicationId}/status`.
7. Review retained shortlisted candidates through `/api/employer/shortlisted-candidates`.

### Administrator journey
1. Load users and user details through `/api/admin/users` endpoints.
2. Suspend, remove, or assign ADMIN role through the documented PATCH routes.
3. Review pending employer upgrade requests, inspect request details and registration document link, then approve or reject with a reason for rejection.

## 7. File handling requirements

| Use case | Endpoint | Format / limit |
|---|---|---|
| Job seeker profile document | `POST /api/profile/documents` | PDF, max 5 MiB, multipart field `file` |
| Employer registration evidence | `POST /api/employer-requests` | PDF, max 5 MiB; multipart parts `application` and `document` are implied by schema name/description; verify exact part names in schema |
| Job application CV | `POST /api/applications` | PDF, max 5 MiB; multipart schema; each application CV is preserved separately |
| Application cover letter | `POST /api/applications` | Plain text, max 10,000 characters per description; exact multipart field needs confirmation |
| Employer CV access | `GET /api/employer/applications/{applicationId}/cv` | Returns short-lived private download link |
| Admin registration document | `GET /api/admin/employer-requests/{requestId}/document` | Returns short-lived signed URL |

For all file downloads, distinguish API metadata/link retrieval from the actual file download. Do not expose private storage URLs in public UI or logs. Treat signed URLs as temporary secrets.

## 8. Error handling contract

The documented `ApiErrorResponse` shape includes `timestamp`, `status`, `code`, `message`, `path`, `correlationId`, and `fieldErrors`; `ApiFieldError` includes `field` and `message`. Some schema properties are loosely typed in the OpenAPI file, so parse defensively.

| Status | Frontend behavior |
|---:|---|
| 400 | Show validation/request error; map `fieldErrors` to form fields where available. |
| 401 | Treat as unauthenticated/invalid session; clear invalid auth state and route to login where appropriate. |
| 403 | Show permission/role error; do not retry blindly. |
| 404 | Show missing/unavailable resource state. |
| 409 | Show state conflict (duplicate application, invalid transition, already-decided request, etc.). |
| 413 | Explain file exceeds upload limit; show allowed maximum. |
| 429 | Show rate-limit message and avoid aggressive retries. |
| 500 | Show generic server error; retain safe user input where possible. |
| 503 | Show temporary service/storage unavailability and allow a deliberate retry. |
| 202 | Request accepted (password reset flow); show neutral confirmation, not proof an account exists. |
| 204 | Success with no response body. |

Do not display raw stack traces or expose internal error details to end users. Preserve `correlationId` in diagnostic logs when present.

## 9. Important source gaps and ambiguities — do not guess

1. **Server uses HTTP:** The OpenAPI server URL is `http://api.online-job.mikhy.me`. Confirm HTTPS/TLS availability before sending credentials or JWTs in production.
2. **Duplicate current-user endpoints:** `/api/auth/me` and `/api/users/me` overlap but return different schema names. Confirm whether one is legacy or intended for a different consumer.
3. **Duplicate employer-request collection path:** `/api/employer-requests` and `/api/employer-requests/` expose the same GET/POST operations. Prefer the canonical path only after confirming redirect/trailing-slash behavior.
4. **Login token shape:** The exact fields in `LoginResponse` must be read from the schema; do not assume `token`, `accessToken`, or `jwt`.
5. **Application multipart mismatch:** The endpoint description mentions `jobId`, a PDF CV, and a plain-text cover letter; verify that the `ApplicationSubmissionRequest` schema actually declares all three fields and exact names.
6. **Application update mismatch:** PATCH supports multipart with `cv` and JSON `ApplicationUpdateRequest`, plus a `coverLetter` query parameter. Confirm intended usage and precedence before implementing CV replacement/cover-letter edits.
7. **Status transitions:** The API says transitions are constrained but does not fully define the transition matrix. Do not hard-code unsupported transitions beyond documented status enums; handle `409`.
8. **Application status enum discrepancy:** Employer filter lists `PENDING`, `SHORTLISTED`, `REJECTED`; descriptions also discuss withdrawal and shortlist history. Inspect schema enum and backend behavior before deriving all UI states.
9. **Profile fields:** `ProfileRequest` includes `displayName`, `fullName`, `dateOfBirth`, `phone`, `location`, `biography`; the API does not document skills, education, work history, portfolio, or avatar fields in this request.
10. **Job seeker profile completeness:** Applying can return `PROFILE_INCOMPLETE`, but the exact required profile fields are not fully stated in the endpoint description. Surface backend validation rather than inventing a checklist.
11. **Shortlist semantics:** Retained shortlist records are described as immutable and retained after withdrawal/removal/job expiry. Do not assume the shortlist endpoint is an editable shortlist management API.
12. **Company/job relationships:** Job requests include `companyId`; the employer must own the selected company. The API does not document an employer dashboard aggregate endpoint.
13. **Response media types:** Many successful responses are declared as `*/*`. Configure the client to parse JSON where present but tolerate empty bodies and non-JSON errors.
14. **503 response schemas:** Some 503 responses list the normal success schema. Treat the HTTP status as failure/unavailability, not as a successful payload.
15. **Pagination metadata:** Inspect the page response schemas for exact property names; do not assume Spring's standard `content/totalElements/totalPages` shape unless the schema confirms it.
16. **Rate limits:** `429` is documented but the rate-limit headers/retry policy are not specified.
17. **Token expiry/refresh:** No expiry duration, refresh route, or revocation details beyond logout token-version invalidation are specified.

## 10. Frontend feature-to-endpoint mapping checklist

| Frontend feature | Backend support | Endpoint(s) |
|---|---|---|
| Registration / login / logout | Supported | `/api/auth/register, /api/auth/login, /api/auth/logout` |
| Forgot/reset/change password | Supported | `/api/auth/forgot-password, /api/auth/reset-password, /api/auth/change-password` |
| Current-user session bootstrap | Supported; duplicate endpoints need reconciliation | `/api/auth/me, /api/users/me` |
| Job seeker profile | Supported; only documented fields | `/api/profile` |
| Profile document library | Supported | `/api/profile/documents, /api/profile/documents/{documentId}` |
| Job search / browse | Supported | `/api/jobs` |
| Job details | Supported | `/api/jobs/{jobId}` |
| Submit application | Supported; multipart fields need verification | `/api/applications` |
| My applications / withdraw / edit | Supported; update contract needs clarification | `/api/applications, /api/applications/{applicationId}` |
| Employer verification request | Supported | `/api/employer-requests` |
| Company management | Supported | `/api/companies` |
| Employer job management | Supported | `/api/employer/jobs, /api/jobs, /api/jobs/{jobId}, /api/jobs/{jobId}/close` |
| Employer application inbox | Supported | `/api/employer/applications` |
| Applicant profile / CV access | Supported | `/api/employer/applications/{applicationId}/profile, /cv` |
| Application decisions | Supported; transition matrix incomplete | `/api/employer/applications/{applicationId}/status` |
| Retained shortlist history | Supported as read-only retained records | `/api/employer/shortlisted-candidates` |
| Admin user management | Supported | `/api/admin/users` |
| Admin employer verification review | Supported | `/api/admin/employer-requests` |
| Public job listing without authentication | Not documented; GET /api/jobs requires bearer token | `/api/jobs` |
| Saved jobs / bookmarks | No endpoint documented | `None` |
| In-app messaging / chat | No endpoint documented | `None` |
| Notifications | No endpoint documented | `None` |
| Payments / subscriptions | No endpoint documented | `None` |
| Resume builder / skills / education CRUD | No dedicated endpoints documented | `None` |
| Employer analytics/dashboard aggregate | No dedicated endpoint documented | `None` |

## 11. Suggested implementation sequence

1. Inspect repository and write a screen/component inventory.
2. Build typed API models from the OpenAPI schemas (or generate a client if the project supports OpenAPI generation).
3. Implement centralized HTTP client, base URL configuration, bearer-token injection, and error normalization.
4. Implement authentication/session bootstrap and role-aware route guards.
5. Implement job seeker profile and document upload/download flows.
6. Implement job browsing and application submission/tracking.
7. Implement employer verification request status screens.
8. Implement employer company/job management and application review flows.
9. Implement admin user and employer-verification workflows.
10. Reconcile the ambiguities in Section 9 with backend owners and add integration tests.
11. Run type checks, lint, tests, and a manual end-to-end test for each role.

## 12. Definition of done for the refactor

- All frontend API calls use the centralized API client and configured base URL.
- No undocumented endpoint is called.
- All secured calls send a valid Bearer token.
- Role-protected screens and actions align with the documented roles.
- All request payloads match the schema and content type.
- Upload limits, MIME expectations, and multipart field names are enforced client-side and server-side errors are handled.
- Empty-body success responses do not cause JSON parsing errors.
- Error states cover validation, unauthenticated, forbidden, missing, conflict, oversized upload, rate limiting, and service unavailable.
- The UI does not promise unsupported features (e.g. chat, bookmarks, payments) as if they were API-backed.
- Existing design is preserved unless implementation requires a targeted adjustment.
- The agent reports unsupported frontend features and unresolved API questions instead of fabricating integrations.

## Appendix A. Source provenance

This contract was generated from the uploaded OpenAPI document `api-specification.json` (OpenAPI 3.1.0, API version 1.0.0). Endpoint and schema statements are source-derived. The agent instructions, integration sequence, UI behavior recommendations, and gap analysis are implementation guidance, not additional backend capabilities.
