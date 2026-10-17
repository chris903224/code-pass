import React, { useState, useEffect } from 'react';
import type { Column, StudentDepartmentStatus, ClearanceStats } from '../../types';
import Layout from '../layout/Layout';
import Table from '../common/Table';
import Button from '../common/Button';
import Panel from '../common/Panel';
import Badge from '../common/Badge';
import StatCard from '../common/StatCard';

interface StudentClearanceProps {
  studentId?: string;
}

const StudentClearance: React.FC<StudentClearanceProps> = ({
  studentId,
}) => {
  // ============================================================
  // STATE
  // ============================================================
  const [departments, setDepartments] = useState<StudentDepartmentStatus[]>([]);
  const [stats, setStats] = useState<ClearanceStats>({
    totalDepartments: 0,
    cleared: 0,
    pending: 0,
    inProgress: 0,
    progress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================
  // FETCH DATA
  // ============================================================
  useEffect(() => {
    const fetchClearance = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API calls
        setDepartments([]);
        setStats({
          totalDepartments: 0,
          cleared: 0,
          pending: 0,
          inProgress: 0,
          progress: 0,
        });
      } catch (error) {
        console.error('Error fetching clearance data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClearance();
  }, [studentId]);

  // ============================================================
  // TABLE COLUMNS
  // ============================================================
  const columns: Column<StudentDepartmentStatus>[] = [
    {
      key: 'departmentName',
      header: 'Department',
      render: (item: StudentDepartmentStatus) => <strong>{item.departmentName}</strong>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: StudentDepartmentStatus) => {
        const variantMap = {
          cleared: 'approved' as const,
          pending: 'pending' as const,
          rejected: 'rejected' as const,
        };
        return <Badge variant={variantMap[item.status]}>{item.status}</Badge>;
      },
    },
    { key: 'dateUpdated', header: 'Date Updated' },
    {
      key: 'requirements',
      header: 'Requirements',
      render: (item: StudentDepartmentStatus) => (
        <span>
          {item.requirements && item.requirements.length > 0
            ? item.requirements.join(', ')
            : 'No requirements'}
        </span>
      ),
    },
    {
      key: 'departmentId',
      header: 'Action',
      render: (item: StudentDepartmentStatus) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDepartment(item)}
        >
          View
        </Button>
      ),
    },
  ];

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleViewDepartment = (department: StudentDepartmentStatus) => {
    alert(`Viewing department: ${department.departmentName}\nStatus: ${department.status}`);
  };

  const handlePrint = async () => {
    try {
      window.print();
    } catch (error) {
      console.error('Error printing:', error);
      alert('Failed to print clearance.');
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading clearance data...</p>
        </div>
      </Layout>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <Layout>
      <div className="student-page">
        <section className="page-header">
          <div className="page-header-text">
            <h2>My Clearance</h2>
            <p>Detailed view of your clearance status across all departments.</p>
          </div>
          <div className="page-header-actions">
            <Button variant="primary" onClick={handlePrint}>
              🖨️ Print Clearance
            </Button>
          </div>
        </section>

        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-4">
            <StatCard
              label="Cleared"
              value={stats.cleared}
              icon="✔"
              color="green"
              subtext="Departments"
            />
          </div>
          <div className="col-6 col-lg-4">
            <StatCard
              label="Pending"
              value={stats.pending}
              icon="⏳"
              color="orange"
              subtext="Departments"
            />
          </div>
          <div className="col-12 col-lg-4">
            <StatCard
              label="Overall Progress"
              value={stats.progress > 0 ? `${stats.progress}%` : '0%'}
              icon="📊"
              color="blue"
              subtext={`${stats.cleared} of ${stats.totalDepartments} cleared`}
            />
          </div>
        </div>

        <Panel title="Department Clearance Details">
          <Table
            columns={columns}
            data={departments}
            onRowClick={(row) => handleViewDepartment(row)}
            emptyMessage="No departments added yet."
          />
          <div className="pagination">
            <span className="pagination-info">
              Showing {departments.length} of {departments.length} departments
            </span>
          </div>
        </Panel>
      </div>
    </Layout>
  );
};

export default StudentClearance;