import React from 'react';
import { cn } from '../../lib/utils';
import { Role } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'student' | 'faculty' | 'admin' | 'success' | 'warning' | 'danger' | 'outline';
  role?: Role;
}

export function Badge({ className, variant = 'default', role, children, ...props }: BadgeProps) {
  let badgeVariant = variant;
  if (role) {
    if (role === 'ADMIN') badgeVariant = 'admin';
    else if (role === 'FACULTY') badgeVariant = 'faculty';
    else if (role === 'STUDENT') badgeVariant = 'student';
  }

  const variants = {
    default: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
    student: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    faculty: 'bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    admin: 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    outline: 'bg-transparent text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider',
        variants[badgeVariant],
        className,
      )}
      {...props}
    >
      {children || role}
    </span>
  );
}
