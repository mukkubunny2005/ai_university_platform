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
import { ConfirmModal } from '../../../../components/shared/ConfirmModal';
import { LoadingSpinner } from '../../../../components/shared/LoadingSpinner';
import { EmptyState } from '../../../../components/shared/EmptyState';
import { ErrorAlert } from '../../../../components/shared/ErrorAlert';
import { BookOpen, Plus, Edit2, Trash2 } from 'lucide-react';

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  // Fetch courses
  const {
    data: courses = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getAll(),
  });

  // Fetch departments for selector
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
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
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to delete course');
      setDeletingCourse(null);
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

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setName(course.name);
    setCode(course.code);
    setDescription(course.description || '');
    setDepartmentId(course.departmentId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !departmentId) return;

    if (editingCourse) {
      updateMutation.mutate({
        id: editingCourse.id,
        data: { name, code, description, departmentId },
      });
    } else {
      createMutation.mutate({ name, code, description, departmentId });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
            onClick={() => {
              closeModals();
              if (departments.length > 0) setDepartmentId(departments[0].id);
              setIsAddModalOpen(true);
            }}
            className="gap-1.5"
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Degree Programs ({courses.length})</CardTitle>
            <CardDescription>Undergraduate and postgraduate courses</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : courses.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="w-8 h-8" />}
                title="No courses registered"
                description="Begin by adding an academic degree program."
                actionLabel="Create Course"
                onAction={() => setIsAddModalOpen(true)}
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
                        <span className="font-semibold">{course.department?.code}</span> —{' '}
                        <span className="text-slate-500">{course.department?.name}</span>
                      </TableCell>
                      <TableCell>{course._count?.subjects || 0}</TableCell>
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
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingCourse(course)}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingCourse}
        onClose={() => setDeletingCourse(null)}
        onConfirm={() => {
          if (deletingCourse) {
            deleteMutation.mutate(deletingCourse.id);
          }
        }}
        title="Delete Degree Program"
        message={`Are you sure you want to delete "${deletingCourse?.name}" (${deletingCourse?.code})?`}
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
