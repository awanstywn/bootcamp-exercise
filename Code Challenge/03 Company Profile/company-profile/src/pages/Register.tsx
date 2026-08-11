/**
 * @file Register.tsx
 * @description User registration page. Handles new user creations on Backendless,
 * performs validation details (names, email strings, password characters) with react-hook-form,
 * and sets cookies for automatic subsequent sign-ins.
 */

import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/useAuthStore';
import { Zap, Eye, EyeOff } from 'lucide-react';

// Form input structure fields
interface RegisterForm { email: string; password: string; name: string; }

/**
 * Register view component.
 */
const Register = () => {
  // Extract registration action and authentication status checks from Zustand store
  const { register: registerAction, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  // State handles for loader delays, password toggle eyes, and server exceptions
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Bind validations using react-hook-form hooks
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();

  // If user is already authenticated, redirect to the blog page
  if (isAuthenticated) return <Navigate to="/blog" replace />;

  /**
   * Action triggered upon input resolution. Submits information to registerAction
   * and auto-navigates on successful creation.
   * @param email Validated work email
   * @param password Validated password
   * @param name Validated full name
   */
  const onSubmit = async ({ email, password, name }: RegisterForm) => {
    try {
      setLoading(true);
      setError(null);
      // Run registration flow
      await registerAction(email, password, name);
      // Success: navigate to the homepage
      navigate('/');
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register — PayStream</title>
        <meta name="description" content="Create your PayStream account to start managing blog posts." />
      </Helmet>

      <div className="min-h-screen bg-dark-100 flex items-center justify-center px-4 py-20">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-gray-100">

          {/* Logo illustration */}
          <div className="flex items-center gap-2 justify-center mb-8" aria-hidden="true">
            <Zap className="w-6 h-6 text-primary-500" />
            <span className="font-bold text-xl text-dark-900">PayStream</span>
          </div>

          <h1 className="text-2xl font-bold text-dark-900 text-center mb-1">Create an account</h1>
          <p className="text-gray-400 text-center text-sm mb-6">Sign up to manage your blog posts</p>

          {/* Error alert warnings */}
          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            
            {/* Full Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                aria-describedby={errors.name ? 'name-error' : undefined}
                aria-invalid={!!errors.name}
                className={`form-input ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && (
                <p id="name-error" role="alert" className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email address field */}
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
                  // Regex validation checks syntax formatting
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
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-describedby={errors.password ? 'pw-error' : undefined}
                  aria-invalid={!!errors.password}
                  className={`form-input pr-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' },
                  })}
                />
                {/* Eye toggle button */}
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
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          {/* Direct redirects back to Sign In */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;

