import crypto from 'crypto';

/**
 * Generate a random salt for hashing
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Hash a PIN with the given salt
 */
export function hashPin(pin: string, salt: string): string {
  return crypto
    .pbkdf2Sync(pin, salt, 10000, 64, 'sha512')
    .toString('hex');
}

/**
 * Verify a PIN against a hash
 */
export function verifyPin(pin: string, hash: string, salt: string): boolean {
  const verifyHash = hashPin(pin, salt);
  return hash === verifyHash;
}

/**
 * Check if an account is locked
 */
export function isAccountLocked(lockedUntil: Date | null): boolean {
  if (!lockedUntil) return false;
  return new Date() < new Date(lockedUntil);
}

/**
 * Calculate lock duration based on failed attempts
 */
export function calculateLockDuration(attempts: number): Date | null {
  // Lock after 3 failed attempts
  if (attempts < 3) return null;
  
  // Progressive lock duration: 5 min, 15 min, 30 min, 1 hour, etc.
  const lockMinutes = Math.min(5 * Math.pow(2, attempts - 3), 1440); // Max 24 hours
  const lockUntil = new Date();
  lockUntil.setMinutes(lockUntil.getMinutes() + lockMinutes);
  
  return lockUntil;
}

/**
 * Validate PIN format
 */
export function validatePinFormat(pin: string): { valid: boolean; error?: string } {
  if (!pin) {
    return { valid: false, error: 'PIN is required' };
  }
  
  if (!/^\d{3,6}$/.test(pin)) {
    return { valid: false, error: 'PIN must be 3-6 digits' };
  }
  
  return { valid: true };
}
