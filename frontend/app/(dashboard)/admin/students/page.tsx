'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { studentsApi } from '../../../../lib/api/students';
import { departmentsApi } from '../../../../lib/api/departments';
import { Student } from '../../../../types';
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
import { GraduationCap, Plus, Edit2, Trash2, Mail } from 'lucide-react';

export default function AdminStudentsPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState(1);

  // Fetch students
  const {
    data: students = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsApi.getAll(),
  });

  // Fetch departments for dropdown
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: studentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      success('Student enrolled successfully!');
      closeModals();
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to enroll student');
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => studentsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      success('Student updated successfully!');
      closeModals();
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to update student');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      success('Student deleted successfully!');
      setDeletingStudent(null);
    },
    onError: (err: any) => {
      toastError(err.response?.data?.message || 'Failed to delete student');
      setDeletingStudent(null);
    },
  });

  const closeModals = () => {
    setIsAddModalOpen(false);
    setEditingStudent(null);
    setName('');
    setEmail('');
    setPassword('');
    setStudentId('');
    setSemester(1);
    if (departments.length > 0) setDepartmentId(departments[0].id);
  };

  const openEditModal = (stu: Student) => {
    setEditingStudent(stu);
    setName(stu.user?.name || '');
    setStudentId(stu.studentId);
    setDepartmentId(stu.departmentId);
    setSemester(stu.semester);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateMutation.mutate({
        id: editingStudent.id,
        data: {
          name,
          studentId,
          departmentId,
          semester: Number(semester),
        },
      });
    } else {
      if (!email || !password) return;
      createMutation.mutate({
        name,
        email,
        password,
        studentId,
        departmentId,
        semester: Number(semester),
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              Student Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enrolled students roster, registration identifiers, and departmental allocations.
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
            <Plus className="w-4 h-4" /> Enroll Student
          </Button>
        </div>

        {isError && (
          <ErrorAlert
            message={(error as any)?.response?.data?.message || 'Failed to load students'}
            onRetry={() => refetch()}
          />
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">All Registered Students ({students.length})</CardTitle>
            <CardDescription>Academic directory of enrolled university students</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : students.length === 0 ? (
              <EmptyState
                icon={<GraduationCap className="w-8 h-8" />}
                title="No students found"
                description="Enroll students directly or enable self-registration."
                actionLabel="Enroll Student"
                onAction={() => setIsAddModalOpen(true)}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((stu) => (
                    <TableRow key={stu.id}>
                      <TableCell className="font-bold text-blue-600 dark:text-blue-400">
                        {stu.studentId}
                      </TableCell>
                      <TableCell className="font-semibold">{stu.user?.name}</TableCell>
                      <TableCell className="text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {stu.user?.email}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {stu.department?.code} — {stu.department?.name}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          Semester {stu.semester}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(stu)}
                            className="p-1.5 h-auto text-slate-500 hover:text-indigo-600"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingStudent(stu)}
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

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingStudent}
        onClose={closeModals}
        title={editingStudent ? 'Edit Student Record' : 'Enroll New Student'}
        description="Configure student profile, identification number, and current semester."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Marie Curie"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {!editingStudent && (
            <>
              <Input
                label="Institutional Email"
                type="email"
                placeholder="m.curie@aiuniversity.edu"
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
              label="Student ID"
              placeholder="e.g. STU-2026-042"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
            <Select
              label="Semester"
              value={semester}
              onChange={(e) => setSemester(Number(e.target.value))}
              options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({
                label: `Semester ${s}`,
                value: s,
              }))}
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
              {editingStudent ? 'Update Student' : 'Enroll Student'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={() => {
          if (deletingStudent) {
            deleteMutation.mutate(deletingStudent.id);
          }
        }}
        title="Delete Student Record"
        message={`Are you sure you want to delete the student account for "${deletingStudent?.user?.name}" (${deletingStudent?.studentId})?`}
        isLoading={deleteMutation.isPending}
      />
    </DashboardLayout>
  );
}
