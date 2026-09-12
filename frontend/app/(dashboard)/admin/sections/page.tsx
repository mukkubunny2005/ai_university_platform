'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import { sectionsApi } from '../../../../lib/api/sections';
import { departmentsApi } from '../../../../lib/api/departments';
import { coursesApi } from '../../../../lib/api/courses';
import { batchesApi } from '../../../../lib/api/batches';
import { academicYearsApi } from '../../../../lib/api/academicYears';
import { Section, Department, Course, Batch, AcademicYear } from '../../../../types';
import { useToast } from '../../../../context/ToastContext';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Badge } from '../../../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/Table';
import { Modal } from '../../../../components/ui/Modal';
import { LoadingSpinner } from '../../../../components/shared/LoadingSpinner';
import { EmptyState } from '../../../../components/shared/EmptyState';
import { ErrorAlert } from '../../../../components/shared/ErrorAlert';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Filter,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Users,
} from 'lucide-react';

export default function AdminSectionsPage() {
  const { success, error: toastError } = useToast();

  // Primary data lists
  const [sections, setSections] = useState<Section[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  // Page loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Cascading Filter states (at top)
  const [filterDepartmentId, setFilterDepartmentId] = useState<string>('');
  const [filterCourseId, setFilterCourseId] = useState<string>('');
  const [filterBatchId, setFilterBatchId] = useState<string>('');
  const [filterAcademicYearId, setFilterAcademicYearId] = useState<string>('');
  const [filterSemesterNumber, setFilterSemesterNumber] = useState<string>('');

  // Dependent filter options
  const [filterCourses, setFilterCourses] = useState<Course[]>([]);
  const [isLoadingFilterCourses, setIsLoadingFilterCourses] = useState(false);
  const [filterBatches, setFilterBatches] = useState<Batch[]>([]);
  const [isLoadingFilterBatches, setIsLoadingFilterBatches] = useState(false);

  // Create / Edit Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal form fields
  const [name, setName] = useState('');
  const [semesterNumber, setSemesterNumber] = useState<number>(1);
  const [departmentId, setDepartmentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [academicYearId, setAcademicYearId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [maxCapacity, setMaxCapacity] = useState<number | ''>(60);

  // Modal dependent options
  const [modalCourses, setModalCourses] = useState<Course[]>([]);
  const [isLoadingModalCourses, setIsLoadingModalCourses] = useState(false);
  const [modalBatches, setModalBatches] = useState<Batch[]>([]);
  const [isLoadingModalBatches, setIsLoadingModalBatches] = useState(false);

  // Delete Confirmation Modal states
  const [deletingSection, setDeletingSection] = useState<Section | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Load initial dropdown options (Departments and Academic Years) on mount
  useEffect(() => {
    let isMounted = true;
    const loadInitialMetadata = async () => {
      try {
        const [loadedDepts, loadedAcademicYears] = await Promise.all([
          departmentsApi.getAll(),
          academicYearsApi.getAll(),
        ]);
        if (isMounted) {
          setDepartments(loadedDepts || []);
          setAcademicYears(loadedAcademicYears || []);
        }
      } catch (err: any) {
        console.error('Failed to load initial metadata for departments/academic years', err);
      }
    };

    loadInitialMetadata();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch sections with active cascading filters
  const fetchSections = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const filters: {
        departmentId?: string;
        courseId?: string;
        batchId?: string;
        academicYearId?: string;
        semesterNumber?: number;
      } = {};

      if (filterDepartmentId) filters.departmentId = filterDepartmentId;
      if (filterCourseId) filters.courseId = filterCourseId;
      if (filterBatchId) filters.batchId = filterBatchId;
      if (filterAcademicYearId) filters.academicYearId = filterAcademicYearId;
      if (filterSemesterNumber) filters.semesterNumber = Number(filterSemesterNumber);

      const data = await sectionsApi.getAll(filters);
      setSections(data || []);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to load sections';
      setFetchError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [
    filterDepartmentId,
    filterCourseId,
    filterBatchId,
    filterAcademicYearId,
    filterSemesterNumber,
  ]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  // Handle department change in top filter
  const handleFilterDepartmentChange = async (deptId: string) => {
    setFilterDepartmentId(deptId);
    setFilterCourseId('');
    setFilterBatchId('');
    setFilterBatches([]);

    if (deptId) {
      setIsLoadingFilterCourses(true);
      try {
        const courses = await coursesApi.getAll(deptId);
        setFilterCourses(courses || []);
      } catch (err) {
        console.error('Failed to fetch courses for filter', err);
        setFilterCourses([]);
      } finally {
        setIsLoadingFilterCourses(false);
      }
    } else {
      setFilterCourses([]);
    }
  };

  // Handle course change in top filter
  const handleFilterCourseChange = async (crsId: string) => {
    setFilterCourseId(crsId);
    setFilterBatchId('');

    if (filterDepartmentId && crsId) {
      setIsLoadingFilterBatches(true);
      try {
        const batches = await batchesApi.getAll(filterDepartmentId, crsId);
        setFilterBatches(batches || []);
      } catch (err) {
        console.error('Failed to fetch batches for filter', err);
        setFilterBatches([]);
      } finally {
        setIsLoadingFilterBatches(false);
      }
    } else {
      setFilterBatches([]);
    }
  };

  // Clear all cascading filters
  const clearFilters = () => {
    setFilterDepartmentId('');
    setFilterCourseId('');
    setFilterBatchId('');
    setFilterAcademicYearId('');
    setFilterSemesterNumber('');
    setFilterCourses([]);
    setFilterBatches([]);
  };

  const hasActiveFilters = Boolean(
    filterDepartmentId ||
      filterCourseId ||
      filterBatchId ||
      filterAcademicYearId ||
      filterSemesterNumber,
  );

  // Handle department change in modal
  const handleModalDepartmentChange = async (newDeptId: string) => {
    setDepartmentId(newDeptId);
    setCourseId('');
    setBatchId('');
    setModalBatches([]);

    if (newDeptId) {
      setIsLoadingModalCourses(true);
      try {
        const courses = await coursesApi.getAll(newDeptId);
        setModalCourses(courses || []);
      } catch (err) {
        console.error('Failed to load courses for modal department', err);
        setModalCourses([]);
      } finally {
        setIsLoadingModalCourses(false);
      }
    } else {
      setModalCourses([]);
    }
  };

  // Handle course change in modal
  const handleModalCourseChange = async (newCourseId: string) => {
    setCourseId(newCourseId);
    setBatchId('');

    if (departmentId && newCourseId) {
      setIsLoadingModalBatches(true);
      try {
        const batches = await batchesApi.getAll(departmentId, newCourseId);
        setModalBatches(batches || []);
      } catch (err) {
        console.error('Failed to load batches for modal course', err);
        setModalBatches([]);
      } finally {
        setIsLoadingModalBatches(false);
      }
    } else {
      setModalBatches([]);
    }
  };

  // Close create / edit modal and reset form
  const closeModals = () => {
    setIsModalOpen(false);
    setEditingSection(null);
    setFormError(null);
    setName('');
    setSemesterNumber(1);
    setDepartmentId('');
    setCourseId('');
    setAcademicYearId('');
    setBatchId('');
    setMaxCapacity(60);
    setModalCourses([]);
    setModalBatches([]);
  };

  // Open add modal and initialize defaults
  const openAddModal = async () => {
    closeModals();
    const defaultDept = filterDepartmentId || (departments[0]?.id ?? '');
    const defaultAY =
      filterAcademicYearId ||
      (academicYears.find((ay) => ay.isActive)?.id ?? academicYears[0]?.id ?? '');
    const defaultSem = filterSemesterNumber ? Number(filterSemesterNumber) : 1;

    setDepartmentId(defaultDept);
    setAcademicYearId(defaultAY);
    setSemesterNumber(defaultSem);
    setName('');
    setMaxCapacity(60);
    setCourseId('');
    setBatchId('');
    setIsModalOpen(true);

    if (defaultDept) {
      setIsLoadingModalCourses(true);
      try {
        const courses = await coursesApi.getAll(defaultDept);
        setModalCourses(courses || []);

        if (filterCourseId && courses?.some((c) => c.id === filterCourseId)) {
          setCourseId(filterCourseId);
          setIsLoadingModalBatches(true);
          const batches = await batchesApi.getAll(defaultDept, filterCourseId);
          setModalBatches(batches || []);
          if (filterBatchId && batches?.some((b) => b.id === filterBatchId)) {
            setBatchId(filterBatchId);
          }
          setIsLoadingModalBatches(false);
        }
      } catch (err) {
        console.error('Failed to load courses on open add modal', err);
      } finally {
        setIsLoadingModalCourses(false);
      }
    }
  };

  // Open edit modal and populate values with cascading lists
  const openEditModal = async (sec: Section) => {
    closeModals();
    setEditingSection(sec);
    setName(sec.name);
    setSemesterNumber(sec.semesterNumber);
    setDepartmentId(sec.departmentId);
    setCourseId(sec.courseId);
    setAcademicYearId(sec.academicYearId);
    setBatchId(sec.batchId);
    setMaxCapacity(sec.maxCapacity ?? 60);

    // Seed temporary arrays with known relations to prevent flash of empty select
    if (sec.course) {
      setModalCourses([sec.course]);
    }
    if (sec.batch) {
      setModalBatches([sec.batch]);
    }

    setIsModalOpen(true);

    // Fetch complete course list for section's department and batches for section's course
    try {
      setIsLoadingModalCourses(true);
      const courses = await coursesApi.getAll(sec.departmentId);
      setModalCourses(courses || []);
      setIsLoadingModalCourses(false);

      setIsLoadingModalBatches(true);
      const batches = await batchesApi.getAll(sec.departmentId, sec.courseId);
      setModalBatches(batches || []);
      setIsLoadingModalBatches(false);
    } catch (err) {
      console.error('Failed to load cascading options for editing section', err);
      setIsLoadingModalCourses(false);
      setIsLoadingModalBatches(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (sec: Section) => {
    setDeletingSection(sec);
    setDeleteErrorMessage(null);
  };

  // Handle form submit for create / edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setFormError('Section name is required (e.g. A, B, or 1).');
      return;
    }
    if (!departmentId) {
      setFormError('Please select a department.');
      return;
    }
    if (!courseId) {
      setFormError('Please select a course.');
      return;
    }
    if (!batchId) {
      setFormError('Please select a batch.');
      return;
    }
    if (!academicYearId) {
      setFormError('Please select an academic year.');
      return;
    }
    const cap = Number(maxCapacity);
    if (!cap || cap < 1) {
      setFormError('Maximum capacity must be at least 1 student.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      name: name.trim().toUpperCase(),
      semesterNumber: Number(semesterNumber),
      departmentId,
      courseId,
      academicYearId,
      batchId,
      maxCapacity: cap,
    };

    try {
      if (editingSection) {
        await sectionsApi.update(editingSection.id, payload);
        success(`Section "${payload.name}" updated successfully!`);
      } else {
        await sectionsApi.create(payload);
        success(`Section "${payload.name}" created successfully!`);
      }
      closeModals();
      await fetchSections();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (editingSection ? 'Failed to update section' : 'Failed to create section');
      setFormError(msg);
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete execution
  const handleDelete = async () => {
    if (!deletingSection) return;

    setIsDeleting(true);
    setDeleteErrorMessage(null);

    try {
      await sectionsApi.delete(deletingSection.id);
      success(`Section "${deletingSection.name}" deleted successfully!`);
      setDeletingSection(null);
      await fetchSections();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to delete section';
      setDeleteErrorMessage(msg);
      toastError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              Section Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Organize student class cohorts, section quotas, and semester divisions.
            </p>
          </div>
          <Button
            size="sm"
            onClick={openAddModal}
            className="gap-1.5"
            disabled={departments.length === 0 || academicYears.length === 0}
            title={
              departments.length === 0
                ? 'Please create at least one department first'
                : academicYears.length === 0
                ? 'Please create at least one academic year first'
                : 'Create Section'
            }
          >
            <Plus className="w-4 h-4" /> Add Section
          </Button>
        </div>

        {/* Fetch Error Banner */}
        {fetchError && (
          <ErrorAlert message={fetchError} onRetry={fetchSections} />
        )}

        {/* Cascading Filter Bar */}
        <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                <Filter className="w-3.5 h-3.5 text-indigo-500" />
                Cascading Filters
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* 1. Department Filter */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Department
                </label>
                <select
                  aria-label="Filter by Department"
                  value={filterDepartmentId}
                  onChange={(e) => handleFilterDepartmentChange(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium truncate"
                >
                  <option value="">All Departments ({departments.length})</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} — {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Course Filter (loads when department selected) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Course
                </label>
                <select
                  aria-label="Filter by Course"
                  value={filterCourseId}
                  onChange={(e) => handleFilterCourseChange(e.target.value)}
                  disabled={!filterDepartmentId || isLoadingFilterCourses}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800/50 truncate"
                >
                  <option value="">
                    {!filterDepartmentId
                      ? 'Select Department first'
                      : isLoadingFilterCourses
                      ? 'Loading courses...'
                      : `All Courses (${filterCourses.length})`}
                  </option>
                  {filterCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Batch Filter (loads batches for department + course) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Batch
                </label>
                <select
                  aria-label="Filter by Batch"
                  value={filterBatchId}
                  onChange={(e) => setFilterBatchId(e.target.value)}
                  disabled={!filterCourseId || isLoadingFilterBatches}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800/50 truncate"
                >
                  <option value="">
                    {!filterCourseId
                      ? 'Select Course first'
                      : isLoadingFilterBatches
                      ? 'Loading batches...'
                      : `All Batches (${filterBatches.length})`}
                  </option>
                  {filterBatches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.startYear}-{b.endYear})
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Academic Year Filter (loads all academic years) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Academic Year
                </label>
                <select
                  aria-label="Filter by Academic Year"
                  value={filterAcademicYearId}
                  onChange={(e) => setFilterAcademicYearId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium truncate"
                >
                  <option value="">All Academic Years ({academicYears.length})</option>
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name} ({ay.code}){ay.isActive ? ' ★ Active' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Semester Number Filter (1-8) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Semester
                </label>
                <select
                  aria-label="Filter by Semester"
                  value={filterSemesterNumber}
                  onChange={(e) => setFilterSemesterNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Sections Table Card */}
        <Card>
          <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                All Sections
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {sections.length}
                </span>
              </CardTitle>
              <CardDescription>Class groups, classroom sizes, and cohort allocations</CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <LoadingSpinner />
            ) : sections.length === 0 ? (
              <EmptyState
                icon={<Layers className="w-8 h-8 text-slate-400" />}
                title={
                  hasActiveFilters
                    ? 'No sections match the selected filters'
                    : 'No sections configured yet'
                }
                description={
                  hasActiveFilters
                    ? 'Try adjusting or clearing your cascading filters to view other sections.'
                    : 'Create your first section cohort to allocate students to departments and courses.'
                }
                actionLabel={
                  hasActiveFilters
                    ? 'Reset Filters'
                    : departments.length > 0
                    ? 'Add Section'
                    : undefined
                }
                onAction={hasActiveFilters ? clearFilters : departments.length > 0 ? openAddModal : undefined}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((sec) => (
                    <TableRow key={sec.id}>
                      {/* Name Column */}
                      <TableCell className="font-bold text-indigo-600 dark:text-indigo-400">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/60 font-mono text-sm">
                          Section {sec.name}
                        </span>
                      </TableCell>

                      {/* Semester Column */}
                      <TableCell>
                        <Badge variant="outline" className="font-semibold text-xs">
                          Sem {sec.semesterNumber}
                        </Badge>
                      </TableCell>

                      {/* Department Column */}
                      <TableCell className="text-xs font-medium">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mr-1 font-semibold">
                          {sec.department?.code}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {sec.department?.name}
                        </span>
                      </TableCell>

                      {/* Course Column */}
                      <TableCell className="text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {sec.course?.code}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px] truncate max-w-[160px]">
                          {sec.course?.name}
                        </span>
                      </TableCell>

                      {/* Batch Column */}
                      <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {sec.batch ? (
                          <div>
                            <span>{sec.batch.name}</span>
                            <span className="text-slate-400 block text-[11px]">
                              {sec.batch.startYear} – {sec.batch.endYear}
                            </span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </TableCell>

                      {/* Academic Year Column */}
                      <TableCell className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {sec.academicYear?.name || sec.academicYear?.code || '—'}
                          </span>
                          {sec.academicYear?.isActive && (
                            <span
                              className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0"
                              title="Active Academic Year"
                            />
                          )}
                        </div>
                      </TableCell>

                      {/* Capacity Column */}
                      <TableCell className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {sec.maxCapacity} seats
                      </TableCell>

                      {/* Students count Column */}
                      <TableCell>
                        <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          <Users className="w-3 h-3 mr-1 text-indigo-500" />
                          {sec._count?.students ?? 0} / {sec.maxCapacity}
                        </span>
                      </TableCell>

                      {/* Actions Column */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(sec)}
                            className="p-1.5 h-auto text-slate-500 hover:text-indigo-600"
                            title="Edit Section"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(sec)}
                            className="p-1.5 h-auto text-slate-500 hover:text-rose-600"
                            title="Delete Section"
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

      {/* Create / Edit Section Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModals}
        title={editingSection ? 'Edit Section' : 'Create Section'}
        description="Configure class cohort details, semester level, and capacity ceiling."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{formError}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <Input
              label="Section Name"
              placeholder="e.g. A, B, or 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              helperText="Identifier for the cohort (e.g. 'A')"
            />

            {/* Semester Number (Select 1-8) */}
            <Select
              label="Semester"
              value={semesterNumber}
              onChange={(e) => setSemesterNumber(Number(e.target.value))}
              options={[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({
                label: `Semester ${s}`,
                value: s,
              }))}
              required
            />
          </div>

          {/* Department Select */}
          <Select
            label="Department"
            value={departmentId}
            onChange={(e) => handleModalDepartmentChange(e.target.value)}
            options={departments.map((d) => ({
              label: `${d.name} (${d.code})`,
              value: d.id,
            }))}
            placeholder="Select Department"
            required
          />

          {/* Course Select (loads when department selected) */}
          <Select
            label="Course"
            value={courseId}
            onChange={(e) => handleModalCourseChange(e.target.value)}
            options={modalCourses.map((c) => ({
              label: `${c.name} (${c.code})`,
              value: c.id,
            }))}
            placeholder={
              !departmentId
                ? 'Select Department first'
                : isLoadingModalCourses
                ? 'Loading courses...'
                : 'Select Course'
            }
            disabled={!departmentId || isLoadingModalCourses}
            required
          />

          {/* Batch Select (loads batches for department + course) */}
          <Select
            label="Batch"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            options={modalBatches.map((b) => ({
              label: `${b.name} (${b.code} • ${b.startYear}-${b.endYear})`,
              value: b.id,
            }))}
            placeholder={
              !courseId
                ? 'Select Course first'
                : isLoadingModalBatches
                ? 'Loading batches...'
                : 'Select Batch'
            }
            disabled={!courseId || isLoadingModalBatches}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Academic Year Select (loads all academic years) */}
            <Select
              label="Academic Year"
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              options={academicYears.map((ay) => ({
                label: `${ay.name} (${ay.code})${ay.isActive ? ' ★' : ''}`,
                value: ay.id,
              }))}
              placeholder="Select Academic Year"
              required
            />

            {/* Max Capacity (number input, default 60) */}
            <Input
              label="Max Capacity"
              type="number"
              min={1}
              max={500}
              placeholder="60"
              value={maxCapacity}
              onChange={(e) =>
                setMaxCapacity(e.target.value === '' ? '' : Number(e.target.value))
              }
              required
              helperText="Default: 60 students"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={closeModals}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isSubmitting}>
              {editingSection ? 'Update Section' : 'Create Section'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingSection}
        onClose={() => {
          setDeletingSection(null);
          setDeleteErrorMessage(null);
        }}
        title="Delete Section"
        maxWidth="sm"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Are you sure you want to delete Section &quot;{deletingSection?.name}&quot;?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This will delete Section {deletingSection?.name} (Semester{' '}
                {deletingSection?.semesterNumber}) for{' '}
                {deletingSection?.course?.code || 'course'} in{' '}
                {deletingSection?.department?.code || 'department'}.
                {deletingSection?._count?.students && deletingSection._count.students > 0 ? (
                  <span className="block mt-1 font-semibold text-rose-600 dark:text-rose-400">
                    Warning: {deletingSection._count.students} student(s) currently enrolled
                    will become unassigned.
                  </span>
                ) : null}
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
                setDeletingSection(null);
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
              Delete Section
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
