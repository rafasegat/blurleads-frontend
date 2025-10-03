'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async (): Promise<void> => {
      console.log('[AuthCallback] Processing OAuth callback');

      try {
        // Get the session from Supabase
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthCallback] Session error:', error);
          throw error;
        }

        if (session) {
          console.log('[AuthCallback] Session found, redirecting to dashboard');
          router.push('/dashboard');
        } else {
          console.log('[AuthCallback] No session found, redirecting to login');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('[AuthCallback] Callback error:', error);
        router.push('/auth/login?error=callback_failed');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
}
