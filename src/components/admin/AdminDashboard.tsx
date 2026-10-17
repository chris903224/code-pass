import React, { useState, useEffect } from 'react';
import type { Column, ClearanceRequest, DashboardStats, Announcement } from '../../types';
import { adminService } from '../../services/admin.service';
import { usePagination } from '../../hooks/usePagination';
import Layout from '../layout/Layout';
import Button from '../common/Button';
import Panel from '../common/Panel';
import Badge from '../common/Badge';
import StatCard from '../common/StatCard';
import Table from '../common/Table';
import SearchBox from '../common/SearchBox';
import FilterTabs from '../common/FilterTabs';

const AdminDashboard: React.FC = () => {
  // ============================================================
  // STATE
  // ============================================================
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });

  const [requests, setRequests] = useState<ClearanceRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<ClearanceRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // FILTER TABS
  // ============================================================
  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  // ============================================================
  // FETCH DATA
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('🔍 Fetching dashboard data...');
        
        const [statsData, requestsData, announcementsData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getClearanceRequests(),
          adminService.getAnnouncements(),
        ]);

        console.log('✅ Stats:', statsData);
        console.log('✅ Requests:', requestsData.length);
        console.log('✅ Announcements:', announcementsData.length);

        setStats(statsData);
        setRequests(requestsData);
        setAnnouncements(announcementsData);
      } catch (err) {
        console.error('❌ Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        // Set default values para hindi mag-crash
        setStats({
          totalStudents: 0,
          totalRequests: 0,
          pendingRequests: 0,
          approvedRequests: 0,
          rejectedRequests: 0,
        });
        setRequests([]);
        setAnnouncements([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============================================================
  // FILTER REQUESTS
  // ============================================================
  const filteredRequests = requests.filter((req) => {
    const matchSearch =
      req.studentId?.includes(searchTerm) ||
      req.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
  const columns: Column<ClearanceRequest>[] = [
    { key: 'studentId', header: 'Student ID' },
    { key: 'studentName', header: 'Name' },
    { key: 'department', header: 'Department' },
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
    { key: 'dateSubmitted', header: 'Requested Date' },
  ];

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleView = () => {
    if (selectedRequest) {
      alert(`Viewing clearance request for: ${selectedRequest.studentName}`);
    } else {
      alert('Please select a request to view.');
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
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================
  if (error) {
    return (
      <Layout>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <Layout>
      <div className="admin-dashboard">
        {/* ===== HERO SECTION ===== */}
        <section className="hero">
          <div className="hero-bg" aria-hidden="true">
            <svg viewBox="0 0 700 260" preserveAspectRatio="xMaxYMax slice">
              <circle cx="560" cy="140" r="150" fill="#e4e9ff" />
              <rect x="470" y="70" width="26" height="190" fill="#c9d3fb" />
              <rect x="500" y="40" width="70" height="220" fill="#b7c3f7" />
              <rect x="574" y="90" width="46" height="170" fill="#c9d3fb" />
              <rect x="624" y="60" width="60" height="200" fill="#aebbf5" />
              <rect x="520" y="20" width="30" height="24" fill="#aebbf5" />
              <circle cx="535" cy="14" r="6" fill="#aebbf5" />
            </svg>
          </div>
          <div className="hero-text">
            <h2>
              Hello, Admin! <span className="wave">👋</span>
            </h2>
            <p>Manage and monitor the whole clearance system.</p>
            <div className="quick-actions">
              <button className="quick-card">
                <span className="quick-icon">📋</span>
                <span className="quick-copy">
                  <strong>Clearance Requests</strong>
                  <small>Manage requests</small>
                </span>
              </button>
              <button className="quick-card">
                <span className="quick-icon">🏛️</span>
                <span className="quick-copy">
                  <strong>Department</strong>
                  <small>Manage departments</small>
                </span>
              </button>
              <button className="quick-card">
                <span className="quick-icon">✅</span>
                <span className="quick-copy">
                  <strong>Approve List</strong>
                  <small>Pending approvals</small>
                </span>
              </button>
              <button className="quick-card">
                <span className="quick-icon">📈</span>
                <span className="quick-copy">
                  <strong>Report</strong>
                  <small>View reports</small>
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ===== STATS SECTION ===== */}
        <section className="stats-grid">
          <StatCard
            label="Total Students"
            value={stats.totalStudents}
            icon="👨‍🎓"
            color="blue"
            subtext="Registered"
          />
          <StatCard
            label="Approved Requests"
            value={stats.approvedRequests}
            icon="✔"
            color="green"
            subtext="This month"
          />
          <StatCard
            label="Rejected Requests"
            value={stats.rejectedRequests}
            icon="✖"
            color="red"
            subtext="This month"
          />
          <StatCard
            label="Pending Requests"
            value={stats.pendingRequests}
            icon="⏱"
            color="orange"
            subtext="For approval"
          />
        </section>

        {/* ===== CONTENT GRID ===== */}
        <div className="content-grid">
          {/* ===== REQUESTS PANEL ===== */}
          <Panel
            title="Recent Clearance Requests Overview"
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
            <FilterTabs
              tabs={filterTabs}
              activeTab={statusFilter}
              onTabChange={setStatusFilter}
            />

            <Table
              columns={columns}
              data={paginatedItems}
              onRowClick={(row) => setSelectedRequest(row)}
              emptyMessage="No clearance requests found."
            />

            {filteredRequests.length > 0 && (
              <div className="pagination">
                <span className="pagination-info">
                  Showing page {currentPage} of {totalPages}
                </span>
                <div className="pagination-controls">
                  <button
                    className="page-btn"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`page-btn ${page === currentPage ? 'active' : ''}`}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="page-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </Panel>

          {/* ===== SIDE COLUMN ===== */}
          <div className="side-col">
            <Panel title="📢 Recent Announcements">
              {announcements.length === 0 ? (
                <div className="panel-empty">
                  <span className="empty-icon">📭</span>
                  <p>No announcements available.</p>
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div key={announcement.id} className="announcement-item">
                    <div className="announcement-header">
                      <span className="announcement-author">
                        {announcement.author}
                      </span>
                      <span className="announcement-time">{announcement.date}</span>
                    </div>
                    <p>
                      <strong>{announcement.title}</strong>
                      <br />
                      {announcement.content}
                    </p>
                  </div>
                ))
              )}
              <a href="#" className="view-all-link">
                View All Announcements
              </a>
            </Panel>

            {/* ===== QUICK STATS ===== */}
            <Panel title="📊 Quick Stats">
              <div className="quick-stats">
                <div className="quick-stat-item">
                  <span className="quick-stat-label">Total Departments</span>
                  <span className="quick-stat-value">0</span>
                </div>
                <div className="quick-stat-item">
                  <span className="quick-stat-label">Approval Rate</span>
                  <span className="quick-stat-value">
                    {stats.totalRequests > 0
                      ? Math.round((stats.approvedRequests / stats.totalRequests) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="quick-stat-item">
                  <span className="quick-stat-label">Active Students</span>
                  <span className="quick-stat-value">{stats.totalStudents}</span>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;