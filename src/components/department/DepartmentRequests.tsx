import React, { useState, useEffect } from 'react';
import type { Column, ClearanceRequest } from '../../types';
import { usePagination } from '../../hooks/usePagination';
import Layout from '../layout/Layout';
import Button from '../common/Button';
import Panel from '../common/Panel';
import Badge from '../common/Badge';
import Table from '../common/Table';
import SearchBox from '../common/SearchBox';
import FilterTabs from '../common/FilterTabs';
import Pagination from '../common/Pagination';

interface DepartmentRequestsProps {
  departmentId?: string;
}

const DepartmentRequests: React.FC<DepartmentRequestsProps> = ({
  departmentId,
}) => {
  // ============================================================
  // STATE
  // ============================================================
  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<ClearanceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================
  // FILTER TABS
  // ============================================================
  const filterTabs = [
    { key: 'all', label: 'All', count: requests.length },
    { key: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
    { key: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length },
    { key: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length },
  ];

  // ============================================================
  // FETCH DATA
  // ============================================================
  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        setRequests([]);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [departmentId]);

  // ============================================================
  // FILTER REQUESTS
  // ============================================================
  const filteredRequests = requests.filter(req => {
    const matchSearch = req.studentId?.includes(searchTerm) ||
                        req.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ============================================================
  // PAGINATION
  // ============================================================
  const {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    totalItems,
  } = usePagination(filteredRequests, 8);

  // ============================================================
  // TABLE COLUMNS
  // ============================================================
  const columns: Column<ClearanceRequest>[] = [
    { key: 'studentId', header: 'Student ID' },
    { key: 'studentName', header: 'Name' },
    { key: 'course', header: 'Course' },
    { key: 'year', header: 'Year Level' },
    { key: 'dateSubmitted', header: 'Requested Date' },
    {
      key: 'status',
      header: 'Status',
      render: (item) => {
        const variantMap = {
          pending: 'pending' as const,
          approved: 'approved' as const,
          rejected: 'rejected' as const,
          cleared: 'cleared' as const,
        };
        return <Badge variant={variantMap[item.status]}>{item.status}</Badge>;
      },
    },
    {
      key: 'id',
      header: 'Action',
      render: (item) => (
        <div className="row-actions">
          {item.status === 'pending' && (
            <>
              <Button variant="success" size="sm" onClick={() => handleApprove(item)}>
                ✔
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleReject(item)}>
                ✕
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => handleView(item)}>
            👁
          </Button>
        </div>
      ),
    },
  ];

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleApprove = (request: ClearanceRequest) => {
    if (confirm(`Approve clearance request for ${request.studentName}?`)) {
      setRequests(prev =>
        prev.map(req =>
          req.id === request.id ? { ...req, status: 'approved' as const } : req
        )
      );
      alert(`${request.studentName}'s request has been approved.`);
    }
  };

  const handleReject = (request: ClearanceRequest) => {
    if (confirm(`Reject clearance request for ${request.studentName}?`)) {
      setRequests(prev =>
        prev.map(req =>
          req.id === request.id ? { ...req, status: 'rejected' as const } : req
        )
      );
      alert(`${request.studentName}'s request has been rejected.`);
    }
  };

  const handleView = (request: ClearanceRequest) => {
    setSelectedRequest(request);
    alert(`Viewing request for: ${request.studentName}`);
  };

  const handleExport = () => {
    alert('Export functionality will be implemented.');
  };

  const handleStatusChange = (key: string) => {
    setStatusFilter(key);
  };

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading requests...</p>
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
        {/* ===== HEADER ===== */}
        <section className="page-header">
          <div className="page-header-text">
            <h2>Clearance Requests</h2>
            <p>Review, approve, and manage all student clearance requests.</p>
          </div>
          <div className="page-header-actions">
            <Button variant="ghost" onClick={handleExport}>
              ⬇ Export List
            </Button>
          </div>
        </section>

        {/* ===== FILTERS ===== */}
        <FilterTabs
          tabs={filterTabs}
          activeTab={statusFilter}
          onTabChange={handleStatusChange}
        />

        {/* ===== TOOLBAR ===== */}
        <div className="toolbar">
          <SearchBox
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name or Student ID..."
          />
        </div>

        {/* ===== TABLE ===== */}
        <Panel>
          <Table
            columns={columns}
            data={paginatedItems}
            onRowClick={(row) => setSelectedRequest(row)}
            emptyMessage="No requests found."
          />

          {filteredRequests.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
              totalItems={totalItems}
              pageSize={8}
            />
          )}
        </Panel>
      </div>
    </Layout>
  );
};

export default DepartmentRequests;