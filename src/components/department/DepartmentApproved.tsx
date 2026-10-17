import React, { useState, useEffect } from 'react';
import type { Column, ClearanceRequest } from '../../types';
import Layout from '../layout/Layout';
import Table from '../common/Table';
import Button from '../common/Button';
import Panel from '../common/Panel';
import Badge from '../common/Badge';
import SearchBox from '../common/SearchBox';
import StatCard from '../common/StatCard';

interface DepartmentApprovedProps {
  departmentId?: string;
}

const DepartmentApproved: React.FC<DepartmentApprovedProps> = ({
  departmentId,
}) => {
  // ============================================================
  // STATE
  // ============================================================
  const [approvedStudents, setApprovedStudents] = useState<ClearanceRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================
  // STATS
  // ============================================================
  const stats = {
    totalApproved: approvedStudents.length,
    thisWeek: approvedStudents.filter((s) => {
      const date = new Date(s.dateSubmitted);
      const now = new Date();
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      return date >= weekAgo;
    }).length,
    avgProcessingTime: approvedStudents.length > 0 ? '1.4' : '0',
    latestApproval: approvedStudents.length > 0 ? approvedStudents[0].studentName : 'N/A',
  };

  // ============================================================
  // FETCH DATA
  // ============================================================
  useEffect(() => {
    const fetchApproved = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        setApprovedStudents([]);
      } catch (error) {
        console.error('Error fetching approved students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApproved();
  }, [departmentId]);

  // ============================================================
  // FILTERED STUDENTS
  // ============================================================
  const filteredStudents = approvedStudents.filter((student) => {
    const matchSearch =
      !searchTerm ||
      student.studentId.includes(searchTerm) ||
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCourse = courseFilter === 'all' || student.course === courseFilter;
    const matchYear = yearFilter === 'all' || student.year === yearFilter;

    return matchSearch && matchCourse && matchYear;
  });

  // ============================================================
  // TABLE COLUMNS
  // ============================================================
  const columns: Column<ClearanceRequest>[] = [
    { key: 'studentId', header: 'Student ID' },
    { key: 'studentName', header: 'Name' },
    { key: 'course', header: 'Course' },
    { key: 'year', header: 'Year Level' },
    { key: 'dateSubmitted', header: 'Date Approved' },
    {
      key: 'status',
      header: 'Status',
      render: () => <Badge variant="approved">Cleared</Badge>,
    },
    {
      key: 'remarks',
      header: 'Remarks',
      render: (item: ClearanceRequest) => item.remarks || '—',
    },
  ];

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleExport = async () => {
    try {
      alert('Export functionality will be implemented.');
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  const handleViewStudent = (student: ClearanceRequest) => {
    alert(`Viewing student: ${student.studentName}\nID: ${student.studentId}`);
  };

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading approved students...</p>
        </div>
      </Layout>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <Layout>
      <div className="department-page">
        <section className="page-header">
          <div className="page-header-text">
            <h2>Approved List</h2>
            <p>Students who have completed and been granted clearance.</p>
          </div>
          <div className="page-header-actions">
            <Button variant="ghost" onClick={handleExport}>
              ⬇ Export List
            </Button>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard
            label="Total Approved"
            value={stats.totalApproved}
            icon="✔"
            color="green"
            subtext="This month"
          />
          <StatCard
            label="Approved This Week"
            value={stats.thisWeek}
            icon="📅"
            color="blue"
            subtext="Last 7 days"
          />
          <StatCard
            label="Avg. Processing Time"
            value={`${stats.avgProcessingTime}d`}
            icon="⚡"
            color="orange"
            subtext="Days per request"
          />
          <StatCard
            label="Latest Approval"
            value={stats.latestApproval}
            icon="📌"
            color="purple"
            subtext="Most recent"
          />
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
            <option value="all">All Courses</option>
            <option value="BSIT">BSIT</option>
            <option value="BSED">BSED</option>
            <option value="CRIM">CRIM</option>
            <option value="BSPSY">BSPSY</option>
            <option value="BSA">BSA</option>
            <option value="BSHM">BSHM</option>
          </select>
          <select
            className="select-filter"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="all">All Year Levels</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </div>

        <Panel>
          <Table
            columns={columns}
            data={filteredStudents}
            onRowClick={(row) => handleViewStudent(row)}
            emptyMessage="No approved students found."
          />
          <div className="pagination">
            <span className="pagination-info">
              Showing {filteredStudents.length} of {approvedStudents.length} approved students
            </span>
          </div>
        </Panel>
      </div>
    </Layout>
  );
};

export default DepartmentApproved;