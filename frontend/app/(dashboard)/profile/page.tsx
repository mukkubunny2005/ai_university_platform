'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { usersApi } from '../../../lib/api/users';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { User, Mail, Shield, Building2, Calendar, Lock } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (password && password !== confirmPassword) {
      toastError('Passwords do not match');
      return;
    }

    setIsUpdating(true);
    try {
      await usersApi.update(user.id, {
        name: name || undefined,
        password: password || undefined,
      });
      await refreshProfile();
      success('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <User className="w-6 h-6 text-indigo-600" />
            My Account & Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personal academic credentials, role permissions, and profile settings.
          </p>
        </div>

        {/* Identity Overview Card */}
        <Card className="overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700" />
          <CardContent className="relative pt-0 pb-6 px-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 gap-4 mb-6">
              <div className="flex items-end gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 p-1.5 shadow-xl">
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 text-3xl font-black">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {user?.email}
                  </p>
                </div>
              </div>
              {user?.role && <Badge role={user.role} className="w-fit" />}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <Shield className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Institutional Role</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user?.role}</p>
                </div>
              </div>

              {user?.student && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Student ID</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {user.student.studentId}
                    </p>
                  </div>
                </div>
              )}

              {user?.faculty && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                  <Building2 className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Faculty ID</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {user.faculty.facultyId}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Account Active Since</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Update Account Information</CardTitle>
            <CardDescription>Modify your public name or update your secure password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Change Password (Leave blank to keep current)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" />}
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" />}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button size="sm" type="submit" isLoading={isUpdating}>
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
