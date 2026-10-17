import React, { useState, useEffect } from 'react';
import type { Student, Column, FilterOption } from '../../types';
import Layout from '../layout/Layout';
import Table from '../common/Table';
import Button from '../common/Button';
import Panel from '../common/Panel';
import Badge from '../common/Badge';
import SearchBox from '../common/SearchBox';

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const courses: FilterOption[] = [
    { value: 'all', label: 'All Courses' },
    { value: 'BSIT', label: 'BSIT' },
    { value: 'BSED', label: 'BSED' },
    { value: 'CRIM', label: 'CRIM' },
    { value: 'BSPSY', label: 'BSPSY' },
    { value: 'BSA', label: 'BSA' },
    { value: 'BSHM', label: 'BSHM' },
  ];

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        setStudents([]);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student: Student) => {
    const matchSearch = student.studentId.includes(searchTerm) ||
                        student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCourse = courseFilter === 'all' || student.course === courseFilter;
    return matchSearch && matchCourse;
  });

  const columns: Column<Student>[] = [
    { key: 'studentId', header: 'Student ID' },
    { key: 'name', header: 'Name' },
    { key: 'course', header: 'Course' },
    { key: 'year', header: 'Year Level' },
    {
      key: 'clearanceStatus',
      header: 'Clearance Status',
      render: (item: Student) => {
        const variantMap: Record<string, 'approved' | 'pending' | 'rejected'> = {
          'cleared': 'approved',
          'in-progress': 'pending',
          'rejected': 'rejected',
        };
        const labelMap: Record<string, string> = {
          'cleared': 'Cleared',
          'in-progress': 'In Progress',
          'rejected': 'Rejected',
        };
        return (
          <Badge variant={variantMap[item.clearanceStatus]}>
            {labelMap[item.clearanceStatus]}
          </Badge>
        );
      },
    },
    {
      key: 'id',
      header: 'Action',
      render: (item: Student) => (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleViewStudent(item)}
        >
          View
        </Button>
      ),
    },
  ];

  const handleViewStudent = (student: Student) => {
    console.log('Viewing student:', student);
  };

  const handleExport = async () => {
    try {
      alert('Export functionality will be implemented.');
    } catch (error) {
      console.error('Error exporting students:', error);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading students...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-page">
        <section className="page-header">
          <div className="page-header-text">
            <h2>Students</h2>
            <p>View and manage all registered students.</p>
          </div>
          <div className="page-header-actions">
            <Button variant="ghost" onClick={handleExport}>
              ⬇ Export List
            </Button>
          </div>
        </section>

        <div className="toolbar">
          <SearchBox
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name or ID..."
          />
          <select
            className="select-filter"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            {courses.map((course) => (
              <option key={course.value} value={course.value}>
                {course.label}
              </option>
            ))}
          </select>
        </div>

        <Panel>
          <Table
            columns={columns}
            data={filteredStudents}
            onRowClick={() => {}}
            emptyMessage="No students found."
          />
          <div className="pagination">
            <span className="pagination-info">
              Showing {filteredStudents.length} of {students.length} students
            </span>
          </div>
        </Panel>
      </div>
    </Layout>
  );
};

export default AdminStudents;