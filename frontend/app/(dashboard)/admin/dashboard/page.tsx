'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../../context/AuthContext';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { StatCard } from '../../../../components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { departmentsApi } from '../../../../lib/api/departments';
import { coursesApi } from '../../../../lib/api/courses';
import { subjectsApi } from '../../../../lib/api/subjects';
import { studentsApi } from '../../../../lib/api/students';
import { facultyApi } from '../../../../lib/api/faculty';
import {
  GraduationCap,
  Building2,
  BookOpen,
  Library,
  UserCheck,
  ShieldCheck,
  Plus,
  ArrowRight,
  Server,
  Layers,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();

  // Queries for metrics
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsApi.getAll,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesApi.getAll(),
  });

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => subjectsApi.getAll(),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsApi.getAll(),
  });

  const { data: faculty = [] } = useQuery({
    queryKey: ['faculty'],
    queryFn: () => facultyApi.getAll(),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Admin Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-slate-200 dark:shadow-none border border-slate-800">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold backdrop-blur-md border border-rose-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                University Administration Control Center
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome, {user?.name || 'Administrator'}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                Centralized management for institutional entities, user governance, curriculum hierarchy, and infrastructure readiness.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="http://localhost:4000/api/docs"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-md"
              >
                <Server className="w-4 h-4" />
                Swagger API Docs
              </a>
            </div>
          </div>
        </div>

        {/* 5 Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Students"
            value={students.length}
            icon={<GraduationCap className="w-5 h-5" />}
            color="blue"
            subtitle="Registered learners"
          />
          <StatCard
            title="Total Faculty"
            value={faculty.length}
            icon={<UserCheck className="w-5 h-5" />}
            color="purple"
            subtitle="Teaching professors"
          />
          <StatCard
            title="Departments"
            value={departments.length}
            icon={<Building2 className="w-5 h-5" />}
            color="indigo"
            subtitle="Academic units"
          />
          <StatCard
            title="Total Courses"
            value={courses.length}
            icon={<BookOpen className="w-5 h-5" />}
            color="emerald"
            subtitle="Degree programs"
          />
          <StatCard
            title="Total Subjects"
            value={subjects.length}
            icon={<Library className="w-5 h-5" />}
            color="amber"
            subtitle="Active curriculum"
          />
        </div>

        {/* Quick Action Shortcuts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Administrative Actions</CardTitle>
            <CardDescription>Quickly create and manage university resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Link href="/admin/departments">
                <Button variant="outline" size="sm" className="w-full flex-col h-auto py-3 gap-1.5 text-xs">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Departments
                </Button>
              </Link>
              <Link href="/admin/courses">
                <Button variant="outline" size="sm" className="w-full flex-col h-auto py-3 gap-1.5 text-xs">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Courses
                </Button>
              </Link>
              <Link href="/admin/subjects">
                <Button variant="outline" size="sm" className="w-full flex-col h-auto py-3 gap-1.5 text-xs">
                  <Library className="w-4 h-4 text-amber-600" />
                  Subjects
                </Button>
              </Link>
              <Link href="/admin/students">
                <Button variant="outline" size="sm" className="w-full flex-col h-auto py-3 gap-1.5 text-xs">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Students
                </Button>
              </Link>
              <Link href="/admin/faculty">
                <Button variant="outline" size="sm" className="w-full flex-col h-auto py-3 gap-1.5 text-xs">
                  <UserCheck className="w-4 h-4 text-purple-600" />
                  Faculty
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline" size="sm" className="w-full flex-col h-auto py-3 gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-rose-600" />
                  Users & Roles
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Overview Tables Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Departments Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Departments Directory
                </CardTitle>
                <CardDescription>Academic units and capacity</CardDescription>
              </div>
              <Link href="/admin/departments">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {departments.length === 0 ? (
                <p className="text-xs text-slate-400 p-4">No departments found.</p>
              ) : (
                <div className="space-y-2">
                  {departments.slice(0, 4).map((d) => (
                    <div
                      key={d.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-600">{d.code}</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {d.name}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        {d._count?.courses || 0} Courses
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Courses Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  Degree Programs & Courses
                </CardTitle>
                <CardDescription>Active curriculums</CardDescription>
              </div>
              <Link href="/admin/courses">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <p className="text-xs text-slate-400 p-4">No courses found.</p>
              ) : (
                <div className="space-y-2">
                  {courses.slice(0, 4).map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-600">{c.code}</span>
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs block">
                            {c.name}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        {c._count?.subjects || 0} Subjects
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
