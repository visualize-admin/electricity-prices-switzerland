# Specification: Session Config Management System

## Purpose

This specification defines a session flags management system that provides secure, password-protected access to server-side configuration flags. The system enables dynamic configuration of server side features, configured through a web-based interface.

It is currently used for

- Selection of the SPARQL endpoint at runtime.

## Feature Overview

The session config system provides:

- **Secure Authentication**: JWT-based session management with password protection
- **Session Flag Management**: Runtime configuration of feature flags for the current session
- **Session Persistence**: HTTP-only, signed cookies for secure session storage
- **Extensible Architecture**: Schema-driven approach for adding new configuration options

## Authentication Flow

### Initial Access

1. User navigates to `/api/session-config`
2. System checks for valid JWT session cookie
3. If no valid session exists, displays password authentication form
4. User enters session config password (stored as environment variable)
5. System validates password and creates signed JWT session cookie
6. User is redirected to session config dashboard

### Session Management

- **Session Duration**: Configurable via `SESSION_CONFIG_SESSION_DURATION` environment variable (default: 24 hours)
- **Cookie Security**: HTTP-only, secure (in production), SameSite=Lax
- **Token Validation**: JWT tokens signed with `SESSION_CONFIG_JWT_SECRET`
- **Automatic Expiry**: Sessions expire after configured duration

## Session Config Flags Schema

The system manages configuration flags through a validated schema, see [SessionConfigFlags](../src/session-config/flags.ts).

### Flag Persistence

- Flags are stored in JWT session payload
- Changes are immediately reflected in current session
- Flags reset to defaults when session expires
- No persistent storage - flags are session-scoped

## Integration Points

### GraphQL Context

The session system integrates with GraphQL resolvers through the [GraphQL context](../src/graphql/server-context.ts)
which is created dynamically using the HTTP request information.

### Server-Side Rendering

Next.js pages can access flags during server-side rendering:

```typescript
export async function getServerSideProps(context) {
  const sessionConfig = await getSessionConfigFlagsInfo(context);
  // Use flags to determine rendering behavior
}
```

## Environment Configuration

```bash
SESSION_CONFIG_PASSWORD=<secure-password>        # SESSION_CONFIG authentication password (Required)
SESSION_CONFIG_JWT_SECRET=<signing-secret>       # JWT token signing key (Required)
SESSION_CONFIG_SESSION_DURATION=86400           # Session duration in seconds (Required)
```

## Security Model

### Authentication Security

- Password-based authentication with environment variable storage
- No password transmission in URLs or persistent storage
- Rate limiting on authentication attempts

### Session Security

- JWT tokens with cryptographic signatures
- HTTP-only cookies prevent XSS access
- Secure flag in production environments
- SameSite protection against CSRF

### Authorization Model

- Binary access control: authenticated or not
- Only authenticated people can change their session flags

## Error Handling

### Authentication Errors

- Invalid password: Clear error message, retry opportunity
- Missing credentials: Redirect to authentication form
- Rate limit exceeded: Temporary lockout with retry time

### Session Errors

- Invalid JWT: Clear session cookie, redirect to login
- Missing session: Treat as unauthenticated user, gets default flags

### Validation Errors

- Invalid flag values: Error message with valid options
- Schema validation failure: Detailed error information
- Missing required fields: Clear field-level error messages

## API Specification

### Endpoint: `/api/session-config`

See [directly the file](../src/pages/api/session-config.ts).
