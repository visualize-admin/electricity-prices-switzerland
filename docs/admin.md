# Specification: Admin Authentication System

## Purpose

This specification defines a unified admin authentication system that provides secure, password-protected access to administrative features. The system uses JWT-based sessions for browser access and enables runtime configuration of server-side feature flags.

## Current Admin Features

- **Session Config** (`/admin/session-config`): Runtime configuration flags (e.g., SPARQL endpoint selection)
- **Metrics Dashboard** (`/admin/metrics`): GraphQL operation and resolver metrics monitoring

## Architecture

The system uses a standard Next.js pattern:

```
┌─────────────────────────────────────────────────────────────┐
│  Browser                                                     │
│                                                             │
│  ┌─────────────┐      ┌──────────────┐                     │
│  │ /admin/login│─────▶│ POST         │                     │
│  │  (Page)     │      │ /api/admin/  │                     │
│  │             │◀─────│ login        │                     │
│  └─────────────┘      │  (API Route) │                     │
│                       └──────────────┘                     │
│                                                             │
│  ┌─────────────────┐  ┌──────────────┐                     │
│  │ /admin/session- │─▶│ POST         │                     │
│  │  config (Page)  │  │ /api/admin/  │                     │
│  │                 │◀─│ session-     │                     │
│  │                 │  │  config      │                     │
│  └─────────────────┘  │  (API Route) │                     │
│                       └──────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

**Pages** (`/pages/admin/*.tsx`):
- Next.js React pages with `getServerSideProps`
- Handle server-side authentication checks
- Render UI with client-side form submission
- Redirect to login if not authenticated

**API Routes** (`/pages/api/admin/*.ts`):
- Server-only endpoints for form processing
- Handle POST requests from pages
- Return JSON responses
- Process authentication and session updates

**Middleware** (`/src/middleware.ts`):
- Protects all `/admin/*` routes (except login and session-config)
- Checks JWT session validity
- Redirects to login with `return_to` parameter

## Route Structure

### Pages (Browser UI)

| Route | Authentication | Description |
|-------|---------------|-------------|
| `/admin/login` | Public | Login page with password form |
| `/admin/session-config` | JWT session | Session config dashboard (checks auth in getServerSideProps) |
| `/admin/metrics` | JWT session | Metrics dashboard (protected by middleware) |

### API Routes (Form Processing)

| Route | Method | Authentication | Description |
|-------|--------|---------------|-------------|
| `/api/admin/login` | POST | None | Validates password, creates session cookie |
| `/api/admin/session-config` | POST | JWT session | Updates flags or logs out |

## Authentication Flow

### Login Flow

1. User navigates to `/admin/session-config` (or any protected admin page)
2. Page's `getServerSideProps` checks for valid JWT session cookie
3. If no valid session, redirects to `/admin/login?return_to=/admin/session-config`
4. User enters admin password and submits form
5. Client-side JavaScript POSTs to `/api/admin/login`
6. API validates password and creates signed JWT session cookie
7. Client redirects to `return_to` URL or `/admin/session-config`
8. Subsequent requests include session cookie automatically

### Session Management

- **Session Duration**: Configurable via `ADMIN_SESSION_DURATION` environment variable (default: 24 hours)
- **Cookie Name**: `admin_session`
- **Cookie Security**: HTTP-only, secure (in production), SameSite=Lax
- **Token Signing**: JWT tokens signed with `ADMIN_JWT_SECRET` (HMAC-SHA256)
- **Automatic Expiry**: Sessions expire after configured duration
- **Logout**: Available via session config dashboard

### Middleware Protection

The Next.js middleware automatically protects admin routes:

```typescript
// Runs on edge before page rendering
export async function middleware(request: NextRequest) {
  // Only protect /admin/* routes
  if (!pathname.startsWith("/admin")) return next();

  // Allow login page (public)
  if (pathname === "/admin/login") return next();

  // Allow session-config (handles own auth in getServerSideProps)
  if (pathname === "/admin/session-config") return next();

  // Check for valid session
  const session = await parseSessionFromRequest(request);
  if (!session) {
    // Redirect to login with return_to parameter
    return redirect(`/admin/login?return_to=${pathname}`);
  }

  return next();
}
```

## Session Config Flags

The system manages runtime configuration flags stored in the JWT session payload.

### Schema

See [SessionConfigFlags](../src/admin-auth/flags.ts) for the complete schema definition.

### Currently Available Flags

- **sparqlEndpoint**: Select SPARQL endpoint at runtime
  - Type: String (URL)
  - Options: Production, Integration, or custom endpoints
  - Used by GraphQL resolvers to query RDF data

### Flag Persistence

- Flags are stored in JWT session payload (not in database)
- Changes are immediately reflected in current session
- Flags reset to defaults when session expires
- No persistent storage - flags are session-scoped

### Flag Management UI

The session config dashboard (`/admin/session-config`) provides a web interface for managing flags:

- Each flag has a form input based on its type (boolean, string, enum, etc.)
- Changes are submitted via POST to `/api/admin/session-config`
- New JWT token is created with updated flags
- Page reloads to reflect new session state

## Integration Points

### GraphQL Context

The admin session system integrates with GraphQL resolvers through the [GraphQL context](../src/graphql/server-context.ts):

```typescript
export const contextFromAPIRequest = async (
  req: NextApiRequest
): Promise<GraphqlRequestContext> => {
  const partialFlags = await getSessionConfigFlagsFromCookies(
    req.headers.cookie
  );
  const flags = getDefaultedFlags(partialFlags);

  // Use flags.sparqlEndpoint to create SPARQL client
  // ...
};
```

### Server-Side Rendering

Next.js pages can access flags during server-side rendering:

```typescript
import { getSessionConfigFlagsInfo } from "src/admin-auth/info";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const sessionConfig = await getSessionConfigFlagsInfo(context);

  // Use sessionConfig.flags to determine rendering behavior
  return {
    props: {
      flags: sessionConfig.flags,
    },
  };
};
```

## Environment Configuration

```bash
# Admin authentication
ADMIN_PASSWORD=<secure-password>              # Admin password for login (Required)
ADMIN_JWT_SECRET=<signing-secret>             # JWT token signing key (Required)
ADMIN_SESSION_DURATION=86400                  # Session duration in seconds (default: 24 hours)
```

### Generating Secrets

```bash
# Generate JWT secret (24 bytes)
openssl rand -base64 24

# Generate secure password
openssl rand -base64 32
```

### Development Configuration

In `.env.development`:

```bash
ADMIN_PASSWORD=elcom-admin
ADMIN_JWT_SECRET=e4BYed5xs78lN5l56LeLH3wiXx2q0c1M
ADMIN_SESSION_DURATION=86400
```

## Security Model

### Authentication Security

- **Password Storage**: Environment variables only, never in database
- **Password Transmission**: HTTPS in production, POST body only
- **Rate Limiting**: 5 failed attempts = 15 minute lockout
- **CSRF Protection**: Token validation on all form submissions
- **Session Binding**: CSRF tokens bound to session ID

### Session Security

- **JWT Signing**: HMAC-SHA256 with secret key
- **Token Storage**: HTTP-only cookies (not accessible to JavaScript)
- **Cookie Security**:
  - `HttpOnly: true` - Prevents XSS attacks
  - `Secure: true` (production) - HTTPS only
  - `SameSite: Lax` - CSRF protection
- **Token Validation**: Signature verification on every request
- **Expiration**: Configurable session duration with automatic expiry

### Authorization Model

- **Binary Access**: Authenticated or not (no roles/permissions)
- **Session-Scoped**: Each user has their own session with their own flags
- **No Privilege Escalation**: All authenticated users have same access level

## Error Handling

### Authentication Errors

- **Invalid password**: JSON error response with 401 status
- **Missing credentials**: 400 Bad Request
- **Rate limit exceeded**: 429 Too Many Requests with retry message
- **CSRF validation failure**: 400 Bad Request

### Session Errors

- **Invalid JWT**: Redirect to `/admin/login` with return_to
- **Expired session**: Redirect to `/admin/login` with return_to
- **Missing session**: Redirect to `/admin/login` with return_to

### Client-Side Error Handling

Pages use React state to display errors:

```typescript
const [error, setError] = useState("");

const handleSubmit = async (e) => {
  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password, csrfToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error);
      return;
    }

    router.push(data.redirectTo);
  } catch (err) {
    setError("An error occurred");
  }
};
```

## Implementation Files

### Core Authentication

- [Session management](../src/admin-auth/session.ts) - JWT creation, validation
- [Cookie handling](../src/admin-auth/cookie.ts) - Secure cookie operations
- [CSRF protection](../src/admin-auth/crsf.ts) - Token generation and validation
- [Rate limiting](../src/admin-auth/rate-limit.ts) - Login attempt throttling
- [Flags schema](../src/admin-auth/flags.ts) - Configuration flags definition

### Pages (UI)

- [Login page](../src/pages/admin/login.tsx) - Public login form
- [Session config page](../src/pages/admin/session-config.tsx) - Protected dashboard

### API Routes (Form Processing)

- [Login API](../src/pages/api/admin/login.ts) - Authentication endpoint
- [Session config API](../src/pages/api/admin/session-config.ts) - Flag update endpoint

### Middleware

- [Route protection](../src/middleware.ts) - Automatic authentication checks

### Components

- [Flag input](../src/admin-auth/components/FlagInput.tsx) - Form inputs for different flag types
- [Legacy rendering](../src/admin-auth/components/render.tsx) - Server-side HTML rendering (legacy)

## API Reference

### POST /api/admin/login

**Purpose**: Authenticate user and create session cookie

**Request**:
```json
{
  "password": "string",
  "csrfToken": "string"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "redirectTo": "/admin/session-config"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid password
- `400 Bad Request`: Invalid CSRF token
- `429 Too Many Requests`: Rate limit exceeded

**Side Effects**:
- Sets `admin_session` HTTP-only cookie
- Clears rate limit on success

### POST /api/admin/session-config

**Purpose**: Update session flags or logout

**Authentication**: Requires valid JWT session cookie

**Request (Update Flags)**:
```json
{
  "flags": {
    "sparqlEndpoint": "https://new-endpoint.com/query"
  },
  "csrfToken": "string"
}
```

**Request (Logout)**:
```json
{
  "logout": "true",
  "csrfToken": "string"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Flags updated successfully"
}
```

**Error Responses**:
- `401 Unauthorized`: No valid session
- `400 Bad Request`: Invalid CSRF token or flag values

**Side Effects**:
- Updates `admin_session` cookie with new flags (update)
- Clears `admin_session` cookie (logout)

## Testing

### Manual Testing Checklist

1. **Login Flow**:
   - [ ] Visit `/admin/session-config` when not logged in → redirects to `/admin/login?return_to=/admin/session-config`
   - [ ] Enter incorrect password → shows error message
   - [ ] Enter correct password → redirects to `/admin/session-config`
   - [ ] Visit `/admin/login` when already logged in → redirects to `/admin/session-config`

2. **Session Persistence**:
   - [ ] Login → navigate to home → return to `/admin/session-config` → still logged in
   - [ ] Close browser → reopen → visit `/admin/session-config` → still logged in (within session duration)

3. **Flag Management**:
   - [ ] Update a flag → submit form → see success message
   - [ ] Page reloads → flag change persists
   - [ ] Open new tab → visit page → see updated flag

4. **Logout**:
   - [ ] Click logout → redirects to `/admin/login`
   - [ ] Try to access `/admin/session-config` → redirects to login

5. **Security**:
   - [ ] Inspect cookies → `admin_session` is HTTP-only
   - [ ] Submit form without CSRF token → error
   - [ ] Try 6 failed logins → rate limited for 15 minutes

### Automated Tests

See [CSRF tests](../src/admin-auth/crsf.spec.ts) for token validation tests.

## Migration from Old System

If migrating from the old `/api/session-config` route:

### Breaking Changes

1. **Routes changed**:
   - `/api/session-config` (GET/POST) → `/admin/login` (GET) + `/admin/session-config` (GET)
   - Form submission now goes to `/api/admin/login` and `/api/admin/session-config`

2. **Environment variables renamed**:
   - `SESSION_CONFIG_PASSWORD` → `ADMIN_PASSWORD`
   - `SESSION_CONFIG_JWT_SECRET` → `ADMIN_JWT_SECRET`
   - `SESSION_CONFIG_SESSION_DURATION` → `ADMIN_SESSION_DURATION`

### Migration Steps

1. Update environment variables in deployment
2. Update any bookmarks or documentation links
3. No data migration needed (session-scoped only)

## Future Enhancements

Possible improvements for the system:

- Multi-user support with user-specific sessions
- Role-based access control (RBAC)
- Audit logging for flag changes
- Two-factor authentication (2FA)
- Session management dashboard (view active sessions)
- API key generation for programmatic access
