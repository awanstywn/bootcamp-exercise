// src/components/auth/RegisterForm.tsx
// Registration form rendered inside a Modal. Validates name, email, and password
// against the shared registerSchema before calling the Zustand auth store's register action.
// On success, switches to the login form so the user can sign in with their new account.

import { useState } from 'react';
import { registerSchema, type RegisterInput } from '@blog-app/shared';
import { useAuthStore } from '@/stores/auth.store';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [form, setForm] = useState<RegisterInput>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as keyof RegisterInput;
        fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const ok = await register(result.data);
    if (ok) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-center text-sm text-gray-400 -mt-4 mb-4">Create an account to start writing.</p>
      <Input
        label="Name"
        placeholder="John Doe"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={errors.name}
      />
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
        placeholder="Min. 8 characters"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        error={errors.password}
      />
      <Button type="submit" loading={isLoading} className="w-full">
        Sign Up
      </Button>
      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin} className="text-violet-400 hover:text-violet-300 cursor-pointer">
          Sign In
        </button>
      </p>
    </form>
  );
}
