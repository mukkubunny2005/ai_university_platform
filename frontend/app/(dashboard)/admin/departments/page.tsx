'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { departmentsApi } from '../../../../lib/api/departments';
import { Department } from '../../../../types';
import { useToast } from '../../../../context/ToastContext';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/Table';
import { Modal } from '../../../../components/ui/Modal';
import { ConfirmModal } from '../../../../components/shared/ConfirmModal';
import { LoadingSpinner } from '../../../../components/shared/LoadingSpinner';
import { EmptyState } from '../../../../components/shared/EmptyState';
import { ErrorAlert } from '../../../../components/shared/ErrorAlert';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminDepartmentsPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  // Fetch departments
  const {
    data: departments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: departmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      success('Department created successfully!');
      closeModals();
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to create department');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => departmentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      success('Department updated successfully!');
      closeModals();
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to update department');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      success('Department deleted successfully!');
      setDeletingDepartment(null);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to delete department');
      setDeletingDepartment(null);
    },
  });

  const closeModals = () => {
    setIsAddModalOpen(false);
    setEditingDepartment(null);
    setName('');
    setCode('');
    setDescription('');
  };

  const openEditModal = (dept: Department) => {
    setEditingDepartment(dept);
    setName(dept.name);
    setCode(dept.code);
    setDescription(dept.description || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    if (editingDepartment) {
      updateMutation.mutate({
        id: editingDepartment.id,
        data: { name, code, description },
      });
    } else {
      createMutation.mutate({ name, code, description });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-indigo-600" />
              Academic Departments
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage university faculties, organizational codes, and departmental curriculums.
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
            <Plus className="w-4 h-4" /> Add Department
          </Button>
        </div>

        {isError && (
          <ErrorAlert
            message={(error as any)?.response?.data?.message || 'Failed to load departments'}
            onRetry={() => refetch()}
          />
        )}

        {/* Departments Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Departments ({departments.length})</CardTitle>
            <CardDescription>Comprehensive list of active academic divisions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : departments.length === 0 ? (
              <EmptyState
                icon={<Building2 className="w-8 h-8" />}
                title="No departments registered"
                description="Get started by creating the first academic department."
                actionLabel="Create Department"
                onAction={() => setIsAddModalOpen(true)}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Department Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-bold text-indigo-600 dark:text-indigo-400">
                        {dept.code}
                      </TableCell>
                      <TableCell className="font-semibold">{dept.name}</TableCell>
                      <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                        {dept.description || '—'}
                      </TableCell>
                      <TableCell>{dept._count?.courses || 0}</TableCell>
                      <TableCell>{dept._count?.students || 0}</TableCell>
                      <TableCell>{dept._count?.faculty || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(dept)}
                            className="p-1.5 h-auto text-slate-500 hover:text-indigo-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingDepartment(dept)}
                            className="p-1.5 h-auto text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit Department Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingDepartment}
        onClose={closeModals}
        title={editingDepartment ? 'Edit Academic Department' : 'Create Academic Department'}
        description="Configure department identification and description."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Department Name"
            placeholder="e.g. Computer Science & Engineering"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Department Code"
            placeholder="e.g. CSE"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the department's core curriculum and academic vision..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={closeModals}>
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingDepartment ? 'Update Department' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingDepartment}
        onClose={() => setDeletingDepartment(null)}
        onConfirm={() => {
          if (deletingDepartment) {
            deleteMutation.mutate(deletingDepartment.id);
          }
        }}
        title="Delete Department"
        message={`Are you sure you want to delete "${deletingDepartment?.name}" (${deletingDepartment?.code})? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
