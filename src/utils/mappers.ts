import type { 
  Department, 
  Student, 
  ClearanceRequest, 
  Announcement,
  StudentDepartmentStatus 
} from '../types';

// ============================================================
// DEPARTMENT MAPPER
// ============================================================
export const mapDepartmentFromDB = (data: any): Department => ({
  id: data.id,
  name: data.name,
  head: data.head,
  status: data.status,
  totalRequests: 0, // Will be calculated separately
  pending: 0,
  approved: 0,
  rejected: 0,
});

export const mapDepartmentToDB = (data: Partial<Department>) => {
  const result: any = {};
  if (data.name !== undefined) result.name = data.name;
  if (data.head !== undefined) result.head = data.head;
  if (data.status !== undefined) result.status = data.status;
  return result;
};

// ============================================================
// STUDENT MAPPER
// ============================================================
export const mapStudentFromDB = (data: any): Student => ({
  id: data.id,
  studentId: data.student_id,
  name: data.name,
  course: data.course,
  year: data.year,
  email: data.email,
  contact: data.contact,
  clearanceStatus: 'in-progress',
});

export const mapStudentToDB = (data: Partial<Student>) => {
  const result: any = {};
  if (data.studentId !== undefined) result.student_id = data.studentId;
  if (data.name !== undefined) result.name = data.name;
  if (data.course !== undefined) result.course = data.course;
  if (data.year !== undefined) result.year = data.year;
  if (data.email !== undefined) result.email = data.email;
  if (data.contact !== undefined) result.contact = data.contact;
  return result;
};

// ============================================================
// CLEARANCE REQUEST MAPPER
// ============================================================
export const mapClearanceRequestFromDB = (data: any): ClearanceRequest => ({
  id: data.id,
  studentId: data.student_id,
  studentName: data.student_name,
  course: data.course,
  year: data.year,
  department: data.department,
  status: data.status,
  dateSubmitted: data.date_submitted,
  dateUpdated: data.date_updated,
  remarks: data.remarks,
  requirements: data.requirements || [],
});

export const mapClearanceRequestToDB = (data: Partial<ClearanceRequest>) => {
  const result: any = {};
  if (data.studentId !== undefined) result.student_id = data.studentId;
  if (data.studentName !== undefined) result.student_name = data.studentName;
  if (data.course !== undefined) result.course = data.course;
  if (data.year !== undefined) result.year = data.year;
  if (data.department !== undefined) result.department = data.department;
  if (data.status !== undefined) result.status = data.status;
  if (data.dateSubmitted !== undefined) result.date_submitted = data.dateSubmitted;
  if (data.dateUpdated !== undefined) result.date_updated = data.dateUpdated;
  if (data.remarks !== undefined) result.remarks = data.remarks;
  if (data.requirements !== undefined) result.requirements = data.requirements;
  return result;
};

// ============================================================
// ANNOUNCEMENT MAPPER
// ============================================================
export const mapAnnouncementFromDB = (data: any): Announcement => ({
  id: data.id,
  title: data.title,
  content: data.content,
  author: data.author,
  date: data.date,
});

export const mapAnnouncementToDB = (data: Partial<Announcement>) => {
  const result: any = {};
  if (data.title !== undefined) result.title = data.title;
  if (data.content !== undefined) result.content = data.content;
  if (data.author !== undefined) result.author = data.author;
  if (data.date !== undefined) result.date = data.date;
  return result;
};

// ============================================================
// STUDENT DEPARTMENT STATUS MAPPER
// ============================================================
export const mapStudentDepartmentStatusFromDB = (data: any): StudentDepartmentStatus => ({
  departmentId: data.department_id,
  departmentName: data.departments?.name || '',
  status: data.status,
  dateUpdated: data.date_updated,
  requirements: data.requirements || [],
  remarks: data.remarks,
});