'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { usersApi } from '../../../../lib/api/users';
import { Role, User } from '../../../../types';
import { useToast } from '../../../../context/ToastContext';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Badge } from '../../../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/Table';
import { Modal } from '../../../../components/ui/Modal';
import { ConfirmModal } from '../../../../components/shared/ConfirmModal';
import { LoadingSpinner } from '../../../../components/shared/LoadingSpinner';
import { EmptyState } from '../../../../components/shared/EmptyState';
import { ErrorAlert } from '../../../../components/shared/ErrorAlert';
import { Users as UsersIcon, Plus, Trash2, ShieldCheck, Mail } from 'lucide-react';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');

  // Fetch users
  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  });

  // Create User Mutation
  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      success('User created successfully!');
      closeModals();
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to create user');
    },
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      success('User deleted successfully!');
      setDeletingUser(null);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to delete user');
      setDeletingUser(null);
    },
  });

  const closeModals = () => {
    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    setPassword('');
    setRole('STUDENT');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    createMutation.mutate({ name, email, password, role });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <UsersIcon className="w-6 h-6 text-rose-600" />
              Users & Access Governance
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              System accounts, cryptographic roles, and institutional access management.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              closeModals();
              setIsAddModalOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create User
          </Button>
        </div>

        {isError && (
          <ErrorAlert
            message={(error as any)?.response?.data?.message || 'Failed to load users'}
            onRetry={() => refetch()}
          />
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Platform Users ({users.length})</CardTitle>
            <CardDescription>Accounts with active institutional identities</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : users.length === 0 ? (
              <EmptyState
                icon={<UsersIcon className="w-8 h-8" />}
                title="No users found"
                description="Create system accounts to get started."
                actionLabel="Create User"
                onAction={() => setIsAddModalOpen(true)}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Name</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Access Role</TableHead>
                    <TableHead>Profile Info</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-semibold text-slate-900 dark:text-white">
                        {u.name}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {u.email}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge role={u.role} />
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {u.student && (
                          <span>
                            Student: {u.student.studentId} (Sem {u.student.semester})
                          </span>
                        )}
                        {u.faculty && (
                          <span>
                            Faculty: {u.faculty.facultyId} ({u.faculty.designation})
                          </span>
                        )}
                        {!u.student && !u.faculty && u.role === 'ADMIN' && (
                          <span className="text-rose-600 font-medium">Administrator</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingUser(u)}
                          className="p-1.5 h-auto text-slate-500 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeModals}
        title="Create Platform User"
        description="Provision a new credential with role-based permissions."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Marie Curie"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Institutional Email"
            type="email"
            placeholder="name@aiuniversity.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Initial Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Select
            label="System Role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            options={[
              { label: 'Student (Standard Learner)', value: 'STUDENT' },
              { label: 'Faculty (Teacher / Professor)', value: 'FACULTY' },
              { label: 'Admin (Full System Governance)', value: 'ADMIN' },
            ]}
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={closeModals}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={createMutation.isPending}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={() => {
          if (deletingUser) {
            deleteMutation.mutate(deletingUser.id);
          }
        }}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete the account for "${deletingUser?.name}" (${deletingUser?.email})?`}
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
