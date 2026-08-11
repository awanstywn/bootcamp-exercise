/**
 * @file Login.tsx
 * @description User Login form. Interfaces with Zustand authentication store,
 * evaluates client inputs (email syntax, password requirements) using react-hook-form,
 * and handles redirects to the blog authoring route on success.
 */

import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/useAuthStore';
import { Zap, Eye, EyeOff } from 'lucide-react';

// Form interface schema
interface LoginForm { email: string; password: string; }

/**
 * Login view component.
 */
const Login = () => {
  // Pull login functions and authentication states from Zustand
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  // State variables for toggling password visibility and tracking submission loaders/errors
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Bind validation properties using useForm
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  // If the user has a valid active session already, redirect them to the blog page immediately.
  if (isAuthenticated) return <Navigate to="/blog" replace />;

  /**
   * Submits credentials to Backendless API and handles route redirects.
   * @param email Validated Work email
   * @param password Validated password
   */
  const onSubmit = async ({ email, password }: LoginForm) => {
    try {
      setLoading(true);
      setError(null);
      // Run login flow
      await login(email, password);
      // Success: route to the homepage
      navigate('/');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login — PayStream</title>
        <meta name="description" content="Sign in to your PayStream account to create and manage blog posts." />
      </Helmet>

      <div className="min-h-screen bg-dark-100 flex items-center justify-center px-4 py-20">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-gray-100">

          {/* Logo illustration */}
          <div className="flex items-center gap-2 justify-center mb-8" aria-hidden="true">
            <Zap className="w-6 h-6 text-primary-500" />
            <span className="font-bold text-xl text-dark-900">PayStream</span>
          </div>

          <h1 className="text-2xl font-bold text-dark-900 text-center mb-1">Welcome back</h1>
          <p className="text-gray-400 text-center text-sm mb-6">Sign in to manage your blog posts</p>

          {/* Error warning box */}
          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            
            {/* Email input field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-describedby={errors.email ? 'email-error' : undefined}
                aria-invalid={!!errors.email}
                className={`form-input ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                {...register('email', {
                  required: 'Email is required',
                  // Regex validation ensuring standard format (name@domain.ext)
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                })}
              />
              {errors.email && (
                <p id="email-error" role="alert" className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password input field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-describedby={errors.password ? 'pw-error' : undefined}
                  aria-invalid={!!errors.password}
                  className={`form-input pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' },
                  })}
                />
                {/* Toggle button to show/hide raw characters */}
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw
                    ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                    : <Eye    className="w-4 h-4" aria-hidden="true" />}
                </button>
              </div>
              {errors.password && (
                <p id="pw-error" role="alert" className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Redirection to Sign Up */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Need an account?{' '}
            <Link to="/register" className="text-primary-500 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;

