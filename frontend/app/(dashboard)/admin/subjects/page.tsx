'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { subjectsApi } from '../../../../lib/api/subjects';
import { coursesApi } from '../../../../lib/api/courses';
import { facultyApi } from '../../../../lib/api/faculty';
import { Subject } from '../../../../types';
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
import { Library, Plus, Edit2, Trash2, UserCheck, AlertCircle, AlertTriangle, Filter } from 'lucide-react';

export default function AdminSubjectsPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Filter state
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('');
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState<string>('');

  // Form fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState(3);
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [facultyId, setFacultyId] = useState('');

  // Fetch courses for selector & filter
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getAll(),
  });

  // Fetch faculty for selector & filter
  const { data: facultyList = [] } = useQuery({
    queryKey: ['faculty'],
    queryFn: () => facultyApi.getAll(),
  });

  // Fetch subjects with optional filters
  const {
    data: subjects = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['subjects', selectedCourseFilter, selectedFacultyFilter],
    queryFn: () =>
      subjectsApi.getAll(
        selectedCourseFilter || undefined,
        selectedFacultyFilter || undefined,
      ),
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: subjectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      success('Subject created successfully!');
      closeModals();
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to create subject');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => subjectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      success('Subject updated successfully!');
      closeModals();
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to update subject');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => subjectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      success('Subject deleted successfully!');
      setDeletingSubject(null);
      setDeleteErrorMessage(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to delete subject';
      setDeleteErrorMessage(msg);
      toastError(msg);
    },
  });

  const closeModals = () => {
    setIsAddModalOpen(false);
    setEditingSubject(null);
    setName('');
    setCode('');
    setCredits(3);
    setDescription('');
    setFacultyId('');
    if (courses.length > 0) setCourseId(courses[0].id);
  };

  const openAddModal = () => {
    closeModals();
    const defaultCourse = selectedCourseFilter || (courses[0]?.id ?? '');
    setCourseId(defaultCourse);
    setIsAddModalOpen(true);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setCode(subject.code);
    setCredits(subject.credits || 3);
    setDescription('');
    setCourseId(subject.courseId);
    setFacultyId(subject.facultyId || '');
  };

  const openDeleteModal = (subject: Subject) => {
    setDeletingSubject(subject);
    setDeleteErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !courseId) return;

    const payload = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      credits: Number(credits),
      description: description.trim() || undefined,
      courseId,
      facultyId: facultyId ? facultyId : null,
    };

    if (editingSubject) {
      updateMutation.mutate({
        id: editingSubject.id,
        data: payload,
      });
    } else {
      createMutation.mutate(payload as any);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <Library className="w-6 h-6 text-amber-600" />
              Academic Subjects
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Curriculum units, credits distribution, and faculty teaching allocations.
            </p>
          </div>
          <Button
            size="sm"
            onClick={openAddModal}
            className="gap-1.5"
            disabled={courses.length === 0}
            title={courses.length === 0 ? 'Please create at least one course first' : 'Add Subject'}
          >
            <Plus className="w-4 h-4" /> Add Subject
          </Button>
        </div>

        {isError && (
          <ErrorAlert
            message={(error as any)?.response?.data?.message || 'Failed to load subjects'}
            onRetry={() => refetch()}
          />
        )}

        {/* Subjects Table Card */}
        <Card>
          <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">
                All Subjects ({subjects.length})
              </CardTitle>
              <CardDescription>Academic units across all degree courses</CardDescription>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {courses.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={selectedCourseFilter}
                    onChange={(e) => setSelectedCourseFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="">All Courses ({courses.length})</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {facultyList.length > 0 && (
                <select
                  value={selectedFacultyFilter}
                  onChange={(e) => setSelectedFacultyFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  <option value="">All Faculty ({facultyList.length})</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.user?.name || 'Faculty'} ({f.facultyId})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : subjects.length === 0 ? (
              <EmptyState
                icon={<Library className="w-8 h-8" />}
                title={
                  selectedCourseFilter || selectedFacultyFilter
                    ? 'No subjects match filters'
                    : 'No subjects registered'
                }
                description={
                  selectedCourseFilter || selectedFacultyFilter
                    ? 'Try selecting different filters or clear filters to view all subjects.'
                    : 'Create a curriculum subject and link it to a degree program.'
                }
                actionLabel={courses.length > 0 ? 'Create Subject' : undefined}
                onAction={courses.length > 0 ? openAddModal : undefined}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Assigned Faculty</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-bold text-amber-600 dark:text-amber-400">
                        {subject.code}
                      </TableCell>
                      <TableCell className="font-semibold">{subject.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {subject.credits} Credits
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mr-1 font-semibold">
                          {subject.course?.code}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">{subject.course?.name}</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {subject.faculty ? (
                          <span className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                            <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                            {subject.faculty.user?.name || 'Assigned'}
                            <span className="text-slate-400 text-[11px]">({subject.faculty.facultyId})</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">No Faculty Assigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(subject)}
                            className="p-1.5 h-auto text-slate-500 hover:text-indigo-600"
                            title="Edit Subject"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(subject)}
                            className="p-1.5 h-auto text-slate-500 hover:text-rose-600"
                            title="Delete Subject"
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

      {/* Add / Edit Subject Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingSubject}
        onClose={closeModals}
        title={editingSubject ? 'Edit Academic Subject' : 'Create Academic Subject'}
        description="Configure syllabus codes, credit values, and faculty teaching allocations."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Subject Name"
            placeholder="e.g. Data Structures & Algorithms"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Subject Code"
              placeholder="e.g. CS201"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Select
              label="Credit Units"
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
              options={[1, 2, 3, 4, 5, 6].map((c) => ({
                label: `${c} Credits`,
                value: c,
              }))}
            />
          </div>

          <Select
            label="Degree Course"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            options={courses.map((c) => ({
              label: `${c.name} (${c.code})`,
              value: c.id,
            }))}
            required
          />

          <Select
            label="Assigned Faculty (Optional)"
            value={facultyId}
            onChange={(e) => setFacultyId(e.target.value)}
            options={[
              { label: '— No Faculty Assigned —', value: '' },
              ...facultyList.map((f) => ({
                label: `${f.user?.name || 'Faculty'} (${f.facultyId} - ${f.designation})`,
                value: f.id,
              })),
            ]}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Syllabus coverage, learning objectives, and core concepts..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-100 dark:focus:ring-amber-950 focus:border-amber-500"
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
              {editingSubject ? 'Update Subject' : 'Create Subject'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal with Error Banner */}
      <Modal
        isOpen={!!deletingSubject}
        onClose={() => {
          setDeletingSubject(null);
          setDeleteErrorMessage(null);
        }}
        title="Delete Academic Subject"
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Are you sure you want to delete this subject?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You are about to delete &quot;{deletingSubject?.name}&quot; ({deletingSubject?.code}). This action cannot be undone.
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
                setDeletingSubject(null);
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
                if (deletingSubject) {
                  deleteMutation.mutate(deletingSubject.id);
                }
              }}
              isLoading={deleteMutation.isPending}
            >
              Delete Subject
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

