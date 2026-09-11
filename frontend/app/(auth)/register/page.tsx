'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { departmentsApi } from '../../../lib/api/departments';
import { Department } from '../../../types';
import { GraduationCap, Mail, Lock, User, UserCheck, Building2, Hash } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';

export default function RegisterPage() {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();

  const [role, setRole] = useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [semester, setSemester] = useState(1);
  const [facultyId, setFacultyId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Fetch departments for registration dropdown
    departmentsApi
      .getAll()
      .then((data) => {
        setDepartments(data);
        if (data.length > 0) {
          setDepartmentId(data[0].id);
        }
      })
      .catch(() => {
        // Fallback default departments if API offline during layout preview
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    if (!departmentId || !departmentId.trim()) {
      setErrorMessage('Please select an academic department.');
      toastError('Please select an academic department.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        role,
        departmentId: departmentId.trim(),
        studentId: role === 'STUDENT' ? (studentId.trim() || undefined) : undefined,
        semester: role === 'STUDENT' ? Number(semester) : undefined,
        facultyId: role === 'FACULTY' ? (facultyId.trim() || undefined) : undefined,
        designation: role === 'FACULTY' ? designation.trim() : undefined,
      });

      success(`Account created successfully as ${role}!`);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Registration failed. Check your information and try again.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">
      <div className="w-full max-w-lg space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-200 dark:shadow-none mb-2">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Create University Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Register for student course enrollment or faculty instruction portal
          </p>
        </div>

        <Card className="border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Account Registration</CardTitle>
            <CardDescription className="text-xs">
              Public registration allows Student and Faculty onboarding. Admin accounts are managed securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Account Type Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('STUDENT')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                      role === 'STUDENT'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    Student
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('FACULTY')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                      role === 'FACULTY'
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    Faculty
                  </button>
                </div>
              </div>

              {/* Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. Marie Curie"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Institutional Email"
                  type="email"
                  placeholder="m.curie@aiuniversity.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />
              </div>

              {/* Department */}
              <Select
                label="Academic Department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                options={
                  departments.length > 0
                    ? departments.map((department) => ({
                        label: `${department.name} (${department.code})`,
                        value: department.id,
                      }))
                    : [{ label: 'Loading departments...', value: '' }]
                }
                required
              />

              {/* Dynamic Role Fields */}
              {role === 'STUDENT' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Student ID (Optional)"
                    placeholder="e.g. STU-2026-099"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    leftIcon={<Hash className="w-4 h-4" />}
                    helperText="Auto-generated if left blank"
                  />
                  <Select
                    label="Current Semester"
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({
                      label: `Semester ${s}`,
                      value: s,
                    }))}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Faculty ID (Optional)"
                    placeholder="e.g. FAC-2026-099"
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    leftIcon={<Hash className="w-4 h-4" />}
                    helperText="Auto-generated if left blank"
                  />
                  <Input
                    label="Designation"
                    placeholder="e.g. Assistant Professor"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Password and Confirmation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                Register as {role === 'STUDENT' ? 'Student' : 'Faculty'}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Sign in to your portal
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
