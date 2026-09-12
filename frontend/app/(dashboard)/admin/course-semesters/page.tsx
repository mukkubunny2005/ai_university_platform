'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import { courseSemestersApi } from '../../../../lib/api/courseSemesters';
import { coursesApi } from '../../../../lib/api/courses';
import { subjectsApi } from '../../../../lib/api/subjects';
import { academicYearsApi } from '../../../../lib/api/academicYears';
import { CourseSemester, Course, Subject, AcademicYear } from '../../../../types';
import { useToast } from '../../../../context/ToastContext';
import { Button } from '../../../../components/ui/Button';
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
  AlertCircle,
  AlertTriangle,
  Filter,
  BookOpen,
  GraduationCap,
  Calendar,
} from 'lucide-react';

export default function CourseSemestersPage() {
  const { success, error: toastError } = useToast();

  // Data lists
  const [courseSemesters, setCourseSemesters] = useState<CourseSemester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  // Page state
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters at top
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('');
  const [selectedAcademicYearFilter, setSelectedAcademicYearFilter] = useState<string>('');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>('');

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CourseSemester | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deletingItem, setDeletingItem] = useState<CourseSemester | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Modal form fields
  const [courseId, setCourseId] = useState('');
  const [semesterNumber, setSemesterNumber] = useState<number>(1);
  const [subjectId, setSubjectId] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');

  // Subjects available for selected course in modal
  const [modalSubjects, setModalSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  // Load dropdown options (Courses and Academic Years) on mount
  useEffect(() => {
    let isMounted = true;
    const loadInitialOptions = async () => {
      try {
        const [loadedCourses, loadedAcademicYears] = await Promise.all([
          coursesApi.getAll(),
          academicYearsApi.getAll(),
        ]);
        if (isMounted) {
          setCourses(loadedCourses || []);
          setAcademicYears(loadedAcademicYears || []);
        }
      } catch (err: any) {
        console.error('Failed to load courses or academic years for filters', err);
      }
    };

    loadInitialOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Course Semester mappings with active filters
  const fetchCourseSemesters = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const filters = {
        courseId: selectedCourseFilter || undefined,
        academicYearId: selectedAcademicYearFilter || undefined,
        semesterNumber: selectedSemesterFilter ? Number(selectedSemesterFilter) : undefined,
      };
      const data = await courseSemestersApi.getAll(filters);
      setCourseSemesters(data || []);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load course semester mappings';
      setFetchError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourseFilter, selectedAcademicYearFilter, selectedSemesterFilter]);

  useEffect(() => {
    fetchCourseSemesters();
  }, [fetchCourseSemesters]);

  // Fetch subjects for a specific course
  const fetchSubjectsForCourse = useCallback(async (selectedCourseId: string) => {
    if (!selectedCourseId) {
      setModalSubjects([]);
      return;
    }
    setIsLoadingSubjects(true);
    try {
      const subjects = await subjectsApi.getAll(selectedCourseId);
      setModalSubjects(subjects || []);
    } catch (err: any) {
      console.error('Failed to load subjects for course', err);
      setModalSubjects([]);
    } finally {
      setIsLoadingSubjects(false);
    }
  }, []);

  // Handle courseId change in modal
  const handleModalCourseChange = (newCourseId: string) => {
    setCourseId(newCourseId);
    setSubjectId(''); // Reset subject selection when course changes
    fetchSubjectsForCourse(newCourseId);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setEditingItem(null);
    setFormError(null);
    setCourseId('');
    setSemesterNumber(1);
    setSubjectId('');
    setAcademicYearId('');
    setModalSubjects([]);
  };

  const openAddModal = () => {
    closeModals();
    const defaultCourse = selectedCourseFilter || (courses[0]?.id ?? '');
    const defaultAcademicYear =
      selectedAcademicYearFilter ||
      (academicYears.find((ay) => ay.isActive)?.id ?? academicYears[0]?.id ?? '');
    const defaultSemester = selectedSemesterFilter ? Number(selectedSemesterFilter) : 1;

    setCourseId(defaultCourse);
    setAcademicYearId(defaultAcademicYear);
    setSemesterNumber(defaultSemester);
    setSubjectId('');
    setIsAddModalOpen(true);

    if (defaultCourse) {
      fetchSubjectsForCourse(defaultCourse);
    }
  };

  const openEditModal = (item: CourseSemester) => {
    closeModals();
    setEditingItem(item);
    setCourseId(item.courseId);
    setAcademicYearId(item.academicYearId);
    setSemesterNumber(item.semesterNumber);
    setSubjectId(item.subjectId);

    // If current item has subject details, pre-populate to avoid select flicker
    if (item.subject) {
      setModalSubjects([item.subject]);
    }

    fetchSubjectsForCourse(item.courseId);
  };

  const openDeleteModal = (item: CourseSemester) => {
    setDeletingItem(item);
    setDeleteErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!courseId || !subjectId || !academicYearId || !semesterNumber) {
      setFormError('Please select all required fields (Course, Subject, Semester, Academic Year).');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      courseId,
      semesterNumber: Number(semesterNumber),
      subjectId,
      academicYearId,
    };

    try {
      if (editingItem) {
        await courseSemestersApi.update(editingItem.id, payload);
        success('Course-semester mapping updated successfully!');
      } else {
        await courseSemestersApi.create(payload);
        success('Course-semester mapping created successfully!');
      }
      closeModals();
      await fetchCourseSemesters();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (editingItem ? 'Failed to update mapping' : 'Failed to create mapping');
      setFormError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    setIsDeleting(true);
    setDeleteErrorMessage(null);

    try {
      await courseSemestersApi.delete(deletingItem.id);
      success('Course-semester mapping deleted successfully!');
      setDeletingItem(null);
      await fetchCourseSemesters();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete course-semester mapping';
      setDeleteErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSelectedCourseFilter('');
    setSelectedAcademicYearFilter('');
    setSelectedSemesterFilter('');
  };

  const hasActiveFilters = Boolean(
    selectedCourseFilter || selectedAcademicYearFilter || selectedSemesterFilter,
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <CalendarRange className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Course-Semester Mapping
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Curriculum planning, semester schedule distribution, and subject allocations per academic year.
            </p>
          </div>
          <Button
            size="sm"
            onClick={openAddModal}
            className="gap-1.5"
            disabled={courses.length === 0 || academicYears.length === 0}
            title={
              courses.length === 0
                ? 'Please create at least one course first'
                : academicYears.length === 0
                ? 'Please create at least one academic year first'
                : 'Add Mapping'
            }
          >
            <Plus className="w-4 h-4" /> Add Mapping
          </Button>
        </div>

        {/* Fetch Error Alert */}
        {fetchError && (
          <ErrorAlert
            message={fetchError}
            onRetry={fetchCourseSemesters}
          />
        )}

        {/* Table Card with Filters */}
        <Card>
          <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">
                All Mappings ({courseSemesters.length})
              </CardTitle>
              <CardDescription>
                Allocated curriculum subjects across course semesters and academic cycles
              </CardDescription>
            </div>

            {/* Filters at top */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                {/* Course Select Filter */}
                <select
                  aria-label="Filter by course"
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="">All Courses ({courses.length})</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Year Select Filter */}
              <select
                aria-label="Filter by academic year"
                value={selectedAcademicYearFilter}
                onChange={(e) => setSelectedAcademicYearFilter(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="">All Academic Years ({academicYears.length})</option>
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>
                    {ay.name} ({ay.code}){ay.isActive ? ' - Active' : ''}
                  </option>
                ))}
              </select>

              {/* Semester Number Select Filter (1-8) */}
              <select
                aria-label="Filter by semester"
                value={selectedSemesterFilter}
                onChange={(e) => setSelectedSemesterFilter(e.target.value)}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="">All Semesters (1-8)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    Semester {num}
                  </option>
                ))}
              </select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 h-8 px-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : courseSemesters.length === 0 ? (
              <EmptyState
                icon={<CalendarRange className="w-8 h-8" />}
                title={
                  hasActiveFilters
                    ? 'No mappings match filters'
                    : 'No course-semester mappings created yet'
                }
                description={
                  hasActiveFilters
                    ? 'Try selecting different filter options or reset filters to view all mappings.'
                    : 'Map curriculum subjects to degree programs and semesters for specific academic years.'
                }
                actionLabel={
                  hasActiveFilters
                    ? 'Clear Filters'
                    : courses.length > 0 && academicYears.length > 0
                    ? 'Create Mapping'
                    : undefined
                }
                onAction={
                  hasActiveFilters
                    ? clearFilters
                    : courses.length > 0 && academicYears.length > 0
                    ? openAddModal
                    : undefined
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courseSemesters.map((item) => (
                    <TableRow key={item.id}>
                      {/* Course */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {item.course?.code || '—'}
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100">
                            {item.course?.name || 'Unknown Course'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Subject */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              {item.subject?.code || '—'}
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {item.subject?.name || 'Unknown Subject'}
                            </span>
                          </div>
                          {item.subject?.credits !== undefined && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {item.subject.credits} Credits
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Semester */}
                      <TableCell>
                        <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/60">
                          Semester {item.semesterNumber}
                        </span>
                      </TableCell>

                      {/* Academic Year */}
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {item.academicYear?.name || item.academicYear?.code || '—'}
                          </span>
                          {item.academicYear?.isActive && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Active
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(item)}
                            className="p-1.5 h-auto text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                            title="Edit Mapping"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(item)}
                            className="p-1.5 h-auto text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Delete Mapping"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingItem}
        onClose={closeModals}
        title={editingItem ? 'Edit Course-Semester Mapping' : 'Create Course-Semester Mapping'}
        description="Configure syllabus curriculum offerings for a degree program, semester, and academic year."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{formError}</p>
            </div>
          )}

          {/* Course Select */}
          <Select
            label="Degree Course"
            value={courseId}
            onChange={(e) => handleModalCourseChange(e.target.value)}
            options={courses.map((c) => ({
              label: `${c.name} (${c.code})`,
              value: c.id,
            }))}
            placeholder="Select a Course"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Semester Number Select (1-8) */}
            <Select
              label="Semester Number"
              value={semesterNumber}
              onChange={(e) => setSemesterNumber(Number(e.target.value))}
              options={[1, 2, 3, 4, 5, 6, 7, 8].map((num) => ({
                label: `Semester ${num}`,
                value: num,
              }))}
              required
            />

            {/* Academic Year Select */}
            <Select
              label="Academic Year"
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              options={academicYears.map((ay) => ({
                label: `${ay.name} (${ay.code})${ay.isActive ? ' - Active' : ''}`,
                value: ay.id,
              }))}
              placeholder="Select Academic Year"
              required
            />
          </div>

          {/* Subject Select (loads subjects for selected course) */}
          <div className="space-y-1.5">
            <Select
              label="Subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              options={modalSubjects.map((s) => ({
                label: `${s.code} — ${s.name} (${s.credits} Credits)`,
                value: s.id,
              }))}
              placeholder={
                isLoadingSubjects
                  ? 'Loading subjects for course...'
                  : modalSubjects.length === 0
                  ? courseId
                    ? 'No subjects found for this course'
                    : 'Select a course first'
                  : 'Select a Subject'
              }
              disabled={isLoadingSubjects || !courseId || modalSubjects.length === 0}
              required
            />
            {courseId && !isLoadingSubjects && modalSubjects.length === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                No subjects registered for this course yet. Please create subjects under Academic Subjects first.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={closeModals} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              isLoading={isSubmitting}
              disabled={!courseId || !subjectId || !academicYearId || !semesterNumber || modalSubjects.length === 0}
            >
              {editingItem ? 'Update Mapping' : 'Create Mapping'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal with Error Banner */}
      <Modal
        isOpen={!!deletingItem}
        onClose={() => {
          setDeletingItem(null);
          setDeleteErrorMessage(null);
        }}
        title="Delete Course-Semester Mapping"
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Are you sure you want to delete this mapping?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You are about to remove &quot;{deletingItem?.subject?.name}&quot; ({deletingItem?.subject?.code}) from Semester {deletingItem?.semesterNumber} of {deletingItem?.course?.name}. This action cannot be undone.
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
              type="button"
              onClick={() => {
                setDeletingItem(null);
                setDeleteErrorMessage(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete Mapping
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
