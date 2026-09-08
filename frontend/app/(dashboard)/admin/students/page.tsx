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
import { LoadingSpinner } from '../../../../components/shared/LoadingSpinner';
import { EmptyState } from '../../../../components/shared/EmptyState';
import { ErrorAlert } from '../../../../components/shared/ErrorAlert';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Filter,
  Eye,
  Building2,
  Calendar,
  AlertCircle,
  User,
} from 'lucide-react';

export default function AdminStudentsPage() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState(1);

  // Fetch departments for dropdown & filters
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  // Fetch students (filtered if selected)
  const {
    data: students = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['students', selectedDepartmentFilter],
    queryFn: () => studentsApi.getAll(selectedDepartmentFilter || undefined),
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: studentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
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
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      success('Student record updated successfully!');
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
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      success('Student deleted successfully!');
      setDeletingStudent(null);
      setDeleteErrorMessage(null);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to delete student';
      setDeleteErrorMessage(msg);
      toastError(msg);
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

  const openAddModal = () => {
    closeModals();
    const defaultDept = selectedDepartmentFilter || (departments[0]?.id ?? '');
    setDepartmentId(defaultDept);
    setIsAddModalOpen(true);
  };

  const openEditModal = (stu: Student) => {
    setEditingStudent(stu);
    setName(stu.user?.name || '');
    setEmail(stu.user?.email || '');
    setStudentId(stu.studentId);
    setDepartmentId(stu.departmentId);
    setSemester(stu.semester);
  };

  const openDeleteModal = (stu: Student) => {
    setDeletingStudent(stu);
    setDeleteErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      if (!name.trim() || !studentId.trim() || !departmentId) return;
      updateMutation.mutate({
        id: editingStudent.id,
        data: {
          name: name.trim(),
          email: email.trim() || undefined,
          studentId: studentId.trim().toUpperCase(),
          departmentId,
          semester: Number(semester),
        },
      });
    } else {
      if (!name.trim() || !email.trim() || !password || !studentId.trim() || !departmentId) return;
      createMutation.mutate({
        name: name.trim(),
        email: email.trim(),
        password,
        studentId: studentId.trim().toUpperCase(),
        departmentId,
        semester: Number(semester),
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Bar */}
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
          <Button size="sm" onClick={openAddModal} className="gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" /> Enroll Student
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Filter className="w-4 h-4 text-blue-600" />
            Filter by Department:
          </div>
          <div className="w-64">
            <Select
              value={selectedDepartmentFilter}
              onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
              options={[
                { label: 'All Departments', value: '' },
                ...departments.map((d) => ({
                  label: `${d.name} (${d.code})`,
                  value: d.id,
                })),
              ]}
            />
          </div>
          {selectedDepartmentFilter && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDepartmentFilter('')}
              className="text-xs"
            >
              Clear Filter
            </Button>
          )}
        </div>

        {isError && (
          <ErrorAlert
            message={(error as any)?.response?.data?.message || 'Failed to load students'}
            onRetry={() => refetch()}
          />
        )}

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  All Registered Students ({students.length})
                </CardTitle>
                <CardDescription>Academic directory of enrolled university students</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : students.length === 0 ? (
              <EmptyState
                icon={<GraduationCap className="w-8 h-8 text-blue-500" />}
                title="No students found"
                description={
                  selectedDepartmentFilter
                    ? 'No students enrolled in the selected department.'
                    : 'Enroll students directly or enable self-registration.'
                }
                actionLabel="Enroll Student"
                onAction={openAddModal}
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
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono text-xs">
                          {stu.studentId}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-white">
                        {stu.user?.name}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {stu.user?.email}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        <span className="font-bold text-slate-700 dark:text-slate-200">
                          {stu.department?.code}
                        </span>{' '}
                        <span className="text-slate-500">— {stu.department?.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                          Semester {stu.semester}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View Student Details"
                            onClick={() => setViewingStudent(stu)}
                            className="p-1.5 h-auto text-slate-500 hover:text-blue-600"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit Student"
                            onClick={() => openEditModal(stu)}
                            className="p-1.5 h-auto text-slate-500 hover:text-indigo-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete Student"
                            onClick={() => openDeleteModal(stu)}
                            className="p-1.5 h-auto text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
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
        description="Configure student profile, institutional credentials, and departmental allocation."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Johnathan Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Institutional Email"
            type="email"
            placeholder="j.doe@student.aiuniversity.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {!editingStudent && (
            <Input
              label="Default Password (min 6 characters)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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

      {/* View Student Details Modal */}
      {viewingStudent && (
        <Modal
          isOpen={!!viewingStudent}
          onClose={() => setViewingStudent(null)}
          title="Student Record Details"
          description="Institutional profile, enrolled department, and academic progress."
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    {viewingStudent.user?.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {viewingStudent.user?.email}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold">
                  {viewingStudent.studentId}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-slate-400 block">Department</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {viewingStudent.department?.name} ({viewingStudent.department?.code})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Academic Standing</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Semester {viewingStudent.semester}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setViewingStudent(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal with Error Banner */}
      {deletingStudent && (
        <Modal
          isOpen={!!deletingStudent}
          onClose={() => {
            setDeletingStudent(null);
            setDeleteErrorMessage(null);
          }}
          title="Delete Student Record"
          description="Are you sure you want to permanently delete this student record? This action cannot be undone."
        >
          <div className="space-y-4">
            {deleteErrorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Unable to Delete</p>
                  <p className="mt-0.5">{deleteErrorMessage}</p>
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p>
                <span className="font-semibold">Student:</span> {deletingStudent.user?.name}
              </p>
              <p>
                <span className="font-semibold">Student ID:</span> {deletingStudent.studentId}
              </p>
              <p>
                <span className="font-semibold">Department:</span> {deletingStudent.department?.name}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeletingStudent(null);
                  setDeleteErrorMessage(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={deleteMutation.isPending}
                onClick={() => {
                  if (deletingStudent) {
                    deleteMutation.mutate(deletingStudent.id);
                  }
                }}
              >
                Delete Student
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
