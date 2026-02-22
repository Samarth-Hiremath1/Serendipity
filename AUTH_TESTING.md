# Authentication Testing Guide

This document describes how to manually test the authentication implementation for Task 3.

## What Was Implemented

1. **Supabase Auth Configuration**
   - Enhanced Supabase client with SSR support (`@supabase/ssr`)
   - Client-side browser client for auth operations
   - Server-side client for API routes and server components

2. **Auth Middleware** (`middleware.ts`)
   - Protects routes: `/events`, `/contacts`, `/onboard`
   - Redirects unauthenticated users to `/login`
   - Redirects authenticated users away from `/login` and `/signup` to `/events`
   - Refreshes auth sessions automatically

3. **Sign-up Page** (`/signup`)
   - Email/password registration
   - Magic link authentication option
   - Email confirmation flow
   - Redirects to onboarding after successful signup

4. **Login Page** (`/login`)
   - Email/password authentication
   - Magic link authentication option
   - Preserves redirect URL for protected routes
   - Error handling for invalid credentials

5. **Auth Context Provider** (`lib/auth-context.tsx`)
   - Global auth state management
   - Exposes `user`, `session`, `loading`, and `signOut`
   - Listens for auth state changes
   - Wrapped around entire app in `layout.tsx`

6. **Auth Callback Route** (`/auth/callback`)
   - Handles OAuth and magic link callbacks
   - Exchanges code for session
   - Redirects to appropriate page after auth

7. **Updated Landing Page** (`/`)
   - Shows sign-up and login CTAs for unauthenticated users
   - Redirects authenticated users to `/events`
   - Feature highlights

8. **Placeholder Events Page** (`/events`)
   - Protected route requiring authentication
   - Shows user email and sign-out button
   - Placeholder for future event feed implementation

## Manual Testing Steps

### 1. Test Sign-up Flow

```bash
npm run dev
```

1. Navigate to `http://localhost:3000`
2. Click "Get Started" button
3. Enter email and password (min 6 characters)
4. Click "Sign up"
5. Check email for confirmation link (if email confirmation is enabled)
6. Should redirect to `/onboard` (placeholder page)

### 2. Test Login Flow

1. Navigate to `http://localhost:3000/login`
2. Enter registered email and password
3. Click "Sign in"
4. Should redirect to `/events` page
5. Verify user email is displayed
6. Verify "Sign out" button works

### 3. Test Magic Link Authentication

1. Navigate to `/signup` or `/login`
2. Enter email only
3. Click "Send magic link"
4. Check email for magic link
5. Click link in email
6. Should redirect to app and be authenticated

### 4. Test Protected Routes

1. Sign out if logged in
2. Try to access `http://localhost:3000/events` directly
3. Should redirect to `/login?redirectTo=/events`
4. After logging in, should redirect back to `/events`

### 5. Test Auth State Management

1. Log in to the app
2. Open browser DevTools → Application → Cookies
3. Verify Supabase auth cookies are present
4. Refresh the page
5. Should remain logged in (session persists)
6. Click "Sign out"
7. Should redirect to landing page
8. Verify cookies are cleared

### 6. Test Middleware Protection

1. While logged out, try accessing:
   - `/events` → should redirect to `/login`
   - `/contacts` → should redirect to `/login`
   - `/onboard` → should redirect to `/login`
2. While logged in, try accessing:
   - `/login` → should redirect to `/events`
   - `/signup` → should redirect to `/events`

## Requirements Validation

### Requirement 1.1: Authentication Required
✅ Middleware protects all features behind authentication
✅ Unauthenticated users redirected to login

### Requirement 1.2: Profile Creation Flow
✅ New users presented with signup form
✅ After signup, redirected to onboarding (placeholder for task 5)

## Build Verification

```bash
npm run build
```

Build should complete successfully with no errors.

## TypeScript Verification

```bash
npx tsc --noEmit
```

Should complete with no type errors.

## Notes

- Email confirmation may be required depending on Supabase project settings
- Magic links require proper email configuration in Supabase
- The `/onboard` route is a placeholder and will be implemented in Task 5
- The `/events` page is a placeholder and will be implemented in later tasks
