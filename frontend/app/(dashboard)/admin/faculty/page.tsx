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
import { LoadingSpinner } from '../../../../components/shared/LoadingSpinner';
import { EmptyState } from '../../../../components/shared/EmptyState';
import { ErrorAlert } from '../../../../components/shared/ErrorAlert';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Eye,
  Filter,
  AlertCircle,
  AlertTriangle,
  Building2,
  BookOpen,
} from 'lucide-react';

export default function AdminFacultyPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [viewingFacultyId, setViewingFacultyId] = useState<string | null>(null);
  const [deletingFaculty, setDeletingFaculty] = useState<Faculty | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Filter state
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [designation, setDesignation] = useState('Professor');

  // Fetch departments for selector & filter
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  // Fetch faculty list with department filter
  const {
    data: facultyList = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['faculty', selectedDepartmentFilter],
    queryFn: () => facultyApi.getAll(selectedDepartmentFilter || undefined),
  });

  // Fetch faculty details when viewing
  const { data: viewingFaculty, isLoading: isViewingLoading } = useQuery({
    queryKey: ['faculty', viewingFacultyId],
    queryFn: () => facultyApi.getById(viewingFacultyId!),
    enabled: !!viewingFacultyId,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: facultyApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
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
      queryClient.invalidateQueries({ queryKey: ['departments'] });
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
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      success('Faculty member deleted successfully!');
      setDeletingFaculty(null);
      setDeleteErrorMessage(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to delete faculty member';
      setDeleteErrorMessage(msg);
      toastError(msg);
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

  const openAddModal = () => {
    closeModals();
    const defaultDept = selectedDepartmentFilter || (departments[0]?.id ?? '');
    setDepartmentId(defaultDept);
    setIsAddModalOpen(true);
  };

  const openEditModal = (fac: Faculty) => {
    setEditingFaculty(fac);
    setName(fac.user?.name || '');
    setEmail(fac.user?.email || '');
    setFacultyId(fac.facultyId);
    setDepartmentId(fac.departmentId);
    setDesignation(fac.designation);
  };

  const openDeleteModal = (fac: Faculty) => {
    setDeletingFaculty(fac);
    setDeleteErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFaculty) {
      if (!name.trim() || !facultyId.trim() || !departmentId || !designation.trim()) return;
      updateMutation.mutate({
        id: editingFaculty.id,
        data: {
          name: name.trim(),
          email: email.trim() || undefined,
          facultyId: facultyId.trim().toUpperCase(),
          departmentId,
          designation: designation.trim(),
        },
      });
    } else {
      if (!name.trim() || !email.trim() || !password || !facultyId.trim() || !departmentId || !designation.trim())
        return;
      createMutation.mutate({
        name: name.trim(),
        email: email.trim(),
        password,
        facultyId: facultyId.trim().toUpperCase(),
        departmentId,
        designation: designation.trim(),
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <UserCheck className="w-6 h-6 text-purple-600" />
              Faculty Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Professors, lecturers, academic ranks, and departmental teaching assignments.
            </p>
          </div>
          <Button
            size="sm"
            onClick={openAddModal}
            className="gap-1.5"
            disabled={departments.length === 0}
            title={departments.length === 0 ? 'Please create at least one department first' : 'Add Faculty'}
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

        {/* Faculty Table Card */}
        <Card>
          <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">
                All Faculty Members ({facultyList.length})
              </CardTitle>
              <CardDescription>Academic teaching and research staff</CardDescription>
            </div>

            {/* Department Filter */}
            {departments.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedDepartmentFilter}
                  onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                >
                  <option value="">All Departments ({departments.length})</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} — {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : facultyList.length === 0 ? (
              <EmptyState
                icon={<UserCheck className="w-8 h-8" />}
                title={
                  selectedDepartmentFilter
                    ? 'No faculty members in this department'
                    : 'No faculty members found'
                }
                description={
                  selectedDepartmentFilter
                    ? 'Try selecting a different department filter or add faculty to this department.'
                    : 'Add professors and lecturers to the faculty directory.'
                }
                actionLabel={departments.length > 0 ? 'Add Faculty' : undefined}
                onAction={departments.length > 0 ? openAddModal : undefined}
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
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mr-1 font-semibold">
                          {fac.department?.code}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">{fac.department?.name}</span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {fac.designation}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          {fac._count?.subjects || 0} Subjects
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingFacultyId(fac.id)}
                            className="p-1.5 h-auto text-slate-500 hover:text-purple-600"
                            title="View Faculty Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(fac)}
                            className="p-1.5 h-auto text-slate-500 hover:text-indigo-600"
                            title="Edit Faculty Record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(fac)}
                            className="p-1.5 h-auto text-slate-500 hover:text-rose-600"
                            title="Delete Faculty Member"
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

          <Input
            label="Institutional Email"
            type="email"
            placeholder="alan.turing@aiuniversity.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {!editingFaculty && (
            <Input
              label="Default Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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

      {/* Faculty Details View Modal */}
      <Modal
        isOpen={!!viewingFacultyId}
        onClose={() => setViewingFacultyId(null)}
        title="Faculty Member Profile"
        description="Comprehensive academic profile and assigned teaching curriculum"
        maxWidth="md"
      >
        {isViewingLoading || !viewingFaculty ? (
          <div className="py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Header info card */}
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600 text-white shrink-0 mt-0.5">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {viewingFaculty.user?.name}
                </h3>
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                  {viewingFaculty.designation} • {viewingFaculty.facultyId}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                  <Mail className="w-3.5 h-3.5" />
                  {viewingFaculty.user?.email}
                </p>
              </div>
            </div>

            {/* Department info */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Affiliated Department:
                </span>
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {viewingFaculty.department?.name} ({viewingFaculty.department?.code})
              </span>
            </div>

            {/* Assigned Subjects Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  Assigned Teaching Subjects ({viewingFaculty.subjects?.length || 0})
                </h4>
              </div>

              {!viewingFaculty.subjects || viewingFaculty.subjects.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">
                  No academic subjects currently allocated to this faculty member.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {viewingFaculty.subjects.map((sub: any) => (
                    <div
                      key={sub.id}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {sub.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {sub.course?.code} — {sub.course?.name}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-xs">
                        {sub.code}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingFacultyId(null)}
              >
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal with Error Banner */}
      <Modal
        isOpen={!!deletingFaculty}
        onClose={() => {
          setDeletingFaculty(null);
          setDeleteErrorMessage(null);
        }}
        title="Delete Faculty Member"
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Are you sure you want to delete this faculty member?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You are about to delete the faculty account for &quot;{deletingFaculty?.user?.name}&quot; ({deletingFaculty?.facultyId}). Linked subjects will automatically become unassigned.
              </p>
            </div>
          </div>

          {deleteErrorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{deleteErrorMessage}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 mt-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDeletingFaculty(null);
                setDeleteErrorMessage(null);
              }}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (deletingFaculty) {
                  deleteMutation.mutate(deletingFaculty.id);
                }
              }}
              isLoading={deleteMutation.isPending}
            >
              Delete Faculty
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

