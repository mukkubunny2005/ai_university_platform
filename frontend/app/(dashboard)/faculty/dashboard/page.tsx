'use client';

import React from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import {
  UserCheck,
  BookOpen,
  Library,
  Building2,
  Users,
  FileText,
  Megaphone,
  Sparkles,
  Award,
} from 'lucide-react';

export default function FacultyDashboard() {
  const { user } = useAuth();
  const faculty = user?.faculty;
  const department = faculty?.department;
  const subjects = faculty?.subjects || [];
  const courses = department?.courses || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-violet-800 p-6 sm:p-8 text-white shadow-xl shadow-purple-100 dark:shadow-none">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-purple-100 text-xs font-semibold backdrop-blur-md">
                <UserCheck className="w-3.5 h-3.5" />
                Faculty Academic Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome, {user?.name || 'Professor'}!
              </h1>
              <p className="text-purple-100 text-xs sm:text-sm max-w-xl">
                Manage your academic curriculum, review assigned subjects, track syllabus coverage, and access departmental resources.
              </p>
            </div>

            {/* Faculty Info Capsule */}
            <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <div className="text-left">
                <p className="text-[11px] text-purple-200 uppercase font-bold tracking-wider">Faculty ID</p>
                <p className="text-sm font-bold">{faculty?.facultyId || 'FAC-CSE-001'}</p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-left">
                <p className="text-[11px] text-purple-200 uppercase font-bold tracking-wider">Designation</p>
                <p className="text-sm font-bold">{faculty?.designation || 'Professor'}</p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-left">
                <p className="text-[11px] text-purple-200 uppercase font-bold tracking-wider">Department</p>
                <p className="text-sm font-bold">{department?.code || 'CSE'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Library className="w-4 h-4 text-purple-600" />
                  Assigned Subjects
                </CardTitle>
                <Badge variant="faculty">{subjects.length} Allocated</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {subjects.length}
                </span>
                <span className="text-xs text-slate-400">Under Instruction</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Active teaching curriculum for this semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Academic Department
                </CardTitle>
                <Badge variant="outline">{department?.code || 'CSE'}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {department?.name || 'Computer Science & Engineering'}
              </p>
              <p className="text-xs text-slate-500 line-clamp-2">
                {department?.description || 'Curriculum management and instruction.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Students Mentored
                </CardTitle>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  Enrolled
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">128</span>
                <span className="text-xs text-slate-400">Total Students</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Across all active batches and sections</p>
            </CardContent>
          </Card>
        </div>

        {/* Assigned Subjects & Department Courses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assigned Subjects */}
          <Card id="subjects">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Library className="w-4 h-4 text-purple-600" />
                Assigned Subjects & Lectures
              </CardTitle>
              <CardDescription>Subjects you are scheduled to teach</CardDescription>
            </CardHeader>
            <CardContent>
              {subjects.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500">
                  No subjects currently allocated. Contact administration.
                </div>
              ) : (
                <div className="space-y-3">
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-start justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                            {subject.code}
                          </span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold text-slate-600 dark:text-slate-300">
                            {subject.credits} Credits
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {subject.name}
                        </h4>
                        {subject.course && (
                          <p className="text-xs text-slate-500 mt-1">Course: {subject.course.name}</p>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-md">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department Courses */}
          <Card id="courses">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Department Degree Programs
              </CardTitle>
              <CardDescription>Courses running under {department?.code || 'Department'}</CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500">
                  No programs recorded under this department yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {course.code}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {course.name}
                      </h4>
                      {course.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {course.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Phase 2 Operations Placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  Coursework & Assignments
                </CardTitle>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  Phase 2 Feature
                </span>
              </div>
              <CardDescription>Submissions review & grading queue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Assignment #3: Dynamic Programming Algorithms
                  </p>
                  <p className="text-[11px] text-slate-400">42 / 48 submissions received</p>
                </div>
                <span className="text-xs font-semibold text-indigo-600">Review</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Mid-term Project: Microservices Architecture
                  </p>
                  <p className="text-[11px] text-slate-400">All submissions graded</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600">Completed</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-blue-600" />
                  Announcements & Broadcasts
                </CardTitle>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  Phase 2 Feature
                </span>
              </div>
              <CardDescription>Departmental notices to students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Syllabus Progress Report
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Module 3 complete for all sections. Commencing Module 4 next week.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Faculty Committee Review
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Quarterly curriculum alignment scheduled for Thursday 2:00 PM.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Question Generator Section Placeholder (Clearly marked Coming in Phase 3) */}
        <Card className="border-purple-200/80 dark:border-purple-900 bg-gradient-to-br from-purple-50/60 via-indigo-50/40 to-white dark:from-purple-950/20 dark:via-indigo-950/10 dark:to-slate-900">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm shadow-purple-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-purple-950 dark:text-purple-200">
                    AI Question Generator & Examination Studio
                  </CardTitle>
                  <CardDescription className="text-xs text-purple-800/70 dark:text-purple-400">
                    Generate Bloom&apos;s taxonomy aligned question banks and rubrics from lecture notes
                  </CardDescription>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-purple-600 text-white shadow-xs">
                Coming in Phase 3
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-purple-100 dark:border-purple-900/40">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Automated Quiz Generation
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Generate multiple-choice, numerical, and conceptual questions from lecture slides instantly.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-purple-100 dark:border-purple-900/40">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Grading Rubric Creator
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Synthesize structured evaluation criteria and sample solution keys with difficulty weightings.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-purple-100 dark:border-purple-900/40">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Cohort Learning Analytics
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Identify conceptual topics where students struggle to target tutorial sessions effectively.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
