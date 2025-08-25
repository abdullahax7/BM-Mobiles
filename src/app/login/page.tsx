'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Lock, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    if (value && index === 5 && newPin.every(digit => digit)) {
      handleSubmit(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) {
      setError('Please paste only numbers');
      return;
    }

    const newPin = [...pin];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newPin[i] = pastedData[i];
    }
    setPin(newPin);

    // Focus the next empty input or the last input
    const nextEmptyIndex = newPin.findIndex(digit => !digit);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
      // Auto-submit if all digits are filled
      if (newPin.every(digit => digit)) {
        handleSubmit(newPin.join(''));
      }
    }
  };

  const handleSubmit = async (pinCode?: string) => {
    // Remove empty values for shorter PINs
    const pinDigits = pin.filter(d => d !== '');
    const finalPin = pinCode || pinDigits.join('');
    
    if (finalPin.length < 3) {
      setError('PIN must be at least 3 digits');
      return;
    }
    
    if (finalPin.length > 6) {
      setError('PIN must be no more than 6 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: finalPin }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Login successful!');
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Invalid PIN');
        setPin(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        
        // Add shake animation
        const container = document.getElementById('pin-container');
        container?.classList.add('animate-shake');
        setTimeout(() => {
          container?.classList.remove('animate-shake');
        }, 500);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPin(['', '', '', '', '', '']);
    setError('');
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Secure Access</h1>
            <p className="text-gray-300">Enter your PIN (3-6 digits) to continue</p>
          </div>

          {/* PIN Input */}
          <div className="space-y-6">
            <div 
              id="pin-container"
              className="flex justify-center gap-3"
            >
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                  className={`
                    w-12 h-14 text-center text-2xl font-bold
                    bg-white/10 backdrop-blur
                    border-2 rounded-xl
                    text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200
                    ${digit ? 'border-blue-500 bg-white/20' : 'border-gray-600'}
                    ${error ? 'border-red-500 animate-shake' : ''}
                  `}
                  placeholder="•"
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-center">
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={isLoading || pin.every(d => !d)}
                className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 text-white font-medium rounded-xl transition-colors duration-200 disabled:cursor-not-allowed"
              >
                Clear
              </button>
              <button
                onClick={() => handleSubmit()}
                disabled={isLoading || pin.filter(d => d !== '').length < 3}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-medium rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Unlock
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Mobile Repair Shop Management System
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
