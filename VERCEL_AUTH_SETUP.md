# Vercel Authentication Setup Guide

## Overview
The authentication system now uses a database-based PIN storage instead of environment variables. This ensures secure authentication both locally and on Vercel deployment.

## Database-Based Authentication Features
- **Secure PIN Storage**: PINs are hashed using PBKDF2 with salt
- **Brute Force Protection**: Account locks after 3 failed attempts
- **Progressive Lock Duration**: Lock time increases with failed attempts
- **No Local Storage**: All authentication data is stored in the database

## Initial Setup on Vercel

### 1. Environment Variables
Add the following environment variables in your Vercel project settings:

```
DATABASE_URL=<your-prisma-accelerate-url>
DIRECT_URL=<your-prisma-accelerate-url>
JWT_SECRET=<generate-a-secure-random-string>
NODE_ENV=production
INITIAL_PIN=<your-initial-pin-for-first-setup>
```

### 2. Database Migration
The Vercel build command already includes database setup:
```json
"vercel-build": "prisma generate --schema=prisma/schema.production.prisma && next build"
```

The `vercel.json` file has been configured to run migrations automatically:
```json
{
  "buildCommand": "prisma generate --schema=./prisma/schema.production.prisma && prisma db push --schema=./prisma/schema.production.prisma --skip-generate && next build"
}
```

### 3. Initial PIN Setup

#### Option A: Automatic Setup (Recommended)
1. Set the `INITIAL_PIN` environment variable in Vercel
2. On first login attempt with that PIN, it will be automatically created in the database
3. After first login, you can remove the `INITIAL_PIN` environment variable for security

#### Option B: Manual Setup via API
After deployment, you can initialize the PIN by making a POST request to your API:

```bash
curl -X POST https://your-app.vercel.app/api/auth/pin \
  -H "Content-Type: application/json" \
  -d '{"pin":"YOUR_PIN"}'
```

## PIN Management

### Change PIN
To change an existing PIN, use the PIN management API:

```bash
curl -X POST https://your-app.vercel.app/api/auth/pin \
  -H "Content-Type: application/json" \
  -d '{"pin":"NEW_PIN", "currentPin":"CURRENT_PIN"}'
```

### Check PIN Status
To check if a PIN is initialized:

```bash
curl https://your-app.vercel.app/api/auth/pin
```

## Security Features

1. **PIN Requirements**
   - Must be 3-6 digits
   - Stored as hashed value with salt
   - Never stored in plain text

2. **Account Lockout**
   - Locks after 3 failed attempts
   - Progressive lock duration: 5 min, 10 min, 20 min, etc.
   - Maximum lock duration: 24 hours

3. **Session Management**
   - JWT tokens expire after 24 hours
   - Secure HTTP-only cookies
   - SameSite protection against CSRF

## Troubleshooting

### Issue: "No PIN configured" error
**Solution**: Initialize the PIN using one of the setup methods above

### Issue: "Account is locked" error
**Solution**: Wait for the lock duration to expire or reset via database

### Issue: Login works locally but not on Vercel
**Solution**: 
1. Ensure all environment variables are set in Vercel
2. Check that database migrations have run
3. Verify the PIN has been initialized in the production database

## Local Development

To initialize PIN locally:
```bash
npm run pin:init
```

Or set via environment:
```bash
INITIAL_PIN=123456 npm run pin:init
```

## Important Notes

1. **Remove INITIAL_PIN after setup**: Once the PIN is initialized, remove the `INITIAL_PIN` environment variable from Vercel for security

2. **Backup Access**: Consider implementing a backup authentication method or admin override for emergencies

3. **Database Backups**: Ensure regular database backups as losing the AuthPin table would lock out all users

4. **PIN Reset**: Currently, PIN reset requires database access. Consider implementing a secure reset mechanism if needed
