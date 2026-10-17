// ============================================================
// USER TYPES
// ============================================================

export type UserType = 'student' | 'department' | 'admin';

export interface User {
  id?: string;
  username: string;
  fullName: string;
  email?: string;
  userType: UserType;
  studentId?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  userType: UserType;
}

export interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserType;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// ============================================================
// ADMIN TYPES
// ============================================================

export interface Department {
  id: string;
  name: string;
  head: string;
  totalRequests: number;
  pending: number;
  approved: number;
  rejected: number;
  status: 'active' | 'inactive';
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  course: string;
  year: string;
  clearanceStatus: 'cleared' | 'in-progress' | 'rejected';
  email?: string;
  contact?: string;
}

export interface ClearanceRequest {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  year: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected' | 'cleared';
  dateSubmitted: string;
  dateUpdated?: string;
  remarks?: string;
  requirements?: string[];
}

export interface DashboardStats {
  totalStudents: number;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  approvalRate?: number;
  processingTime?: number;
  totalDepartments?: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
}

// ============================================================
// TABLE TYPES
// ============================================================

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

// ============================================================
// STUDENT TYPES
// ============================================================

export interface StudentDepartmentStatus {
  departmentId: string;
  departmentName: string;
  status: 'pending' | 'cleared' | 'rejected';
  dateUpdated: string;
  requirements: string[];
  remarks?: string;
}

export interface ClearanceStats {
  totalDepartments: number;
  cleared: number;
  pending: number;
  inProgress: number;
  progress: number;
}

// ============================================================
// FILTER TYPES
// ============================================================

export interface FilterOption {
  value: string;
  label: string;
}

// ============================================================
// NAVIGATION TYPES
// ============================================================

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: string | number;
  disabled?: boolean;
  children?: NavItem[];
}