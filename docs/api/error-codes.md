# KomunaID API Error Codes

## Standard Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    {
      "code": "ERROR_CODE",
      "field": "fieldName",
      "message": "Specific error detail"
    }
  ]
}
```

Successful responses use:

```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

## HTTP Status Codes

| Code | Meaning                                     |
| ---- | ------------------------------------------- |
| 200  | Success                                     |
| 201  | Created                                     |
| 400  | Bad Request (validation error)              |
| 401  | Unauthorized (authentication failure)       |
| 403  | Forbidden (authorization failure)           |
| 404  | Not Found                                   |
| 409  | Conflict (resource already exists)          |
| 422  | Unprocessable Entity (business logic error) |
| 429  | Too Many Requests (rate limit)              |
| 500  | Internal Server Error                       |

---

## 1. Authentication Errors

**Base HTTP Status: 401 Unauthorized**

| Error Code              | HTTP Status | Description                                         |
| ----------------------- | ----------- | --------------------------------------------------- |
| `INVALID_CREDENTIALS`   | 401         | Email or password is incorrect                      |
| `TOKEN_EXPIRED`         | 401         | JWT access token has expired                        |
| `TOKEN_INVALID`         | 401         | JWT token is malformed or has invalid signature     |
| `ACCOUNT_SUSPENDED`     | 401         | User account has been suspended by an administrator |
| `EMAIL_NOT_VERIFIED`    | 401         | User has not verified their email address           |
| `REFRESH_TOKEN_INVALID` | 401         | Refresh token is invalid or has been revoked        |
| `REFRESH_TOKEN_EXPIRED` | 401         | Refresh token has expired                           |

### Examples

```json
// 401 - INVALID_CREDENTIALS
{
  "success": false,
  "message": "Invalid email or password"
}

// 401 - TOKEN_EXPIRED
{
  "success": false,
  "message": "Access token has expired"
}
```

## 2. Authorization Errors

**Base HTTP Status: 403 Forbidden**

| Error Code                 | HTTP Status | Description                                           |
| -------------------------- | ----------- | ----------------------------------------------------- |
| `INSUFFICIENT_PERMISSIONS` | 403         | User lacks required permissions for this action       |
| `ROLE_REQUIRED`            | 403         | Action requires a specific role the user doesn't have |
| `SCOPE_REQUIRED`           | 403         | Token lacks required scope for this resource          |

### Examples

```json
// 403 - INSUFFICIENT_PERMISSIONS
{
  "success": false,
  "message": "You do not have permission to perform this action"
}

// 403 - ROLE_REQUIRED
{
  "success": false,
  "message": "This action requires ADMIN role"
}
```

## 3. Validation Errors

**Base HTTP Status: 400 Bad Request / 422 Unprocessable Entity**

| Error Code         | HTTP Status | Description                                                   |
| ------------------ | ----------- | ------------------------------------------------------------- |
| `VALIDATION_ERROR` | 400         | Request body or query parameters failed validation            |
| `REQUIRED_FIELD`   | 400         | A required field is missing from the request                  |
| `INVALID_FORMAT`   | 400         | A field value does not match the expected format              |
| `DUPLICATE_ENTRY`  | 409         | A unique constraint was violated (email already exists, etc.) |
| `INVALID_EMAIL`    | 400         | Email address format is invalid                               |
| `WEAK_PASSWORD`    | 400         | Password does not meet minimum strength requirements          |

### Examples

```json
// 400 - VALIDATION_ERROR
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "code": "REQUIRED_FIELD",
      "field": "email",
      "message": "Email is required"
    },
    {
      "code": "INVALID_FORMAT",
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}

// 409 - DUPLICATE_ENTRY
{
  "success": false,
  "message": "A user with this email already exists"
}
```

## 4. Resource Errors

**Base HTTP Status: 404 Not Found / 409 Conflict / 422 Unprocessable Entity**

| Error Code         | HTTP Status | Description                                          |
| ------------------ | ----------- | ---------------------------------------------------- |
| `NOT_FOUND`        | 404         | Requested resource does not exist                    |
| `ALREADY_EXISTS`   | 409         | Resource already exists (alias for create conflicts) |
| `OPERATION_FAILED` | 422         | Business logic prevented the operation               |

### Examples

```json
// 404 - NOT_FOUND
{
  "success": false,
  "message": "User not found"
}

// 422 - OPERATION_FAILED
{
  "success": false,
  "message": "Cannot delete user with active subscriptions"
}
```

## 5. Rate Limit Errors

**Base HTTP Status: 429 Too Many Requests**

| Error Code          | HTTP Status | Description                               |
| ------------------- | ----------- | ----------------------------------------- |
| `TOO_MANY_REQUESTS` | 429         | Rate limit exceeded, retry after cooldown |

### Response Headers

```
Retry-After: 60
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995200
```

### Example

```json
// 429 - TOO_MANY_REQUESTS
{
  "success": false,
  "message": "Too many requests. Please try again later."
}
```

## 6. Server Errors

**Base HTTP Status: 500 Internal Server Error**

| Error Code            | HTTP Status | Description                                          |
| --------------------- | ----------- | ---------------------------------------------------- |
| `INTERNAL_ERROR`      | 500         | Unexpected server error occurred                     |
| `SERVICE_UNAVAILABLE` | 503         | A downstream service (email, storage) is unavailable |

### Examples

```json
// 500 - INTERNAL_ERROR
{
  "success": false,
  "message": "An unexpected error occurred"
}

// 503 - SERVICE_UNAVAILABLE
{
  "success": false,
  "message": "Email service is temporarily unavailable. Please try again later."
}
```

> **Note**: Internal errors log the full stack trace server-side but never expose it to the client.

---

## Quick Reference

| Code                       | HTTP Status | Category       |
| -------------------------- | ----------- | -------------- |
| `INVALID_CREDENTIALS`      | 401         | Authentication |
| `TOKEN_EXPIRED`            | 401         | Authentication |
| `TOKEN_INVALID`            | 401         | Authentication |
| `ACCOUNT_SUSPENDED`        | 401         | Authentication |
| `EMAIL_NOT_VERIFIED`       | 401         | Authentication |
| `REFRESH_TOKEN_INVALID`    | 401         | Authentication |
| `REFRESH_TOKEN_EXPIRED`    | 401         | Authentication |
| `INSUFFICIENT_PERMISSIONS` | 403         | Authorization  |
| `ROLE_REQUIRED`            | 403         | Authorization  |
| `SCOPE_REQUIRED`           | 403         | Authorization  |
| `VALIDATION_ERROR`         | 400         | Validation     |
| `REQUIRED_FIELD`           | 400         | Validation     |
| `INVALID_FORMAT`           | 400         | Validation     |
| `DUPLICATE_ENTRY`          | 409         | Validation     |
| `NOT_FOUND`                | 404         | Resource       |
| `ALREADY_EXISTS`           | 409         | Resource       |
| `OPERATION_FAILED`         | 422         | Resource       |
| `TOO_MANY_REQUESTS`        | 429         | Rate Limit     |
| `INTERNAL_ERROR`           | 500         | Server         |
| `SERVICE_UNAVAILABLE`      | 503         | Server         |
