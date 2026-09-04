'use client';

import React from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import {
  GraduationCap,
  BookOpen,
  Library,
  Building2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Bell,
  UserCheck,
  Award,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const student = user?.student;
  const department = student?.department;
  const courses = department?.courses || [];

  // Extract all subjects belonging to courses in this department
  const subjects = courses.flatMap((c) => c.subjects || []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 dark:shadow-none">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-xs font-semibold backdrop-blur-md">
                <GraduationCap className="w-3.5 h-3.5" />
                Student Academic Portal
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome, {user?.name || 'Student'}!
              </h1>
              <p className="text-indigo-100 text-xs sm:text-sm max-w-xl">
                Track your academic progress, enrolled courses, syllabus credits, and university schedule.
              </p>
            </div>

            {/* Academic Info Capsule */}
            <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
              <div className="text-left">
                <p className="text-[11px] text-indigo-200 uppercase font-bold tracking-wider">Student ID</p>
                <p className="text-sm font-bold">{student?.studentId || 'STU-2026-001'}</p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-left">
                <p className="text-[11px] text-indigo-200 uppercase font-bold tracking-wider">Semester</p>
                <p className="text-sm font-bold">Sem {student?.semester || 4}</p>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-left">
                <p className="text-[11px] text-indigo-200 uppercase font-bold tracking-wider">Department</p>
                <p className="text-sm font-bold">{department?.code || 'CSE'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Department Information */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Department
                </CardTitle>
                <Badge variant="outline">{department?.code || 'CSE'}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-base font-bold text-slate-900 dark:text-white">
                {department?.name || 'Computer Science & Engineering'}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {department?.description ||
                  'Focusing on computational algorithms, systems programming, and modern software architectures.'}
              </p>
            </CardContent>
          </Card>

          {/* Attendance Placeholder */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Attendance
                </CardTitle>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  Good Standing
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">88.5%</span>
                <span className="text-xs text-slate-400">46 / 52 Sessions</span>
              </div>
              <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88.5%' }} />
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Minimum mandatory institutional threshold: 75%
              </p>
            </CardContent>
          </Card>

          {/* Semester Milestone */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  Current Term
                </CardTitle>
                <Badge variant="student">Semester {student?.semester || 4}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Active Subjects
                </span>
                <span className="text-lg font-bold text-indigo-600">{subjects.length || 4}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Total Credits
                </span>
                <span className="text-lg font-bold text-indigo-600">
                  {subjects.reduce((acc, s) => acc + (s.credits || 3), 0) || 16}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Mid-term evaluations begin Week 8</p>
            </CardContent>
          </Card>
        </div>

        {/* My Enrolled Courses & Subjects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="courses">
          {/* Courses List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Degree Programs & Courses
              </CardTitle>
              <CardDescription>Academic programs offered in your department</CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500">
                  No courses enrolled yet or syllabus data pending.
                </div>
              ) : (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-200 transition-colors bg-white dark:bg-slate-900/50"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {course.code}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {course.subjects?.length || 0} Subjects
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

          {/* Subjects List */}
          <Card id="subjects">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Library className="w-4 h-4 text-violet-600" />
                My Subjects & Faculty
              </CardTitle>
              <CardDescription>Current curriculum and assigned professors</CardDescription>
            </CardHeader>
            <CardContent>
              {subjects.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500">
                  No subjects scheduled for this semester.
                </div>
              ) : (
                <div className="space-y-3">
                  {subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                            {subject.code}
                          </span>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold text-slate-600 dark:text-slate-300">
                            {subject.credits} Credits
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {subject.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          Faculty: {subject.faculty?.user?.name || 'Academic Faculty'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Phase 2 Operations Placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Assignments Placeholder */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Upcoming Assignments
                </CardTitle>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  Phase 2 Feature
                </span>
              </div>
              <CardDescription>Continuous assessment submissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Data Structures: Balanced Trees Lab
                  </p>
                  <p className="text-[11px] text-slate-400">Due in 4 days • CS201</p>
                </div>
                <span className="text-xs font-semibold text-amber-600">Pending</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Database Systems: Normalization & Indexing
                  </p>
                  <p className="text-[11px] text-slate-400">Due next week • CS202</p>
                </div>
                <span className="text-xs font-semibold text-amber-600">Pending</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Notifications Placeholder */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  Recent Campus Notifications
                </CardTitle>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  Phase 2 Feature
                </span>
              </div>
              <CardDescription>Departmental notices and announcements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Academic Calendar Update
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Mid-semester practical examinations scheduled for the last week of the month.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Guest Lecture: Distributed Systems at Scale
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Friday at 4:00 PM in Main Auditorium & Virtual Hall.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Learning Section Placeholder (Clearly marked Coming in Phase 3) */}
        <Card className="border-indigo-200/80 dark:border-indigo-900 bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-white dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-slate-900">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg text-indigo-950 dark:text-indigo-200">
                    AI Personal Learning Assistant & Tutor
                  </CardTitle>
                  <CardDescription className="text-xs text-indigo-800/70 dark:text-indigo-400">
                    Subject-specific document Q&A, syllabus retrieval, and dynamic study coaching
                  </CardDescription>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-indigo-600 text-white shadow-xs">
                Coming in Phase 3
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-indigo-100 dark:border-indigo-900/40">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  AI Course Tutor
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Interactive tutoring on your enrolled subjects powered by FastAPI and LLM reasoning.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-indigo-100 dark:border-indigo-900/40">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Syllabus Document Q&A
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Ask questions directly to course lecture notes and textbooks using RAG vector search.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-indigo-100 dark:border-indigo-900/40">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Adaptive Quiz Generator
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Custom practice quizzes that adapt automatically to your strengths and learning gaps.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
