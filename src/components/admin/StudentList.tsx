import React, { useState, useEffect } from 'react';
import type { Student, Column } from '../../types';
import Layout from '../layout/Layout';
import Table from '../common/Table';
import Button from '../common/Button';
import Panel from '../common/Panel';
import Badge from '../common/Badge';
import SearchBox from '../common/SearchBox';

interface StudentListProps {
  departmentId?: string;
}

const StudentList: React.FC<StudentListProps> = ({ departmentId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
  }, [departmentId]);

  const filteredStudents = students.filter((student: Student) =>
    student.studentId.includes(searchTerm) ||
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<Student>[] = [
    { key: 'studentId', header: 'Student ID' },
    { key: 'name', header: 'Name' },
    { key: 'course', header: 'Course' },
    { key: 'year', header: 'Year Level' },
    {
      key: 'clearanceStatus',
      header: 'Status',
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
        return <Badge variant={variantMap[item.clearanceStatus]}>
          {labelMap[item.clearanceStatus]}
        </Badge>;
      },
    },
    {
      key: 'id',
      header: 'Action',
      render: (item: Student) => (
        <Button variant="ghost" size="sm" onClick={() => handleViewStudent(item)}>
          View
        </Button>
      ),
    },
  ];

  const handleViewStudent = (student: Student) => {
    alert(`Viewing student: ${student.name}\nID: ${student.studentId}`);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="admin-page">
        <section className="page-header">
          <div className="page-header-text">
            <h2>Student List</h2>
            <p>View all students and their clearance status.</p>
          </div>
        </section>

        <div className="toolbar">
          <SearchBox
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name or ID..."
          />
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

export default StudentList;