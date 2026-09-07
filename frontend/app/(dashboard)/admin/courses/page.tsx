'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { coursesApi } from '../../../../lib/api/courses';
import { departmentsApi } from '../../../../lib/api/departments';
import { Course } from '../../../../types';
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
import { BookOpen, Plus, Edit2, Trash2, AlertCircle, AlertTriangle, Filter } from 'lucide-react';

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Filter state
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('');

  // Form fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  // Fetch departments for selector & filter
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  // Fetch courses with optional department filter
  const {
    data: courses = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['courses', selectedDepartmentFilter],
    queryFn: () => coursesApi.getAll(selectedDepartmentFilter || undefined),
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: coursesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      success('Course created successfully!');
      closeModals();
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to create course');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => coursesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      success('Course updated successfully!');
      closeModals();
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to update course');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => coursesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      success('Course deleted successfully!');
      setDeletingCourse(null);
      setDeleteErrorMessage(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to delete course';
      setDeleteErrorMessage(msg);
      toastError(msg);
    },
  });

  const closeModals = () => {
    setIsAddModalOpen(false);
    setEditingCourse(null);
    setName('');
    setCode('');
    setDescription('');
    if (departments.length > 0) setDepartmentId(departments[0].id);
  };

  const openAddModal = () => {
    closeModals();
    const defaultDept = selectedDepartmentFilter || (departments[0]?.id ?? '');
    setDepartmentId(defaultDept);
    setIsAddModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setName(course.name);
    setCode(course.code);
    setDescription(course.description || '');
    setDepartmentId(course.departmentId);
  };

  const openDeleteModal = (course: Course) => {
    setDeletingCourse(course);
    setDeleteErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !departmentId) return;

    if (editingCourse) {
      updateMutation.mutate({
        id: editingCourse.id,
        data: { name: name.trim(), code: code.trim().toUpperCase(), description: description.trim(), departmentId },
      });
    } else {
      createMutation.mutate({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        departmentId,
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
              <BookOpen className="w-6 h-6 text-emerald-600" />
              Courses & Degree Programs
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Configure degree programs, course curriculums, and departmental affiliations.
            </p>
          </div>
          <Button
            size="sm"
            onClick={openAddModal}
            className="gap-1.5"
            disabled={departments.length === 0}
            title={departments.length === 0 ? 'Please create at least one department first' : 'Add Course'}
          >
            <Plus className="w-4 h-4" /> Add Course
          </Button>
        </div>

        {isError && (
          <ErrorAlert
            message={(error as any)?.response?.data?.message || 'Failed to load courses'}
            onRetry={() => refetch()}
          />
        )}

        {/* Courses Table Card */}
        <Card>
          <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">
                All Degree Programs ({courses.length})
              </CardTitle>
              <CardDescription>Undergraduate and postgraduate academic courses</CardDescription>
            </div>
            {/* Department Filter */}
            {departments.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedDepartmentFilter}
                  onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
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
            ) : courses.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="w-8 h-8" />}
                title={selectedDepartmentFilter ? 'No courses in this department' : 'No courses registered'}
                description={
                  selectedDepartmentFilter
                    ? 'Try selecting a different department filter or add a course to this department.'
                    : 'Begin by adding an academic degree program.'
                }
                actionLabel={departments.length > 0 ? 'Create Course' : undefined}
                onAction={departments.length > 0 ? openAddModal : undefined}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">
                        {course.code}
                      </TableCell>
                      <TableCell className="font-semibold">{course.name}</TableCell>
                      <TableCell className="text-xs">
                        <span className="font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {course.department?.code}
                        </span>{' '}
                        <span className="text-slate-500 ml-1">{course.department?.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          {course._count?.subjects || 0} Subjects
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                        {course.description || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(course)}
                            className="p-1.5 h-auto text-slate-500 hover:text-indigo-600"
                            title="Edit Course"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(course)}
                            className="p-1.5 h-auto text-slate-500 hover:text-rose-600"
                            title="Delete Course"
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

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingCourse}
        onClose={closeModals}
        title={editingCourse ? 'Edit Degree Program' : 'Create Degree Program'}
        description="Specify course naming, code, and parent department."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Course Name"
            placeholder="e.g. B.Tech in Computer Science and Engineering"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Course Code"
            placeholder="e.g. BTECH-CSE"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
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
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Program objectives, syllabus coverage, and learning outcomes..."
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
              {editingCourse ? 'Update Course' : 'Create Course'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal with 409 Error Handling */}
      <Modal
        isOpen={!!deletingCourse}
        onClose={() => {
          setDeletingCourse(null);
          setDeleteErrorMessage(null);
        }}
        title="Delete Degree Program"
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Are you sure you want to delete this course?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You are about to delete &quot;{deletingCourse?.name}&quot; ({deletingCourse?.code}). This action cannot be undone.
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
                setDeletingCourse(null);
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
                if (deletingCourse) {
                  deleteMutation.mutate(deletingCourse.id);
                }
              }}
              isLoading={deleteMutation.isPending}
            >
              Delete Course
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

