# AmiRa ❤️

A private, adult romantic digital space for Rahul and Amita.

## Authentication

Authentication is designed from scratch with server-side sessions. Passwords are never stored in plaintext. Passwords are hashed with Argon2id. Session identifiers are cryptographically random, stored server-side, and delivered through HttpOnly, Secure, SameSite cookies. No access token or password is stored in localStorage.

## Security model

- Server-side password verification
- Argon2id password hashing
- Random opaque session IDs
- HttpOnly + Secure + SameSite cookies
- Session expiry and revocation
- Protected server routes
- Authorization checks on every private resource
- Secrets supplied through environment variables
- No credentials committed to Git

## Request flow

Browser → login form → POST /api/auth/login → validate input → query user → Argon2id verify → create session → Set-Cookie → protected request → session lookup → authorization → private content.

## Project status

Initial authentication architecture committed. Application implementation follows this security model.
