'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { facultyApi } from '../../../../lib/api/faculty';
import { departmentsApi } from '../../../../lib/api/departments';
import { Faculty } from '../../../../types';
import { useToast } from '../../../../context/ToastContext';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/Table';
import { Modal } from '../../../../components/ui/Modal';
import { ConfirmModal } from '../../../../components/shared/ConfirmModal';
import { LoadingSpinner } from '../../../../components/shared/LoadingSpinner';
import { EmptyState } from '../../../../components/shared/EmptyState';
import { ErrorAlert } from '../../../../components/shared/ErrorAlert';
import { UserCheck, Plus, Edit2, Trash2, Mail } from 'lucide-react';

export default function AdminFacultyPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [deletingFaculty, setDeletingFaculty] = useState<Faculty | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('Professor');

  // Fetch faculty
  const {
    data: facultyList = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['faculty'],
    queryFn: () => facultyApi.getAll(),
  });

  // Fetch departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: facultyApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      success('Faculty member added successfully!');
      closeModals();
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to add faculty member');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => facultyApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      success('Faculty member updated successfully!');
      closeModals();
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to update faculty member');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => facultyApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      success('Faculty member deleted successfully!');
      setDeletingFaculty(null);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to delete faculty member');
      setDeletingFaculty(null);
    },
  });

  const closeModals = () => {
    setIsAddModalOpen(false);
    setEditingFaculty(null);
    setName('');
    setEmail('');
    setPassword('');
    setFacultyId('');
    setDesignation('Professor');
    if (departments.length > 0) setDepartmentId(departments[0].id);
  };

  const openEditModal = (fac: Faculty) => {
    setEditingFaculty(fac);
    setName(fac.user?.name || '');
    setFacultyId(fac.facultyId);
    setDepartmentId(fac.departmentId);
    setDesignation(fac.designation);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFaculty) {
      updateMutation.mutate({
        id: editingFaculty.id,
        data: {
          name,
          facultyId,
          departmentId,
          designation,
        },
      });
    } else {
      if (!email || !password) return;
      createMutation.mutate({
        name,
        email,
        password,
        facultyId,
        departmentId,
        designation,
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <UserCheck className="w-6 h-6 text-purple-600" />
              Faculty Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Professors, lecturers, designations, and departmental affiliations.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              closeModals();
              if (departments.length > 0) setDepartmentId(departments[0].id);
              setIsAddModalOpen(true);
            }}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Faculty
          </Button>
        </div>

        {isError && (
          <ErrorAlert
            message={(error as any)?.response?.data?.message || 'Failed to load faculty'}
            onRetry={() => refetch()}
          />
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Faculty Members ({facultyList.length})</CardTitle>
            <CardDescription>Academic teaching and research staff</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : facultyList.length === 0 ? (
              <EmptyState
                icon={<UserCheck className="w-8 h-8" />}
                title="No faculty members found"
                description="Add professors and lecturers to the faculty directory."
                actionLabel="Add Faculty"
                onAction={() => setIsAddModalOpen(true)}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Assigned Subjects</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facultyList.map((fac) => (
                    <TableRow key={fac.id}>
                      <TableCell className="font-bold text-purple-600 dark:text-purple-400">
                        {fac.facultyId}
                      </TableCell>
                      <TableCell className="font-semibold">{fac.user?.name}</TableCell>
                      <TableCell className="text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {fac.user?.email}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {fac.department?.code} — {fac.department?.name}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {fac.designation}
                      </TableCell>
                      <TableCell>{fac._count?.subjects || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(fac)}
                            className="p-1.5 h-auto text-slate-500 hover:text-indigo-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingFaculty(fac)}
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

      {/* Add / Edit Faculty Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingFaculty}
        onClose={closeModals}
        title={editingFaculty ? 'Edit Faculty Record' : 'Add Faculty Member'}
        description="Configure academic staff profile, institutional identifier, and title."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Dr. Alan Turing"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {!editingFaculty && (
            <>
              <Input
                label="Institutional Email"
                type="email"
                placeholder="alan.turing@aiuniversity.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Default Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Faculty ID"
              placeholder="e.g. FAC-CSE-001"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              required
            />
            <Input
              label="Designation"
              placeholder="e.g. Professor"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              required
            />
          </div>

          <Select
            label="Department"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            options={departments.map((d) => ({
              label: `${d.name} (${d.code})`,
              value: d.id,
            }))}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={closeModals}>
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingFaculty}
        onClose={() => setDeletingFaculty(null)}
        onConfirm={() => {
          if (deletingFaculty) {
            deleteMutation.mutate(deletingFaculty.id);
          }
        }}
        title="Delete Faculty Member"
        message={`Are you sure you want to delete the faculty account for "${deletingFaculty?.user?.name}" (${deletingFaculty?.facultyId})? Linked subjects will become unassigned.`}
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
