export type Role = 'STUDENT' | 'FACULTY' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
  student?: Student;
  faculty?: Faculty;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  courses?: Course[];
  faculty?: Faculty[];
  students?: Student[];
  _count?: {
    courses: number;
    students: number;
    faculty: number;
  };
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  departmentId: string;
  department?: Department;
  createdAt?: string;
  updatedAt?: string;
  subjects?: Subject[];
  _count?: {
    subjects: number;
  };
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  courseId: string;
  course?: Course;
  facultyId?: string | null;
  faculty?: Faculty | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  userId: string;
  studentId: string;
  departmentId: string;
  semester: number;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt?: string;
  };
  department?: Department;
}

export interface Faculty {
  id: string;
  userId: string;
  facultyId: string;
  departmentId: string;
  designation: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt?: string;
  };
  department?: Department;
  subjects?: Subject[];
  _count?: {
    subjects: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'STUDENT' | 'FACULTY';
  departmentId?: string;
  studentId?: string;
  semester?: number;
  facultyId?: string;
  designation?: string;
}
