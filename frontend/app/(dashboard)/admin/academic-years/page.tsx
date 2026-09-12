'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { academicYearsApi } from '../../../../lib/api/academicYears';
import { AcademicYear } from '../../../../types';
import { useToast } from '../../../../context/ToastContext';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Badge } from '../../../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/Table';
import { Modal } from '../../../../components/ui/Modal';
import { LoadingSpinner } from '../../../../components/shared/LoadingSpinner';
import { EmptyState } from '../../../../components/shared/EmptyState';
import { ErrorAlert } from '../../../../components/shared/ErrorAlert';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export default function AdminAcademicYearsPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAcademicYear, setEditingAcademicYear] = useState<AcademicYear | null>(null);
  const [deletingAcademicYear, setDeletingAcademicYear] = useState<AcademicYear | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(false);

  // Helper for input date formatting (YYYY-MM-DD)
  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Helper for table date display
  const formatDateDisplay = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
    } catch {
      return '—';
    }
  };

  // Fetch Academic Years
  const {
    data: academicYears = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['academic-years'],
    queryFn: academicYearsApi.getAll,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: academicYearsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      success('Academic year created successfully!');
      closeModals();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to create academic year';
      setFormError(msg);
      toastError(msg);
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => academicYearsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      success('Academic year updated successfully!');
      closeModals();
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to update academic year';
      setFormError(msg);
      toastError(msg);
    },
  });

  // Activate Mutation
  const activateMutation = useMutation({
    mutationFn: (id: string) => academicYearsApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      success('Academic year activated successfully!');
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to activate academic year');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => academicYearsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      success('Academic year deleted successfully!');
      setDeletingAcademicYear(null);
      setDeleteErrorMessage(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to delete academic year';
      setDeleteErrorMessage(msg);
      toastError(msg);
    },
  });

  const closeModals = () => {
    setIsAddModalOpen(false);
    setEditingAcademicYear(null);
    setCode('');
    setName('');
    setStartDate('');
    setEndDate('');
    setIsActive(false);
    setFormError(null);
  };

  const openAddModal = () => {
    closeModals();
    setIsAddModalOpen(true);
  };

  const openEditModal = (ay: AcademicYear) => {
    setEditingAcademicYear(ay);
    setCode(ay.code);
    setName(ay.name);
    setStartDate(formatDateForInput(ay.startDate));
    setEndDate(formatDateForInput(ay.endDate));
    setIsActive(ay.isActive);
    setFormError(null);
  };

  const openDeleteModal = (ay: AcademicYear) => {
    setDeletingAcademicYear(ay);
    setDeleteErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!code.trim() || !name.trim() || !startDate || !endDate) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setFormError('Please enter valid dates.');
      return;
    }

    if (end <= start) {
      setFormError('End date must be after start date.');
      return;
    }

    const payload = {
      code: code.trim(),
      name: name.trim(),
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      isActive,
    };

    if (editingAcademicYear) {
      updateMutation.mutate({
        id: editingAcademicYear.id,
        data: payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <Calendar className="w-6 h-6 text-indigo-600" />
              Academic Years Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage university academic calendars, active terms, and sectional schedules.
            </p>
          </div>
          <Button
            size="sm"
            onClick={openAddModal}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Academic Year
          </Button>
        </div>

        {isError && (
          <ErrorAlert
            message={(error as any)?.response?.data?.message || 'Failed to load academic years'}
            onRetry={() => refetch()}
          />
        )}

        {/* Academic Years Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Academic Years ({academicYears.length})</CardTitle>
            <CardDescription>Comprehensive list of active and archived institutional academic terms</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : academicYears.length === 0 ? (
              <EmptyState
                icon={<Calendar className="w-8 h-8" />}
                title="No academic years registered"
                description="Get started by creating the first institutional academic year."
                actionLabel="Create Academic Year"
                onAction={openAddModal}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sections</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {academicYears.map((ay) => {
                    const isActivating =
                      activateMutation.isPending && activateMutation.variables === ay.id;

                    return (
                      <TableRow key={ay.id}>
                        <TableCell className="font-bold text-indigo-600 dark:text-indigo-400">
                          {ay.code}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900 dark:text-white">
                          {ay.name}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                          {formatDateDisplay(ay.startDate)}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600 dark:text-slate-300">
                          {formatDateDisplay(ay.endDate)}
                        </TableCell>
                        <TableCell>
                          {ay.isActive ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="default">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {ay._count?.sections || 0} Sections
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!ay.isActive ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => activateMutation.mutate(ay.id)}
                                disabled={activateMutation.isPending}
                                className="p-1.5 h-auto text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
                                title="Activate Academic Year"
                              >
                                {isActivating ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            ) : (
                              <span
                                className="p-1.5 text-emerald-600 dark:text-emerald-400 inline-flex items-center"
                                title="Currently Active Year"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-100 dark:fill-emerald-950" />
                              </span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(ay)}
                              className="p-1.5 h-auto text-slate-500 hover:text-indigo-600"
                              title="Edit Academic Year"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteModal(ay)}
                              className="p-1.5 h-auto text-slate-500 hover:text-rose-600"
                              title="Delete Academic Year"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit Academic Year Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingAcademicYear}
        onClose={closeModals}
        title={editingAcademicYear ? 'Edit Academic Year' : 'Create Academic Year'}
        description="Configure academic calendar cycle, date ranges, and activation status."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{formError}</p>
            </div>
          )}

          <Input
            label="Academic Year Code"
            placeholder="e.g. 2024-2025"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <Input
            label="Academic Year Name"
            placeholder="e.g. Academic Year 2024-2025"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="w-full space-y-1.5">
              <label
                htmlFor="startDate"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-950 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800"
              />
            </div>

            <div className="w-full space-y-1.5">
              <label
                htmlFor="endDate"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-950 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-900"
            />
            <div className="space-y-0.5">
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer select-none"
              >
                Set as Active Academic Year
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Only one academic year can be active at a time. Activating this term will deactivate all others.
              </p>
            </div>
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
              {editingAcademicYear ? 'Update Academic Year' : 'Create Academic Year'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingAcademicYear}
        onClose={() => {
          setDeletingAcademicYear(null);
          setDeleteErrorMessage(null);
        }}
        title="Delete Academic Year"
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Are you sure you want to delete this academic year?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You are about to delete &quot;{deletingAcademicYear?.name}&quot; ({deletingAcademicYear?.code}). This action cannot be undone.
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
                setDeletingAcademicYear(null);
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
                if (deletingAcademicYear) {
                  deleteMutation.mutate(deletingAcademicYear.id);
                }
              }}
              isLoading={deleteMutation.isPending}
            >
              Delete Academic Year
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
