import React, { useState, useEffect } from 'react';
import type { Column } from '../../types';
import Layout from '../layout/Layout';
import Table from '../common/Table';
import Button from '../common/Button';
import Panel from '../common/Panel';
import Badge from '../common/Badge';
import SearchBox from '../common/SearchBox';
import FilterTabs from '../common/FilterTabs';

interface Remark {
  id: string;
  department: string;
  date: string;
  status: 'cleared' | 'pending' | 'rejected';
  remarks: string;
  requirements?: string[];
}

interface StudentRemarksProps {
  studentId?: string;
}

const StudentRemarks: React.FC<StudentRemarksProps> = ({
  studentId,
}) => {
  // ============================================================
  // STATE
  // ============================================================
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================
  // FILTER TABS
  // ============================================================
  const statusTabs = [
    { key: 'all', label: 'All' },
    { key: 'cleared', label: 'Cleared' },
    { key: 'pending', label: 'Pending' },
    { key: 'rejected', label: 'Rejected' },
  ];

  // ============================================================
  // FETCH DATA
  // ============================================================
  useEffect(() => {
    const fetchRemarks = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        setRemarks([]);
      } catch (error) {
        console.error('Error fetching remarks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRemarks();
  }, [studentId]);

  // ============================================================
  // FILTERED REMARKS
  // ============================================================
  const filteredRemarks = remarks.filter((remark) => {
    const matchStatus = statusFilter === 'all' || remark.status === statusFilter;
    const matchSearch =
      !searchTerm ||
      remark.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      remark.remarks.toLowerCase().includes(searchTerm.toLowerCase());

    return matchStatus && matchSearch;
  });

  // ============================================================
  // TABLE COLUMNS
  // ============================================================
  const columns: Column<Remark>[] = [
    {
      key: 'department',
      header: 'Department',
      render: (item: Remark) => <strong>{item.department}</strong>,
    },
    { key: 'date', header: 'Date' },
    {
      key: 'status',
      header: 'Status',
      render: (item: Remark) => {
        const variantMap = {
          cleared: 'approved' as const,
          pending: 'pending' as const,
          rejected: 'rejected' as const,
        };
        return <Badge variant={variantMap[item.status]}>{item.status}</Badge>;
      },
    },
    { key: 'remarks', header: 'Remarks' },
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

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading remarks...</p>
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
            <h2>View Remarks</h2>
            <p>Review feedback and remarks from different departments regarding your clearance.</p>
          </div>
          <div className="page-header-actions">
            <Button variant="ghost" onClick={handleExport}>
              ⬇ Export Remarks
            </Button>
          </div>
        </section>

        <FilterTabs
          tabs={statusTabs}
          activeTab={statusFilter}
          onTabChange={setStatusFilter}
        />

        <div className="toolbar">
          <SearchBox
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by department or remarks..."
          />
        </div>

        <Panel>
          <Table
            columns={columns}
            data={filteredRemarks}
            onRowClick={() => {}}
            emptyMessage="No remarks found."
          />
          <div className="pagination">
            <span className="pagination-info">
              Showing {filteredRemarks.length} of {remarks.length} remarks
            </span>
          </div>
        </Panel>
      </div>
    </Layout>
  );
};

export default StudentRemarks;