/**
 * @fileoverview [Brief description of the file's purpose]
 * @objective Provide the necessary logic and structural foundation for this specific module/component.
 * @risk Contains standard logic; ensure strict typing to prevent runtime errors.
 * @relations Integrates with related features within the layer.
 * @logic Follows the established architectural patterns and standard guidelines.
 */
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import SEOHead from '../components/SEOHead';
import { isAxiosError } from 'axios';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  
  // Use a ref to prevent double execution in React Strict Mode
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('error');
      setError('Invalid or missing verification token.');
      return;
    }

    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const verifyEmail = async () => {
      try {
        const res = await api.post('/auth/verify-email', { token });
        setUser(res.data.user);
        setStatus('success');
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (err) {
        setStatus('error');
        if (isAxiosError(err)) {
          setError(err.response?.data?.error || 'Failed to verify email');
        } else {
          setError('An unexpected error occurred');
        }
      }
    };

    verifyEmail();
  }, [token, navigate, setUser]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SEOHead title="Verify Email" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-[440px] bg-white border border-slate-200 rounded-lg p-8 shadow-sm text-center">
          
          {status === 'loading' && (
            <div>
              <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 mb-2">Verifying your email...</h1>
              <p className="text-slate-500 text-sm">Please wait while we confirm your account.</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 mb-2">Email Verified!</h1>
              <p className="text-slate-500 text-sm mb-6">Your account has been successfully created.</p>
              <p className="text-sm text-slate-600">Redirecting you to dashboard...</p>
            </div>
          )}

          {status === 'error' && (
            <div>
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 mb-2">Verification Failed</h1>
              <p className="text-red-600 text-sm mb-8">{error}</p>
              <Link to="/register" className="inline-block bg-slate-900 text-white font-medium px-6 py-3 rounded hover:bg-slate-800 transition-colors">
                Return to Registration
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
