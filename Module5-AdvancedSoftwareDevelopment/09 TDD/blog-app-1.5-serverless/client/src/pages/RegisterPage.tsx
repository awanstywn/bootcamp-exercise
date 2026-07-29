/**
 * @fileoverview Register Page Component
 * @objective Provide a user interface for creating new accounts.
 * @risk Password complexity rules must match the backend (Zod schema) to prevent frustrating user experiences where client allows what server rejects.
 * @relations Route: `/register`. Interacts with `authStore.ts`.
 * @logic
 * - Collects `name`, `email`, and `password`.
 * - On submit, calls `api.post('/auth/register')`.
 * - Parses Zod validation errors from the server (e.g. `errorObj.response.data.details[0].message`) to show specific field errors.
 * - On success, logs the user in immediately via `setUser` and redirects to `/dashboard`.
 */

import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import SEOHead from '../components/SEOHead';
import { isAxiosError } from 'axios';
import { useGoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError('');
      setIsLoading(true);
      try {
        const res = await api.post('/auth/google', { token: tokenResponse.access_token });
        setUser(res.data.user);
        navigate('/dashboard');
      } catch (err) {
        if (isAxiosError(err)) {
          setError(err.response?.data?.error || 'Google signup failed');
        } else {
          setError('An unexpected error occurred during Google signup');
        }
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError('Google signup failed or was cancelled');
    }
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/register', { name, email, password });
      setSuccess('Registration successful! Please check your email inbox for the verification link.');
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.data?.details) {
          setError(err.response.data.details[0].message);
        } else {
          setError(err.response?.data?.error || 'Registration failed');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SEOHead title="Create Account" />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200 px-8 py-3 flex items-center gap-2 text-sm text-slate-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
        <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
        <span>&rsaquo;</span>
        <span className="text-slate-900">Register</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 my-8">
        <div className="w-full max-w-[480px] bg-white border border-slate-200 rounded-lg p-8 shadow-sm">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold font-serif text-center text-slate-900 mb-2">Create Your Account</h1>
          <p className="text-center text-slate-500 text-sm mb-8">Join BlogApp and start your blogging journey</p>

          {error && (
            <div aria-live="polite" className="bg-red-50 border border-red-100 text-red-600 p-3 rounded mb-6 text-sm text-center">
              {error}
            </div>
          )}

          {success ? (
            <div aria-live="polite" className="bg-green-50 border border-green-100 text-green-700 p-6 rounded-lg text-center shadow-sm">
              <svg className="w-12 h-12 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h3 className="font-bold text-lg mb-2">Check Your Email</h3>
              <p className="text-sm text-green-600">{success}</p>
            </div>
          ) : (
            <>
            <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-slate-900 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-900 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-900 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none transition-colors"
                  placeholder="Create a password"
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 mb-3">Password must be at least 8 characters long</p>
              <div className="flex flex-wrap items-center gap-3 text-[10px]">
                <span className={`flex items-center gap-1 transition-colors ${password.length >= 8 ? 'text-green-600' : 'text-slate-500'}`}>
                  <span className={`w-2 h-2 rounded-full transition-colors ${password.length >= 8 ? 'bg-green-500' : 'bg-slate-200'}`}></span> 8+ characters
                </span>
                <span className={`flex items-center gap-1 transition-colors ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-slate-500'}`}>
                  <span className={`w-2 h-2 rounded-full transition-colors ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-slate-200'}`}></span> One uppercase
                </span>
                <span className={`flex items-center gap-1 transition-colors ${/[0-9]/.test(password) ? 'text-green-600' : 'text-slate-500'}`}>
                  <span className={`w-2 h-2 rounded-full transition-colors ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-slate-200'}`}></span> One number
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-900 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none transition-colors"
                  placeholder="Confirm your password"
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white font-medium py-3 rounded hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="my-6 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-slate-200 after:mt-0.5 after:flex-1 after:border-t after:border-slate-200">
            <p className="mx-4 mb-0 text-center text-sm text-slate-400">or</p>
          </div>

          <button 
            type="button" 
            onClick={() => googleLogin()}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-medium py-2.5 rounded hover:bg-slate-50 transition-colors mb-6 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign up with Google
          </button>

          <div className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-slate-900 font-bold hover:underline underline-offset-2">
              Login
            </Link>
          </div>
          </>
          )}
        </div>
      </div>

      {/* Bottom Features Banner */}
      <div className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 pt-8 md:pt-0 px-4">
            <div className="w-12 h-12 border border-slate-200 rounded flex items-center justify-center text-slate-500 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">100% Secure</h4>
              <p className="text-sm text-slate-500 leading-relaxed">We keep your data safe and never share your information.</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 pt-8 md:pt-0 px-4">
            <div className="w-12 h-12 border border-slate-200 rounded flex items-center justify-center text-slate-500 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Share Your Ideas</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Write and publish your articles for a global audience.</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 pt-8 md:pt-0 px-4">
            <div className="w-12 h-12 border border-slate-200 rounded flex items-center justify-center text-slate-500 shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Join Community</h4>
              <p className="text-sm text-slate-500 leading-relaxed">Connect with like-minded people and grow together.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
