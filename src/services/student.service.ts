import { supabase, TABLES } from '../lib/supabase';
import type { ClearanceStats, StudentDepartmentStatus } from '../types';
import { mapStudentDepartmentStatusFromDB } from '../utils/mappers';

export const studentService = {
  async getStudentClearanceStats(studentId: string): Promise<ClearanceStats> {
    const { data, error } = await supabase
      .from(TABLES.CLEARANCE_STATUS)
      .select('*')
      .eq('student_id', studentId);

    if (error) throw error;

    return {
      totalDepartments: data.length,
      cleared: data.filter((r: any) => r.status === 'cleared').length,
      pending: data.filter((r: any) => r.status === 'pending').length,
      inProgress: data.filter((r: any) => r.status === 'in_progress').length,
      progress: data.length > 0 
        ? Math.round((data.filter((r: any) => r.status === 'cleared').length / data.length) * 100) 
        : 0,
    };
  },

  async getStudentDepartments(studentId: string): Promise<StudentDepartmentStatus[]> {
    const { data, error } = await supabase
      .from(TABLES.CLEARANCE_STATUS)
      .select(`
        department_id,
        departments:department_id (name),
        status,
        date_updated,
        requirements,
        remarks
      `)
      .eq('student_id', studentId);

    if (error) throw error;
    return (data || []).map(mapStudentDepartmentStatusFromDB);
  },

  async getStudentRemarks(studentId: string) {
    const { data, error } = await supabase
      .from(TABLES.CLEARANCE_STATUS)
      .select(`
        departments:department_id (name),
        status,
        date_updated,
        remarks,
        requirements
      `)
      .eq('student_id', studentId)
      .order('date_updated', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => ({
      department: item.departments?.name || '',
      status: item.status,
      date: item.date_updated,
      remarks: item.remarks,
      requirements: item.requirements || [],
    }));
  },
};