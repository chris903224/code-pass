import React, { useState, useEffect } from 'react';
import type { ClearanceRequest } from '../../types';
import { usePagination } from '../../hooks/usePagination';
import Layout from '../layout/Layout';
import StatCard from '../common/StatCard';
import Table from '../common/Table';
import SearchBox from '../common/SearchBox';
import Button from '../common/Button';
import Panel from '../common/Panel';
import Badge from '../common/Badge';

interface DepartmentStats {
  departmentName: string;
  departmentHead: string;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  approvalRate: number;
}

const DepartmentDashboard: React.FC = () => {
  // ============================================================
  // STATE
  // ============================================================
  const [stats, setStats] = useState<DepartmentStats>({
    departmentName: 'IT Department',
    departmentHead: 'Dr. Reyes',
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    approvalRate: 0,
  });

  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ClearanceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================
  // FETCH DATA
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API calls
        setStats({
          departmentName: 'IT Department',
          departmentHead: 'Dr. Reyes',
          totalRequests: 0,
          pendingRequests: 0,
          approvedRequests: 0,
          rejectedRequests: 0,
          approvalRate: 0,
        });
        setRequests([]);
      } catch (error) {
        console.error('Error fetching department data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============================================================
  // FILTERED REQUESTS
  // ============================================================
  const filteredRequests = requests.filter(
    (req) =>
      req.studentId?.includes(searchTerm) ||
      req.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============================================================
  // PAGINATION
  // ============================================================
  const { paginatedItems, currentPage, totalPages, goToPage } = usePagination(
    filteredRequests,
    5
  );

  // ============================================================
  // TABLE COLUMNS
  // ============================================================
  const columns = [
    { key: 'studentId', header: 'Student ID' },
    { key: 'studentName', header: 'Name' },
    { key: 'course', header: 'Course' },
    { key: 'year', header: 'Year Level' },
    { key: 'dateSubmitted', header: 'Requested Date' },
    {
      key: 'status',
      header: 'Status',
      render: (item: ClearanceRequest) => {
        const variantMap = {
          pending: 'pending' as const,
          approved: 'approved' as const,
          rejected: 'rejected' as const,
          cleared: 'cleared' as const,
        };
        return <Badge variant={variantMap[item.status]}>{item.status}</Badge>;
      },
    },
  ];

  // ============================================================
  // HANDLERS - FIXED
  // ============================================================
  const handleApprove = () => {
    if (!selectedRequest) {
      alert('Please select a request to approve.');
      return;
    }
    if (confirm(`Approve clearance request for ${selectedRequest.studentName}?`)) {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id
            ? { ...req, status: 'approved' as const }
            : req
        )
      );
      alert(`${selectedRequest.studentName}'s request has been approved.`);
      setSelectedRequest(null);
    }
  };

  const handleReject = () => {
    if (!selectedRequest) {
      alert('Please select a request to reject.');
      return;
    }
    if (confirm(`Reject clearance request for ${selectedRequest.studentName}?`)) {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id
            ? { ...req, status: 'rejected' as const }
            : req
        )
      );
      alert(`${selectedRequest.studentName}'s request has been rejected.`);
      setSelectedRequest(null);
    }
  };

  const handleView = () => {
    if (selectedRequest) {
      alert(`Viewing clearance request for: ${selectedRequest.studentName}`);
    } else {
      alert('Please select a request to view.');
    }
  };

  const handleAddRemarks = () => {
    if (!selectedRequest) {
      alert('Please select a request to add remarks.');
      return;
    }
    const remark = prompt(`Add a remark for ${selectedRequest.studentName}:`);
    if (remark && remark.trim()) {
      alert(`Remark saved for ${selectedRequest.studentName}: "${remark}"`);
    }
  };

  const handleRowClick = (row: ClearanceRequest) => {
    setSelectedRequest(row);
  };

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (isLoading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <Layout>
      <div className="department-dashboard">
        {/* ===== HERO ===== */}
        <section className="hero">
          <div className="hero-text">
            <h2>
              Hello, {stats.departmentName}! <span className="wave">👋</span>
            </h2>
            <p>Manage and process student clearance requests for your department.</p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <svg viewBox="0 0 260 150" width="230">
              <circle cx="130" cy="75" r="70" fill="#e9edff" />
              <rect x="20" y="70" width="60" height="70" fill="#3b5bdb" opacity=".85" />
              <rect x="90" y="40" width="70" height="100" fill="#2f4bc4" />
              <rect x="170" y="60" width="55" height="80" fill="#4c6ef5" opacity=".85" />
              <circle cx="105" cy="55" r="14" fill="#ffd8a8" />
              <rect x="92" y="70" width="26" height="45" rx="10" fill="#1f2d5c" />
              <circle cx="150" cy="60" r="13" fill="#ffe3c9" />
              <rect x="138" y="74" width="24" height="42" rx="10" fill="#845ef7" />
            </svg>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="stats-grid">
          <StatCard
            label="Total Requests"
            value={stats.totalRequests}
            icon="📋"
            color="blue"
            subtext="This month"
          />
          <StatCard
            label="Pending Requests"
            value={stats.pendingRequests}
            icon="⏱"
            color="orange"
            subtext="For approval"
          />
          <StatCard
            label="Approved Requests"
            value={stats.approvedRequests}
            icon="✅"
            color="green"
            subtext="This month"
          />
          <StatCard
            label="Rejected Requests"
            value={stats.rejectedRequests}
            icon="❌"
            color="red"
            subtext="This month"
          />
        </section>

        {/* ===== CONTENT GRID ===== */}
        <div className="content-grid">
          <Panel
            title="Pending Clearance Requests"
            actions={
              <div className="panel-toolbar">
                <SearchBox
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Search Student ID..."
                />
                <Button variant="primary" onClick={handleView}>
                  View
                </Button>
              </div>
            }
          >
            <Table
              columns={columns}
              data={paginatedItems}
              onRowClick={handleRowClick}
              emptyMessage="No pending requests found."
            />
            {filteredRequests.length > 0 && (
              <div className="pagination">
                <span className="pagination-info">
                  Showing page {currentPage} of {totalPages}
                </span>
                <div className="pagination-controls">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`page-btn ${page === currentPage ? 'active' : ''}`}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Panel>

          {/* ===== SIDE COLUMN ===== */}
          <div className="side-col">
            <Panel title="Quick Actions">
              <div className="quick-buttons">
                <Button
                  variant="success"
                  fullWidth
                  onClick={handleApprove}
                  disabled={!selectedRequest}
                >
                  <span className="quick-icon">✅</span> Approve Request
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={handleReject}
                  disabled={!selectedRequest}
                >
                  <span className="quick-icon">❌</span> Reject Request
                </Button>
              </div>
              <Button
                variant="secondary"
                fullWidth
                onClick={handleAddRemarks}
                disabled={!selectedRequest}
                className="remarks-btn"
              >
                <span className="remarks-icon">📝</span>
                <span className="remarks-text">
                  <strong>Add Remarks</strong>
                  <small>Add remarks for selected request</small>
                </span>
              </Button>
            </Panel>

            <Panel title="Department Information">
              <div className="department-info">
                <div className="info-item">
                  <span className="info-label">Department</span>
                  <span className="info-value">{stats.departmentName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Department Head</span>
                  <span className="info-value">{stats.departmentHead}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Approval Rate</span>
                  <span className="info-value">{stats.approvalRate}%</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Processed</span>
                  <span className="info-value">
                    {stats.approvedRequests + stats.rejectedRequests}
                  </span>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DepartmentDashboard;