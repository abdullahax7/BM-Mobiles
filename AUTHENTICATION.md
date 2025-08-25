# PIN Authentication System

## Overview
This application is protected by a 6-digit PIN authentication system. Users must enter the correct PIN to access the application.

## Features
- 🔒 **Secure 3-6 digit PIN authentication**
- 🍪 **JWT token-based session management**
- ⏱️ **24-hour session expiration**
- 🚫 **Brute force protection with delays**
- 📱 **Mobile-friendly PIN input interface**
- ✨ **Auto-submit when all 6 digits are entered**
- 📋 **Paste support for quick entry**

## Configuration

### Setting the PIN
The default PIN is now `470`. To change it:

1. Open the `.env` file
2. Update the `ACCESS_PIN` value:
   ```env
   ACCESS_PIN="your-pin"  # 3-6 digits
   ```
3. Restart the development server

### Security Settings
For production, also update the JWT secret:
```env
JWT_SECRET="your-secure-random-string"
```

## Usage

### Logging In
1. Navigate to any page - you'll be redirected to `/login`
2. Enter your PIN (3-6 digits):
   - Type each digit in the boxes
   - Use arrow keys to navigate between boxes
   - Paste a PIN code directly
   - For shorter PINs (like `470`), just enter the digits and click "Unlock"
3. Click "Unlock" when you've entered at least 3 digits

### Logging Out
To add a logout button to your application, import the `LogoutButton` component:

```tsx
import LogoutButton from '@/components/LogoutButton';

// In your component
<LogoutButton />
```

## Session Management
- Sessions expire after 24 hours
- Sessions are stored as HTTP-only cookies
- Cookies are secure in production environments

## Protected Routes
All routes except the following are protected:
- `/login` - Login page
- `/api/auth/*` - Authentication API endpoints
- Static assets and Next.js system files

## Troubleshooting

### Forgot PIN
If you forget your PIN:
1. Access the server where the app is hosted
2. Check the `.env` file for the `ACCESS_PIN` value
3. Or update it to a new PIN and restart the server

### Session Issues
If you're having session problems:
1. Clear your browser cookies
2. Try logging in again
3. Check that the JWT_SECRET hasn't changed

## Security Best Practices
1. **Always change the default PIN** before deploying
2. **Use a strong JWT_SECRET** in production
3. **Keep the PIN secure** - don't share it publicly
4. **Consider using environment-specific PINs** for different environments
5. **Regularly rotate the PIN** for better security

## API Endpoints

### POST /api/auth/login
Authenticates a user with their PIN.

**Request Body:**
```json
{
  "pin": "123456"
}
```

**Response:**
- Success (200): Sets auth cookie and returns success message
- Invalid PIN (401): Returns error message
- Bad Request (400): Returns validation error

### POST /api/auth/logout
Logs out the current user by clearing the auth cookie.

**Response:**
- Success (200): Clears auth cookie and returns success message
