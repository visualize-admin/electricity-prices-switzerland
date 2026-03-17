# Admin Authentication System

## Purpose

Password-protected admin area using JWT session cookies. Enables runtime configuration of server-side flags without redeploying.

## Current Admin Features

- **Session Config** (`/admin/session-config`): Runtime user only configuration flags (e.g., SPARQL endpoint selection)
- **Metrics Dashboard** (`/admin/metrics`): GraphQL operation and resolver metrics monitoring

## Architecture

Three layers:

**Pages** (`/pages/admin/*.tsx`):

- Next.js React pages with server-side authentication checks
- Render UI with client-side form submission
- Redirect to login if not authenticated

**API Routes** (`/pages/api/admin/*.ts`):

- Server-only endpoints for form processing
- Handle authentication and session updates
- Return JSON responses

**Middleware** (`/src/middleware.ts`):

- Protects `/admin/*` routes (except login)
- Validates JWT session on every request
- Redirects to login with `return_to` parameter

## Route Structure

### Pages (Browser UI)

| Route                   | Authentication | Description                   |
| ----------------------- | -------------- | ----------------------------- |
| `/admin/login`          | Public         | Login page with password form |
| `/admin/session-config` | JWT session    | Session config dashboard      |
| `/admin/metrics`        | JWT session    | Metrics dashboard             |

### API Routes (Form Processing)

| Route                       | Method | Authentication | Description                                |
| --------------------------- | ------ | -------------- | ------------------------------------------ |
| `/api/admin/login`          | POST   | None           | Validates password, creates session cookie |
| `/api/admin/logout`         | POST   | None           | Validates password, creates session cookie |
| `/api/admin/session-config` | POST   | JWT session    | Updates flags or logs out                  |

See the API route implementations for request/response details.

## Authentication Flow

### Login Flow

1. User navigates to a protected admin page (e.g., `/admin/session-config`)
2. Middleware checks for valid JWT session cookie
3. If no valid session, redirects to `/admin/login?return_to=<original-url>`
4. User enters admin password and submits form
5. Client POSTs to `/api/admin/login`
6. API validates password and creates signed JWT session cookie
7. Client redirects to original URL or `/admin/session-config`
8. Subsequent requests include session cookie automatically

### Session Management

- Session Duration: configurable via `ADMIN_SESSION_DURATION` (default: 24 hours)
- Cookie Name: `admin_session`
- Token Signing: JWT signed with `ADMIN_JWT_SECRET` (HMAC-SHA256)
- Cookie Security: HTTP-only, secure (in production), SameSite=Lax
- Logout: available via session config dashboard

Implementation details: See `src/admin-auth/session.ts`

## Session Config Flags

Runtime options stored in the JWT payload. Per-user, persist until session expires.

### Schema

See `src/admin-auth/flags.ts` for the complete schema definition.

### Currently Available Flags

- sparqlEndpoint: select SPARQL endpoint at runtime
  - Type: String (URL)
  - Options: Production, Integration, or custom endpoints
  - Used by GraphQL resolvers to query RDF data

### Flag Persistence

- Flags are stored in JWT session payload (not in database)
- Changes are immediately reflected in current session
- Flags reset to defaults when session expires
- Session-scoped only (no persistent storage)

### Flag Management UI

`/admin/session-config` is the form-based UI. Changes POST to `/api/admin/session-config`, which issues a new JWT with the updated flags.

## Integration Points

### GraphQL Context

Flags are extracted from the session cookie and injected into the GraphQL resolver context.

Implementation: See `src/graphql/server-context.ts`

### Server-Side Rendering

Use `getSessionConfigFlagsInfo` to read flags in `getServerSideProps`.

Implementation: See `src/admin-auth/info.ts`

## Environment Configuration

### Variables

```bash
# Required
ADMIN_PASSWORD=<secure-password>      # Admin password for login
ADMIN_JWT_SECRET=<signing-secret>     # JWT token signing key (24+ bytes recommended)
# Optional
ADMIN_SESSION_DURATION=86400          # Session duration in seconds (default: 24 hours)
```

### Generating Secrets

```bash
# Generate JWT secret (24 bytes)
openssl rand -base64 24

# Generate secure password
openssl rand -base64 32
```

### Development Configuration

See `.env.development`.

## Security Model

### Authentication Security

- Password Storage: environment variables only, never in database
- Password Transmission: HTTPS in production, POST body only
- CSRF Protection: token validation on all form submissions
- Session Binding: CSRF tokens bound to session ID

Implementation: See `src/admin-auth/password.ts` and `src/admin-auth/csrf.ts`

### Session Security

- JWT Signing: HMAC-SHA256 with secret key
- Token Storage: HTTP-only cookies (not accessible to JavaScript)
- Cookie Flags: `HttpOnly` (XSS), `Secure` in production (HTTPS), `SameSite=Lax` (CSRF)
- Token Validation: signature verified on every request
- Expiration: automatic after configured duration

Implementation: See `src/admin-auth/session.ts`

### Authorization Model

- Binary access: authenticated or not, no roles
- Session-scoped: each user has their own flags
- No privilege escalation: all authenticated users have the same access level

## Error Handling

### Authentication Errors

- Invalid password → 401 Unauthorized
- Missing credentials → 400 Bad Request
- CSRF validation failure → 400 Bad Request

### Session Errors

- Invalid, expired, or missing JWT → Redirect to `/admin/login` with `return_to` parameter

Error responses follow standard HTTP status codes. See API route implementations for specific error messages and handling patterns.

