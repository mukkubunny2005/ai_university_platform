'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Building2,
  Library,
  BookMarked,
  UserCheck,
  User,
  LogOut,
  Sparkles,
  Calendar,
  CalendarRange,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils';

export function Sidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  const adminNav = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Departments', href: '/admin/departments', icon: Building2 },
    { label: 'Courses', href: '/admin/courses', icon: BookOpen },
    { label: 'Academic Years', href: '/admin/academic-years', icon: Calendar },
    { label: 'Batches', href: '/admin/batches', icon: CalendarRange },
    { label: 'Sections', href: '/admin/sections', icon: Layers },
    { label: 'Course Semesters', href: '/admin/course-semesters', icon: BookMarked },
    { label: 'Subjects', href: '/admin/subjects', icon: Library },
    { label: 'Students', href: '/admin/students', icon: GraduationCap },
    { label: 'Faculty', href: '/admin/faculty', icon: UserCheck },
    { label: 'Users & Roles', href: '/admin/users', icon: Users },
  ];

  const facultyNav = [
    { label: 'Dashboard', href: '/faculty/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Subjects', href: '/faculty/dashboard#subjects', icon: Library },
    { label: 'Courses', href: '/faculty/dashboard#courses', icon: BookOpen },
    { label: 'Department', href: '/faculty/dashboard#department', icon: Building2 },
  ];

  const studentNav = [
    { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', href: '/student/dashboard#courses', icon: BookOpen },
    { label: 'My Subjects', href: '/student/dashboard#subjects', icon: BookMarked },
    { label: 'My Department', href: '/student/dashboard#department', icon: Building2 },
  ];

  const navItems = role === 'ADMIN' ? adminNav : role === 'FACULTY' ? facultyNav : studentNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-200 dark:shadow-none">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                AI University
              </span>
              <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
                P1
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Academic Portal</p>
          </div>
        </div>

        {/* Role Badge Indicator */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500">Access Level:</span>
          {role && <Badge role={role} />}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href) && !item.href.includes('#'));

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200',
                )}
              >
                <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400')} />
                {item.label}
              </Link>
            );
          })}

          {/* AI Features Roadmap Preview */}
          <div className="pt-6">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              AI Intelligence
            </p>
            <div className="p-3 mx-1 rounded-xl bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-amber-50/40 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-100/60 dark:border-indigo-900/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                  AI Service Architecture
                </span>
                <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">
                  Phase 3
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                FastAPI, RAG vector pipelines & AI tutors ready for integration.
              </p>
            </div>
          </div>
        </div>

        {/* User Account Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
          <Link
            href="/profile"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </Link>

          <button
            onClick={() => logout()}
            className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
