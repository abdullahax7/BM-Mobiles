import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { db } from '@/lib/db';
import { verifyPin, isAccountLocked, calculateLockDuration, validatePinFormat } from '@/lib/auth';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;

    // Validate PIN format
    const validation = validatePinFormat(pin);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Get active PIN from database
    const authPin = await db.authPin.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    // If no PIN exists, create a default one (only for initial setup)
    if (!authPin) {
      // Use environment variable for initial PIN if set, otherwise use provided PIN
      const initialPin = process.env.INITIAL_PIN || pin;
      
      if (pin === initialPin) {
        // Create initial PIN in database
        const { generateSalt, hashPin } = await import('@/lib/auth');
        const salt = generateSalt();
        const hashedPin = hashPin(pin, salt);
        
        await db.authPin.create({
          data: {
            pin: hashedPin,
            salt,
            isActive: true,
            attempts: 0,
            lastUsed: new Date()
          }
        });
        
        // Continue with login
      } else {
        return NextResponse.json(
          { error: 'No PIN configured. Please contact administrator.' },
          { status: 401 }
        );
      }
    } else {
      // Check if account is locked
      if (isAccountLocked(authPin.lockedUntil)) {
        const lockMinutesRemaining = Math.ceil(
          (new Date(authPin.lockedUntil!).getTime() - Date.now()) / 60000
        );
        return NextResponse.json(
          { 
            error: `Account is locked. Please try again in ${lockMinutesRemaining} minute${lockMinutesRemaining > 1 ? 's' : ''}.`,
            locked: true,
            lockedUntil: authPin.lockedUntil
          },
          { status: 429 }
        );
      }

      // Verify PIN
      const isValid = verifyPin(pin, authPin.pin, authPin.salt);
      
      if (!isValid) {
        // Increment failed attempts
        const newAttempts = authPin.attempts + 1;
        const lockUntil = calculateLockDuration(newAttempts);
        
        await db.authPin.update({
          where: { id: authPin.id },
          data: { 
            attempts: newAttempts,
            lockedUntil: lockUntil
          }
        });
        
        // Add delay to prevent brute force
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (lockUntil) {
          return NextResponse.json(
            { 
              error: `Invalid PIN. Account is now locked for security.`,
              locked: true,
              attempts: newAttempts
            },
            { status: 401 }
          );
        } else {
          return NextResponse.json(
            { 
              error: `Invalid PIN. ${3 - newAttempts} attempt${3 - newAttempts > 1 ? 's' : ''} remaining.`,
              attempts: newAttempts,
              remainingAttempts: Math.max(0, 3 - newAttempts)
            },
            { status: 401 }
          );
        }
      }
      
      // Reset attempts on successful login
      await db.authPin.update({
        where: { id: authPin.id },
        data: { 
          attempts: 0,
          lockedUntil: null,
          lastUsed: new Date()
        }
      });
    }

    // Create JWT token
    const token = await new SignJWT({ authenticated: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // Token expires in 24 hours
      .sign(secret);

    // Create response with token in cookie
    const response = NextResponse.json(
      { success: true, message: 'Authentication successful' },
      { status: 200 }
    );

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
