/**
 * @file LoginForm.tsx
 * @description React Component for the Client (Frontend) layer.
 * 
 * @objective 
 * To provide the specific functionality required for LoginForm operations.
 * 
 * @relations
 * Interacts with: react, ../../hooks/useAuth, ../ui/Input, ../ui/Button, lucide-react.
 * 
 * @howItWorks
 * Receives props to dynamically render UI elements, managing local state where necessary. This helps maintain separation of concerns and keeps the codebase modular and readable.
 */

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Mail, Lock } from "lucide-react";

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading, error, setError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = await login(email, password);
    if (success) onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 bg-error/10 border border-error/20 rounded-md text-sm text-error">
          {error}
        </div>
      )}
      <Input
        label="Email Address"
        type="email"
        icon={<Mail size={18} />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <div className="space-y-4">
        <Input
          label="Password"
          type="password"
          icon={<Lock size={18} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            className="rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span className="text-sm text-text-main font-medium">Remember me</span>
        </label>
      </div>
      <Button type="submit" isLoading={isLoading} className="w-full text-base h-12 bg-[#1A1A1A] hover:bg-[#2A2A2A]">
        Login
      </Button>
    </form>
  );
}
