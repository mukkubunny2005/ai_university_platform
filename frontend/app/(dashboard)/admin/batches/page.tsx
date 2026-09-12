'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { batchesApi } from '../../../../lib/api/batches';
import { departmentsApi } from '../../../../lib/api/departments';
import { coursesApi } from '../../../../lib/api/courses';
import { Batch, Department, Course } from '../../../../types';
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
  CalendarRange,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Filter,
  AlertCircle,
  AlertTriangle,
  Building2,
  BookOpen,
  Users,
  Layers,
} from 'lucide-react';

export default function AdminBatchesPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [viewingBatch, setViewingBatch] = useState<Batch | null>(null);
  const [deletingBatch, setDeletingBatch] = useState<Batch | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Filters state
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('');

  // Modal form fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [startYear, setStartYear] = useState<number | ''>(new Date().getFullYear());
  const [endYear, setEndYear] = useState<number | ''>(new Date().getFullYear() + 4);
  const [departmentId, setDepartmentId] = useState('');
  const [courseId, setCourseId] = useState('');

  // Fetch departments for dropdowns & filters
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  // Fetch courses for the header filter based on selected department
  const { data: filterCourses = [], isLoading: isFilterCoursesLoading } = useQuery({
    queryKey: ['courses', 'filter', selectedDepartmentFilter],
    queryFn: () => coursesApi.getAll(selectedDepartmentFilter || undefined),
  });

  // Fetch courses for the modal based on modal's selected department
  const { data: modalCourses = [], isLoading: isModalCoursesLoading } = useQuery({
    queryKey: ['courses', 'modal', departmentId],
    queryFn: () => coursesApi.getAll(departmentId),
    enabled: !!departmentId,
  });

  // Fetch batches with department and course filters
  const {
    data: batches = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['batches', selectedDepartmentFilter, selectedCourseFilter],
    queryFn: () => batchesApi.getAll(selectedDepartmentFilter || undefined, selectedCourseFilter || undefined),
  });

  // When opening add modal, reset form
  const openAddModal = () => {
    closeModals();
    const initialDept = selectedDepartmentFilter || (departments[0]?.id ?? '');
    const currentYear = new Date().getFullYear();
    setName('');
    setCode('');
    setStartYear(currentYear);
    setEndYear(currentYear + 4);
    setDepartmentId(initialDept);
    setCourseId('');
    setIsAddModalOpen(true);
  };

  // Open edit modal and populate values
  const openEditModal = (batch: Batch) => {
    closeModals();
    setEditingBatch(batch);
    setName(batch.name);
    setCode(batch.code);
    setStartYear(batch.startYear);
    setEndYear(batch.endYear);
    setDepartmentId(batch.departmentId);
    setCourseId(batch.courseId);
  };

  const openDeleteModal = (batch: Batch) => {
    setDeletingBatch(batch);
    setDeleteErrorMessage(null);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setEditingBatch(null);
    setViewingBatch(null);
    setName('');
    setCode('');
    setStartYear(new Date().getFullYear());
    setEndYear(new Date().getFullYear() + 4);
    setDepartmentId('');
    setCourseId('');
  };

  // Handle department change in filter
  const handleDepartmentFilterChange = (newDeptId: string) => {
    setSelectedDepartmentFilter(newDeptId);
    setSelectedCourseFilter('');
  };

  // Handle department change in create/edit modal
  const handleModalDepartmentChange = (newDeptId: string) => {
    setDepartmentId(newDeptId);
    setCourseId('');
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: batchesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      success('Batch created successfully!');
      closeModals();
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to create batch');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => batchesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      success('Batch updated successfully!');
      closeModals();
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to update batch');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => batchesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      success('Batch deleted successfully!');
      setDeletingBatch(null);
      setDeleteErrorMessage(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to delete batch';
      setDeleteErrorMessage(msg);
      toastError(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !code.trim() || !departmentId || !courseId) {
      toastError('Please fill in all required fields');
      return;
    }

    const sYear = Number(startYear);
    const eYear = Number(endYear);

    if (isNaN(sYear) || isNaN(eYear)) {
      toastError('Start Year and End Year must be valid numbers');
      return;
    }

    if (eYear <= sYear) {
      toastError('End year must be greater than start year');
      return;
    }

    if (editingBatch) {
      updateMutation.mutate({
        id: editingBatch.id,
        data: {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          startYear: sYear,
          endYear: eYear,
          departmentId,
          courseId,
        },
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        startYear: sYear,
        endYear: eYear,
        departmentId,
        courseId,
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
              <CalendarRange className="w-6 h-6 text-indigo-600" />
              Batch Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Academic cohorts, program durations, student intake, and section allocations.
            </p>
          </div>
          <Button
            size="sm"
            onClick={openAddModal}
            className="gap-1.5"
            disabled={departments.length === 0}
            title={departments.length === 0 ? 'Please create at least one department first' : 'Add Batch'}
          >
            <Plus className="w-4 h-4" /> Add Batch
          </Button>
        </div>

        {isError && (
          <ErrorAlert
            message={(error as any)?.response?.data?.message || 'Failed to load batches'}
            onRetry={() => refetch()}
          />
        )}

        {/* Batches Table Card */}
        <Card>
          <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">
                All Batches ({batches.length})
              </CardTitle>
              <CardDescription>Degree cohorts and graduation timelines</CardDescription>
            </div>

            {/* Department and Course Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {departments.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedDepartmentFilter}
                    onChange={(e) => handleDepartmentFilterChange(e.target.value)}
                    aria-label="Filter by department"
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
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

              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                disabled={isFilterCoursesLoading}
                aria-label="Filter by course"
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium disabled:opacity-50"
              >
                <option value="">
                  {isFilterCoursesLoading ? 'Loading courses...' : `All Courses (${filterCourses.length})`}
                </option>
                {filterCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : batches.length === 0 ? (
              <EmptyState
                icon={<CalendarRange className="w-8 h-8" />}
                title={
                  selectedDepartmentFilter || selectedCourseFilter
                    ? 'No batches match the selected filters'
                    : 'No batches found'
                }
                description={
                  selectedDepartmentFilter || selectedCourseFilter
                    ? 'Try adjusting your department or course filter, or create a new batch.'
                    : 'Create academic cohorts and batches to organize students and classes.'
                }
                actionLabel={departments.length > 0 ? 'Add Batch' : undefined}
                onAction={departments.length > 0 ? openAddModal : undefined}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Start Year</TableHead>
                    <TableHead>End Year</TableHead>
                    <TableHead>Students count</TableHead>
                    <TableHead>Sections count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-bold text-indigo-600 dark:text-indigo-400">
                        {batch.code}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-white">
                        {batch.name}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mr-1 font-semibold">
                          {batch.department?.code}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {batch.department?.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-slate-900 dark:text-white mr-1">
                          {batch.course?.code}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          ({batch.course?.name})
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {batch.startYear}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {batch.endYear}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {batch._count?.students ?? 0} Students
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          {batch._count?.sections ?? 0} Sections
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingBatch(batch)}
                            className="p-1.5 h-auto text-slate-500 hover:text-indigo-600"
                            title="View Batch Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(batch)}
                            className="p-1.5 h-auto text-slate-500 hover:text-indigo-600"
                            title="Edit Batch"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(batch)}
                            className="p-1.5 h-auto text-slate-500 hover:text-rose-600"
                            title="Delete Batch"
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

      {/* Create / Edit Batch Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingBatch}
        onClose={closeModals}
        title={editingBatch ? 'Edit Batch Record' : 'Create New Batch'}
        description="Configure academic intake batch, graduation period, and associated course curriculum."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Batch Name"
            placeholder="e.g. Batch of 2024-2028"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Batch Code"
            placeholder="e.g. B2024-CSE"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Year"
              type="number"
              min="1900"
              max="2100"
              placeholder="e.g. 2024"
              value={startYear}
              onChange={(e) => setStartYear(e.target.value ? Number(e.target.value) : '')}
              required
            />
            <Input
              label="End Year"
              type="number"
              min={startYear ? Number(startYear) + 1 : '1900'}
              max="2100"
              placeholder="e.g. 2028"
              value={endYear}
              onChange={(e) => setEndYear(e.target.value ? Number(e.target.value) : '')}
              required
            />
          </div>

          <Select
            label="Department"
            value={departmentId}
            onChange={(e) => handleModalDepartmentChange(e.target.value)}
            options={departments.map((d) => ({
              label: `${d.name} (${d.code})`,
              value: d.id,
            }))}
            placeholder={departments.length === 0 ? 'No departments available' : 'Select Department'}
            required
          />

          <Select
            label="Course"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            options={modalCourses.map((c) => ({
              label: `${c.name} (${c.code})`,
              value: c.id,
            }))}
            placeholder={
              !departmentId
                ? 'Select a department first'
                : isModalCoursesLoading
                ? 'Loading courses...'
                : modalCourses.length === 0
                ? 'No courses available for this department'
                : 'Select Course'
            }
            disabled={!departmentId || isModalCoursesLoading || modalCourses.length === 0}
            required
          />

          {departmentId && !isModalCoursesLoading && modalCourses.length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              This department has no courses. Please create a course under this department first.
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={closeModals}>
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
              disabled={!departmentId || !courseId}
            >
              {editingBatch ? 'Update Batch' : 'Create Batch'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Batch Details View Modal */}
      <Modal
        isOpen={!!viewingBatch}
        onClose={() => setViewingBatch(null)}
        title="Batch Profile"
        description="Comprehensive overview of academic cohort timeline and enrolled capacity"
        maxWidth="md"
      >
        {viewingBatch && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5">
                <CalendarRange className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {viewingBatch.name}
                </h3>
                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  Code: {viewingBatch.code} • Duration: {viewingBatch.startYear} – {viewingBatch.endYear}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Department</span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {viewingBatch.department?.name} ({viewingBatch.department?.code})
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Course / Program</span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {viewingBatch.course?.name} ({viewingBatch.course?.code})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Enrolled Students:</span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {viewingBatch._count?.students ?? 0}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Active Sections:</span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {viewingBatch._count?.sections ?? 0}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingBatch(null)}
              >
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal with Error Banner */}
      <Modal
        isOpen={!!deletingBatch}
        onClose={() => {
          setDeletingBatch(null);
          setDeleteErrorMessage(null);
        }}
        title="Delete Batch"
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Are you sure you want to delete this batch?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You are about to delete batch &quot;{deletingBatch?.name}&quot; ({deletingBatch?.code}). This action cannot be undone.
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
                setDeletingBatch(null);
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
                if (deletingBatch) {
                  deleteMutation.mutate(deletingBatch.id);
                }
              }}
              isLoading={deleteMutation.isPending}
            >
              Delete Batch
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
