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
  batchId?: string | null;
  sectionId?: string | null;
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
  batch?: Batch | null;
  section?: Section | null;
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

export interface AcademicYear {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    sections: number;
    courseSemesters: number;
  };
}

export interface Batch {
  id: string;
  name: string;
  code: string;
  startYear: number;
  endYear: number;
  departmentId: string;
  courseId: string;
  createdAt?: string;
  updatedAt?: string;
  department?: Department;
  course?: Course;
  _count?: {
    students: number;
    sections: number;
  };
}

export interface Section {
  id: string;
  name: string;
  semesterNumber: number;
  departmentId: string;
  courseId: string;
  academicYearId: string;
  batchId: string;
  maxCapacity: number;
  createdAt?: string;
  updatedAt?: string;
  department?: Department;
  course?: Course;
  academicYear?: AcademicYear;
  batch?: Batch;
  _count?: {
    students: number;
  };
}

export interface CourseSemester {
  id: string;
  courseId: string;
  semesterNumber: number;
  subjectId: string;
  academicYearId: string;
  createdAt?: string;
  updatedAt?: string;
  course?: Course;
  subject?: Subject;
  academicYear?: AcademicYear;
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
  departmentId: string;
  studentId?: string;
  semester?: number;
  facultyId?: string;
  designation?: string;
}

