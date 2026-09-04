'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { PageLoading } from '../../../components/shared/LoadingSpinner';

export default function DashboardRedirect() {
  const { user, role, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        router.push('/login');
      } else if (role === 'STUDENT') {
        router.push('/student/dashboard');
      } else if (role === 'FACULTY') {
        router.push('/faculty/dashboard');
      } else if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, role, user, router]);

  return <PageLoading />;
}
