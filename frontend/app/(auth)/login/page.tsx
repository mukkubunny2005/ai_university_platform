'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { GraduationCap, Mail, Lock, KeyRound, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Modal';

export default function LoginPage() {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await login({ email, password });
      success('Welcome back! Successfully logged into AI University.');
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Invalid institutional email or password. Please try again.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-200 dark:shadow-none mb-2">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            AI University Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access student, faculty, or administration dashboards
          </p>
        </div>

        <Card className="border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Account Login</CardTitle>
            <CardDescription className="text-xs">
              Use your assigned institutional credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@aiuniversity.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Password
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                size="md"
                isLoading={isSubmitting}
              >
                Sign In
              </Button>
            </form>

            {/* Quick Demo Fill Buttons */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> Quick Demo Fill
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('admin@aiuniversity.edu', 'Admin@123456')}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('alan.turing@aiuniversity.edu', 'Faculty@123456')}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Faculty
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('john.doe@aiuniversity.edu', 'Student@123456')}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Student
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Register as Student or Faculty
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forgot Password Modal Placeholder */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Reset Password"
        description="Self-service credential recovery"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs">
            <span className="font-bold">Phase 2 Notice:</span> Secure institutional email OTP password
            reset will be activated in Phase 2. For Phase 1, contact your system administrator or
            use the default seeded accounts.
          </div>
          <Input
            label="Institutional Email"
            placeholder="name@aiuniversity.edu"
            type="email"
            defaultValue={email}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowForgotModal(false)}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setShowForgotModal(false);
                success('Password reset instructions dispatched (Demo).');
              }}
            >
              Request Link
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
