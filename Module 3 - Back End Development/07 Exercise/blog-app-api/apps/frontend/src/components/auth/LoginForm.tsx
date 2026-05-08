// src/components/auth/LoginForm.tsx
// Login form rendered inside a Modal. Validates email and password against the shared
// loginSchema (from @blog-app/shared) before calling the Zustand auth store's login action.
// On success, calls onSuccess() which closes the modal. Errors are displayed via toast
// notifications fired inside the store.

import { useState } from 'react';
import { loginSchema, type LoginInput } from '@blog-app/shared';
import { useAuthStore } from '@/stores/auth.store';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [form, setForm] = useState<LoginInput>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as keyof LoginInput;
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await login(result.data);
      onSuccess();
    } catch {
      // Error toast is handled in the store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-center text-sm text-gray-400 -mt-4 mb-4">Sign in to continue to Blog Apps.</p>
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        error={errors.password}
      />
      <Button type="submit" loading={isLoading} className="w-full">
        Sign In
      </Button>
      <p className="text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToRegister} className="text-violet-400 hover:text-violet-300 cursor-pointer">
          Sign Up
        </button>
      </p>
    </form>
  );
}
