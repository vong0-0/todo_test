# API Documentation - TODO App

This document provides details for the frontend team to integrate with the backend API.

## Base Configuration

- **Base URL**: `https://your-project-name.up.railway.app/api/v1`
- **CORS**: Enabled for `FRONTEND_URL`.
- **Credentials**: Required (`credentials: 'include'` for fetch or `withCredentials: true` for axios).

---

## Authentication API

### 1. Register

- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

### 2. Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response**: Returns `accessToken` in body and sets `refreshToken` in an **HttpOnly** cookie.

### 3. Refresh Token

- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Requirement**: Must send the `refreshToken` cookie.
- **Response**: Returns a new `accessToken`.

### 4. Logout

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Requirement**: Must send the `refreshToken` cookie.

---

## TODO API (Protected)

_All routes require `Authorization: Bearer <accessToken>` header._

### 1. Get All Todos

- **URL**: `/todos`
- **Method**: `GET`
- **Response**: Array of todo objects.

### 2. Create Todo

- **URL**: `/todos`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "title": "Task Title",
    "description": "Task Description (optional)",
    "priority": "LOW" | "MEDIUM" | "HIGH"
  }
  ```

### 3. Get Todo by ID

- **URL**: `/todos/:id`
- **Method**: `GET`

### 4. Update Todo

- **URL**: `/todos/:id`
- **Method**: `PATCH`
- **Body**: (Any field you want to update)
  ```json
  {
    "title": "Updated Title",
    "isCompleted": true
  }
  ```

### 5. Delete Todo

- **URL**: `/todos/:id`
- **Method**: `DELETE`

---

## Standard Response Format

### Success

```json
{
  "success": true,
  "message": "Action summary",
  "data": { ... }
}
```

### Error

```json
{
  "success": false,
  "message": "Human readable error",
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "details": "Technical details"
  }
}
```

## Error Codes

| Code                  | Description                     |
| --------------------- | ------------------------------- |
| `UNAUTHORIZED`        | Invalid or missing access token |
| `INVALID_CREDENTIALS` | Wrong email or password         |
| `DUPLICATE_FIELD`     | Email already exists            |
| `NOT_FOUND`           | Resource not found              |
| `TOKEN_EXPIRED`       | Access token expired            |
| `INVALID_TOKEN`       | Token is malformed or invalid   |
| `VALIDATION_ERROR`    | Request body data is invalid    |
