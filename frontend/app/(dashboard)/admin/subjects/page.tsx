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
import { ConfirmModal } from '../../../../components/shared/ConfirmModal';
import { LoadingSpinner } from '../../../../components/shared/LoadingSpinner';
import { EmptyState } from '../../../../components/shared/EmptyState';
import { ErrorAlert } from '../../../../components/shared/ErrorAlert';
import { Library, Plus, Edit2, Trash2, UserCheck } from 'lucide-react';

export default function AdminSubjectsPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState(4);
  const [courseId, setCourseId] = useState('');
  const [facultyId, setFacultyId] = useState('');

  // Fetch subjects
  const {
    data: subjects = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.getAll(),
  });

  // Fetch courses for selector
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getAll(),
  });

  // Fetch faculty for selector
  const { data: facultyList = [] } = useQuery({
    queryKey: ['faculty'],
    queryFn: () => facultyApi.getAll(),
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
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to delete subject');
      setDeletingSubject(null);
    },
  });

  const closeModals = () => {
    setIsAddModalOpen(false);
    setEditingSubject(null);
    setName('');
    setCode('');
    setCredits(4);
    setFacultyId('');
    if (courses.length > 0) setCourseId(courses[0].id);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setCode(subject.code);
    setCredits(subject.credits);
    setCourseId(subject.courseId);
    setFacultyId(subject.facultyId || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !courseId) return;

    const payload = {
      name,
      code,
      credits: Number(credits),
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
            onClick={() => {
              closeModals();
              if (courses.length > 0) setCourseId(courses[0].id);
              setIsAddModalOpen(true);
            }}
            className="gap-1.5"
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Subjects ({subjects.length})</CardTitle>
            <CardDescription>Academic units across all degree courses</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : subjects.length === 0 ? (
              <EmptyState
                icon={<Library className="w-8 h-8" />}
                title="No subjects registered"
                description="Create a curriculum subject and link it to a degree program."
                actionLabel="Create Subject"
                onAction={() => setIsAddModalOpen(true)}
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
                        {subject.course?.code} — {subject.course?.name}
                      </TableCell>
                      <TableCell className="text-xs">
                        {subject.faculty ? (
                          <span className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                            <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                            {subject.faculty.user?.name || 'Assigned'}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(subject)}
                            className="p-1.5 h-auto text-slate-500 hover:text-indigo-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingSubject(subject)}
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
              { label: '— Unassigned / TBA —', value: '' },
              ...facultyList.map((f) => ({
                label: `${f.user?.name || 'Faculty'} (${f.facultyId} - ${f.designation})`,
                value: f.id,
              })),
            ]}
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
              {editingSubject ? 'Update Subject' : 'Create Subject'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingSubject}
        onClose={() => setDeletingSubject(null)}
        onConfirm={() => {
          if (deletingSubject) {
            deleteMutation.mutate(deletingSubject.id);
          }
        }}
        title="Delete Subject"
        message={`Are you sure you want to delete "${deletingSubject?.name}" (${deletingSubject?.code})?`}
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
