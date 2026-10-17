import { supabase, TABLES } from '../lib/supabase';
import type { Department, Student, ClearanceRequest, Announcement, DashboardStats } from '../types';
import { 
  mapDepartmentFromDB, 
  mapDepartmentToDB,
  mapStudentFromDB,
  mapStudentToDB,
  mapClearanceRequestFromDB,
  mapClearanceRequestToDB,
  mapAnnouncementFromDB,
  mapAnnouncementToDB,
} from '../utils/mappers';

export const adminService = {
  // ============================================================
  // DASHBOARD STATS
  // ============================================================
  async getDashboardStats(): Promise<DashboardStats> {
    const [
      { count: totalStudents },
      { count: totalRequests },
      { count: pendingRequests },
      { count: approvedRequests },
      { count: rejectedRequests },
    ] = await Promise.all([
      supabase.from(TABLES.STUDENTS).select('*', { count: 'exact', head: true }),
      supabase.from(TABLES.CLEARANCE_REQUESTS).select('*', { count: 'exact', head: true }),
      supabase.from(TABLES.CLEARANCE_REQUESTS).select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase.from(TABLES.CLEARANCE_REQUESTS).select('*', { count: 'exact', head: true })
        .eq('status', 'approved'),
      supabase.from(TABLES.CLEARANCE_REQUESTS).select('*', { count: 'exact', head: true })
        .eq('status', 'rejected'),
    ]);

    return {
      totalStudents: totalStudents || 0,
      totalRequests: totalRequests || 0,
      pendingRequests: pendingRequests || 0,
      approvedRequests: approvedRequests || 0,
      rejectedRequests: rejectedRequests || 0,
    };
  },

  // ============================================================
  // DEPARTMENTS
  // ============================================================
  async getDepartments(): Promise<Department[]> {
    const { data, error } = await supabase
      .from(TABLES.DEPARTMENTS)
      .select('*')
      .order('name');

    if (error) throw error;
    return (data || []).map(mapDepartmentFromDB);
  },

  async createDepartment(department: Omit<Department, 'id'>): Promise<Department> {
    const { data, error } = await supabase
      .from(TABLES.DEPARTMENTS)
      .insert([mapDepartmentToDB(department)])
      .select()
      .single();

    if (error) throw error;
    return mapDepartmentFromDB(data);
  },

  async updateDepartment(id: string, department: Partial<Department>): Promise<Department> {
    const { data, error } = await supabase
      .from(TABLES.DEPARTMENTS)
      .update(mapDepartmentToDB(department))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapDepartmentFromDB(data);
  },

  async deleteDepartment(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.DEPARTMENTS)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================================
  // STUDENTS
  // ============================================================
  async getStudents(): Promise<Student[]> {
    const { data, error } = await supabase
      .from(TABLES.STUDENTS)
      .select('*')
      .order('name');

    if (error) throw error;
    return (data || []).map(mapStudentFromDB);
  },

  async createStudent(student: Omit<Student, 'id'>): Promise<Student> {
    const { data, error } = await supabase
      .from(TABLES.STUDENTS)
      .insert([mapStudentToDB(student)])
      .select()
      .single();

    if (error) throw error;
    return mapStudentFromDB(data);
  },

  async updateStudent(id: string, student: Partial<Student>): Promise<Student> {
    const { data, error } = await supabase
      .from(TABLES.STUDENTS)
      .update(mapStudentToDB(student))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapStudentFromDB(data);
  },

  async deleteStudent(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.STUDENTS)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================================
  // CLEARANCE REQUESTS
  // ============================================================
  async getClearanceRequests(): Promise<ClearanceRequest[]> {
    const { data, error } = await supabase
      .from(TABLES.CLEARANCE_REQUESTS)
      .select('*')
      .order('date_submitted', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapClearanceRequestFromDB);
  },

  async createClearanceRequest(request: Omit<ClearanceRequest, 'id'>): Promise<ClearanceRequest> {
    const { data, error } = await supabase
      .from(TABLES.CLEARANCE_REQUESTS)
      .insert([mapClearanceRequestToDB(request)])
      .select()
      .single();

    if (error) throw error;
    return mapClearanceRequestFromDB(data);
  },

  async updateClearanceRequest(id: string, request: Partial<ClearanceRequest>): Promise<ClearanceRequest> {
    const { data, error } = await supabase
      .from(TABLES.CLEARANCE_REQUESTS)
      .update(mapClearanceRequestToDB(request))
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapClearanceRequestFromDB(data);
  },

  async approveClearanceRequest(id: string, remarks?: string): Promise<ClearanceRequest> {
    return this.updateClearanceRequest(id, {
      status: 'approved',
      remarks: remarks || 'Approved',
      dateUpdated: new Date().toISOString(),
    });
  },

  async rejectClearanceRequest(id: string, remarks?: string): Promise<ClearanceRequest> {
    return this.updateClearanceRequest(id, {
      status: 'rejected',
      remarks: remarks || 'Rejected',
      dateUpdated: new Date().toISOString(),
    });
  },

  // ============================================================
  // ANNOUNCEMENTS
  // ============================================================
  async getAnnouncements(): Promise<Announcement[]> {
    const { data, error } = await supabase
      .from(TABLES.ANNOUNCEMENTS)
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapAnnouncementFromDB);
  },

  async createAnnouncement(announcement: Omit<Announcement, 'id'>): Promise<Announcement> {
    const { data, error } = await supabase
      .from(TABLES.ANNOUNCEMENTS)
      .insert([mapAnnouncementToDB(announcement)])
      .select()
      .single();

    if (error) throw error;
    return mapAnnouncementFromDB(data);
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const { error } = await supabase
      .from(TABLES.ANNOUNCEMENTS)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ============================================================
  // BULK IMPORT
  // ============================================================
  async importDepartments(departments: Omit<Department, 'id'>[]): Promise<Department[]> {
    const { data, error } = await supabase
      .from(TABLES.DEPARTMENTS)
      .insert(departments.map((d) => mapDepartmentToDB(d)))
      .select();

    if (error) throw error;
    return (data || []).map(mapDepartmentFromDB);
  },

  async importStudents(students: Omit<Student, 'id'>[]): Promise<Student[]> {
    const { data, error } = await supabase
      .from(TABLES.STUDENTS)
      .insert(students.map((s) => mapStudentToDB(s)))
      .select();

    if (error) throw error;
    return (data || []).map(mapStudentFromDB);
  },

  async importClearanceRequests(requests: Omit<ClearanceRequest, 'id'>[]): Promise<ClearanceRequest[]> {
    const { data, error } = await supabase
      .from(TABLES.CLEARANCE_REQUESTS)
      .insert(requests.map((r) => mapClearanceRequestToDB(r)))
      .select();

    if (error) throw error;
    return (data || []).map(mapClearanceRequestFromDB);
  },
};