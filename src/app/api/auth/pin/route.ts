import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSalt, hashPin, validatePinFormat } from '@/lib/auth';

// Initialize PIN if it doesn't exist (for first-time setup)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin, currentPin } = body;

    // Validate PIN format
    const validation = validatePinFormat(pin);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check if any PIN exists
    const existingPins = await db.authPin.findMany({
      where: { isActive: true }
    });

    // If PIN exists, require current PIN to change it
    if (existingPins.length > 0) {
      if (!currentPin) {
        return NextResponse.json(
          { error: 'Current PIN is required to change PIN' },
          { status: 400 }
        );
      }

      // Verify current PIN
      const currentPinRecord = existingPins[0];
      const { verifyPin } = await import('@/lib/auth');
      
      if (!verifyPin(currentPin, currentPinRecord.pin, currentPinRecord.salt)) {
        // Increment failed attempts
        await db.authPin.update({
          where: { id: currentPinRecord.id },
          data: { 
            attempts: currentPinRecord.attempts + 1,
            lockedUntil: currentPinRecord.attempts >= 2 
              ? new Date(Date.now() + 5 * 60 * 1000) // Lock for 5 minutes after 3 attempts
              : null
          }
        });

        return NextResponse.json(
          { error: 'Invalid current PIN' },
          { status: 401 }
        );
      }

      // Deactivate old PIN
      await db.authPin.update({
        where: { id: currentPinRecord.id },
        data: { isActive: false }
      });
    }

    // Create new PIN
    const salt = generateSalt();
    const hashedPin = hashPin(pin, salt);

    const newPin = await db.authPin.create({
      data: {
        pin: hashedPin,
        salt,
        isActive: true,
        attempts: 0
      }
    });

    return NextResponse.json(
      { 
        success: true, 
        message: existingPins.length > 0 ? 'PIN updated successfully' : 'PIN created successfully',
        id: newPin.id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('PIN management error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Check if PIN exists (for initialization check)
export async function GET() {
  try {
    const activePins = await db.authPin.findMany({
      where: { isActive: true },
      select: { id: true, createdAt: true }
    });

    return NextResponse.json({
      exists: activePins.length > 0,
      initialized: activePins.length > 0,
      count: activePins.length
    });
  } catch (error) {
    console.error('PIN check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
