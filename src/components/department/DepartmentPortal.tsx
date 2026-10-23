import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// ============================================================
// TYPES
// ============================================================
interface ClearanceRequest {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  year: string;
  dateSubmitted: string;
  status: 'pending' | 'approved' | 'rejected' | 'cleared';
  remarks?: string;
}

interface DepartmentStats {
  departmentName: string;
  departmentHead: string;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  approvalRate: number;
}

// ============================================================
// MOCK DATA
// ============================================================
const INITIAL_REQUESTS: ClearanceRequest[] = [
  { id: '1', studentId: '2023-001', studentName: 'Alice Johnson', course: 'BSIT', year: '4th Year', dateSubmitted: '2026-10-15', status: 'pending' },
  { id: '2', studentId: '2023-045', studentName: 'Bob Smith', course: 'BSED', year: '3rd Year', dateSubmitted: '2026-10-14', status: 'pending' },
  { id: '3', studentId: '2022-112', studentName: 'Charlie Brown', course: 'CRIM', year: '4th Year', dateSubmitted: '2026-10-10', status: 'approved', remarks: 'All clear' },
  { id: '4', studentId: '2024-008', studentName: 'Diana Prince', course: 'BSPSY', year: '2nd Year', dateSubmitted: '2026-10-12', status: 'pending' },
  { id: '5', studentId: '2021-099', studentName: 'Evan Wright', course: 'BSIT', year: '4th Year', dateSubmitted: '2026-10-08', status: 'rejected', remarks: 'Missing lab equipment' },
];

// ============================================================
// REUSABLE UI COMPONENTS
// ============================================================
const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }: any) => {
  const baseClass = `btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${className}`;
  return <button className={baseClass} {...props}>{children}</button>;
};

const Badge = ({ variant, children }: { variant: string, children: React.ReactNode }) => (
  <span className={`badge ${variant}`}>{children}</span>
);

const StatCard = ({ label, value, icon, color, subtext }: any) => (
  <div className="stat-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
      <div style={{ fontSize: '24px', background: 'var(--bg-base)', padding: '8px', borderRadius: '50%', boxShadow: 'var(--clay-shadow-in)' }}>{icon}</div>
    </div>
    <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1 }}>{value}</div>
    <div style={{ fontSize: '12px', color: 'var(--text-faint)' }}>{subtext}</div>
  </div>
);

const Panel = ({ title, children, actions, className = '' }: any) => (
  <div className={`panel ${className}`}>
    {(title || actions) && (
      <div className="panel-header">
        {title && <h3 className="panel-title">{title}</h3>}
        {actions && <div>{actions}</div>}
      </div>
    )}
    {children}
  </div>
);

const SearchBox = ({ value, onChange, placeholder }: any) => (
  <div className="search-box">
    <span className="search-icon">🔍</span>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

const Table = ({ columns, data, emptyMessage }: any) => {
  if (!data || data.length === 0) return <div className="empty-message">{emptyMessage}</div>;
  return (
    <div className="table-responsive">
      <table>
        <thead>
          <tr>{columns.map((col: any) => <th key={col.key}>{col.header}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row: any) => (
            <tr key={row.id}>
              {columns.map((col: any) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const DepartmentPortal: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); 

  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'approved' | 'reports'>('dashboard');
  const [requests, setRequests] = useState<ClearanceRequest[]>(() => {
    const saved = localStorage.getItem('clearance_requests');
    return saved ? JSON.parse(saved) : INITIAL_REQUESTS;
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<ClearanceRequest | null>(null);
  const [editStatus, setEditStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [editRemark, setEditRemark] = useState('');

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setTimeout(() => setIsLoading(false), 800); }, []);
  useEffect(() => { localStorage.setItem('clearance_requests', JSON.stringify(requests)); }, [requests]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- DERIVED STATS ---
  const stats: DepartmentStats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    return {
      departmentName: 'IT Department',
      departmentHead: 'Dr. Reyes',
      totalRequests: total,
      pendingRequests: pending,
      approvedRequests: approved,
      rejectedRequests: rejected,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    };
  }, [requests]);

  const recentNotifications = useMemo(() => {
    return requests.slice(0, 5).map(req => ({
      id: req.id,
      title: req.status === 'pending' ? `New request from ${req.studentName}` : `${req.studentName}'s request was ${req.status}`,
      time: req.dateSubmitted,
      icon: req.status === 'pending' ? '⏳' : req.status === 'approved' ? '✅' : '❌'
    }));
  }, [requests]);

  // --- FILTERING LOGIC ---
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchSearch = req.studentId.toLowerCase().includes(searchTerm.toLowerCase()) || req.studentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchCourse = courseFilter === 'all' || req.course === courseFilter;
      return matchSearch && matchStatus && matchCourse;
    });
  }, [requests, searchTerm, statusFilter, courseFilter]);

  // --- HANDLERS ---
  const handleApprove = (request: ClearanceRequest) => {
    if (window.confirm(`Approve clearance for ${request.studentName}?`)) {
      setRequests(prev => prev.map(req => req.id === request.id ? { ...req, status: 'approved', remarks: req.remarks || 'Approved by Department' } : req));
    }
  };

  const handleReject = (request: ClearanceRequest) => {
    if (window.confirm(`Reject clearance for ${request.studentName}?`)) {
      setRequests(prev => prev.map(req => req.id === request.id ? { ...req, status: 'rejected', remarks: req.remarks || 'Rejected by Department' } : req));
    }
  };

  const openEditModal = (request: ClearanceRequest) => {
    setEditingRequest(request);
    setEditStatus(request.status as 'pending' | 'approved' | 'rejected');
    setEditRemark(request.remarks || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingRequest) return;
    setRequests(prev => prev.map(req => req.id === editingRequest.id ? { ...req, status: editStatus, remarks: editRemark } : req));
    setIsEditModalOpen(false);
    setEditingRequest(null);
  };

  const handleExportCSV = (dataToExport: ClearanceRequest[], filenamePrefix: string) => {
    if (dataToExport.length === 0) return alert("No data available to export.");
    const headers = ['Student ID', 'Name', 'Course', 'Year', 'Date Submitted', 'Status', 'Remarks'];
    const csvRows = dataToExport.map(req => [req.studentId, `"${req.studentName}"`, req.course, req.year, req.dateSubmitted, req.status.toUpperCase(), `"${req.remarks || ''}"`]);
    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        if (logout) await logout();
        else { localStorage.removeItem('token'); localStorage.removeItem('user'); }
        navigate('/login', { replace: true });
      } catch (error) { console.error("Logout failed:", error); }
    }
  };

  const baseColumns = [
    { key: 'studentId', header: 'Student ID' },
    { key: 'studentName', header: 'Name' },
    { key: 'course', header: 'Course' },
    { key: 'year', header: 'Year' },
    { key: 'dateSubmitted', header: 'Date' },
    { key: 'status', header: 'Status', render: (item: ClearanceRequest) => <Badge variant={item.status}>{item.status}</Badge> }
  ];

  const actionColumn = {
    key: 'actions',
    header: 'Actions',
    render: (item: ClearanceRequest) => (
      <div className="row-actions">
        {item.status === 'pending' ? (
          <>
            <Button variant="success" size="sm" onClick={() => handleApprove(item)}>✔</Button>
            <Button variant="danger" size="sm" onClick={() => handleReject(item)}>✕</Button>
          </>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>📝 Edit</Button>
        )}
      </div>
    )
  };

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId as any);
    setSearchTerm('');
    setStatusFilter('all');
    setCourseFilter('all');
  };

  if (isLoading) return <div className="loading-container" style={{ height: '100vh' }}><div className="spinner"></div></div>;

  // ============================================================
  // VIEWS
  // ============================================================

  const renderDashboard = () => (
    <>
      <section className="hero">
        <div className="hero-text">
          <h2>Hello, {stats.departmentName}! <span className="wave">👋</span></h2>
          <p>Manage and process student clearance requests for your department.</p>
        </div>
        <div className="hero-art">
          <svg viewBox="0 0 260 150" width="230">
            <circle cx="130" cy="75" r="70" fill="rgba(255,255,255,0.4)" />
            <rect x="20" y="70" width="60" height="70" rx="12" fill="#3b5bdb" opacity=".85" />
            <rect x="90" y="40" width="70" height="100" rx="16" fill="#2f4bc4" />
            <rect x="170" y="60" width="55" height="80" rx="12" fill="#4c6ef5" opacity=".85" />
            <circle cx="105" cy="55" r="14" fill="#ffd8a8" />
            <rect x="92" y="70" width="26" height="45" rx="10" fill="#1f2d5c" />
            <circle cx="150" cy="60" r="13" fill="#ffe3c9" />
            <rect x="138" y="74" width="24" height="42" rx="10" fill="#845ef7" />
          </svg>
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="Total Requests" value={stats.totalRequests} icon="📋" subtext="All time" />
        <StatCard label="Pending Requests" value={stats.pendingRequests} icon="⏱" subtext="Needs action" />
        <StatCard label="Approved Requests" value={stats.approvedRequests} icon="✅" subtext="Cleared students" />
        <StatCard label="Rejected Requests" value={stats.rejectedRequests} icon="❌" subtext="Requires follow-up" />
      </section>

      <div style={{ marginTop: '24px' }}>
        <Panel title="Recent Clearance Requests" actions={<Button variant="primary" onClick={() => handleNavClick('requests')}>View All</Button>}>
          <Table columns={[...baseColumns, actionColumn]} data={filteredRequests.slice(0, 5)} emptyMessage="No requests found." />
        </Panel>
      </div>
    </>
  );

  const renderRequests = () => (
    <>
      <section className="page-header">
        <div className="page-header-text"><h2>Clearance Requests</h2><p>Review, approve, and manage all student requests.</p></div>
        <Button variant="ghost" onClick={() => handleExportCSV(filteredRequests, 'Clearance_Requests')}>⬇ Export List</Button>
      </section>
      <Panel>
        <div className="toolbar">
          <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Search by name or Student ID..." />
          <select className="select-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <Table columns={[...baseColumns, actionColumn]} data={filteredRequests} emptyMessage="No requests match your filters." />
      </Panel>
    </>
  );

  const renderApproved = () => {
    const approvedOnly = filteredRequests.filter(r => r.status === 'approved');
    const approvedColumns = [
      ...baseColumns,
      { key: 'remarks', header: 'Remarks', render: (item: ClearanceRequest) => item.remarks || '—' },
    ];
    return (
      <>
        <section className="page-header">
          <div className="page-header-text"><h2>Approved List</h2><p>Students who have completed clearance.</p></div>
          <Button variant="ghost" onClick={() => handleExportCSV(approvedOnly, 'Approved_Students')}>⬇ Export List</Button>
        </section>
        <Panel><Table columns={approvedColumns} data={approvedOnly} emptyMessage="No approved students found." /></Panel>
      </>
    );
  };

  // ============================================================
  // REPORTS VIEW (WITH CHARTS)
  // ============================================================
  const renderReports = () => {
    const courseCounts = requests.reduce((acc: any, req) => {
      acc[req.course] = (acc[req.course] || 0) + 1;
      return acc;
    }, {});
    const maxCourseCount = Math.max(...Object.values(courseCounts), 1) as number;

    const total = requests.length || 1;
    const clearedPercent = (stats.approvedRequests / total) * 100;
    const pendingPercent = (stats.pendingRequests / total) * 100;
    const rejectedPercent = (stats.rejectedRequests / total) * 100;

    return (
      <>
        <section className="page-header">
          <div className="page-header-text">
            <h2>Report & Analytics</h2>
            <p>Insights and trends on clearance activity.</p>
          </div>
          <div className="page-header-actions" style={{ display: 'flex', gap: '12px' }}>
            <select className="select-filter">
              <option>This Semester</option>
              <option>This Month</option>
            </select>
            <Button variant="primary" onClick={() => handleExportCSV(requests, 'Full_Clearance_Report')}>⬇ Download Report</Button>
          </div>
        </section>

        <section className="stats-grid">
          <StatCard label="Total Requests" value={stats.totalRequests} icon="📋" subtext="This Semester" />
          <StatCard label="Approval Rate" value={`${stats.approvalRate}%`} icon="📈" subtext={`${stats.approvedRequests} of ${stats.totalRequests} requests`} />
          <StatCard label="Avg. Processing Time" value="1.4d" icon="⚡" subtext="From request to decision" />
          <StatCard label="Rejection Rate" value={`${stats.totalRequests > 0 ? Math.round((stats.rejectedRequests / stats.totalRequests) * 100) : 0}%`} icon="📉" subtext={`${stats.rejectedRequests} of ${stats.totalRequests} requests`} />
        </section>

        <div className="report-grid">
          {/* REQUESTS BY COURSE (BAR CHART) */}
          <Panel title="Requests by Course">
            <p className="chart-sub" style={{ marginBottom: '24px' }}>Number of clearance requests by course.</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px', padding: '0 20px' }}>
              {Object.entries(courseCounts).map(([course, count]: any) => (
                <div key={course} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>{count}</span>
                  <div style={{ 
                    width: '100%', 
                    height: `${(count / maxCourseCount) * 150}px`, 
                    background: 'linear-gradient(180deg, #4c6ef5, #3b5bdb)', 
                    borderRadius: '8px 8px 0 0',
                    boxShadow: '0 4px 10px rgba(59, 91, 219, 0.3)'
                  }} />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 600 }}>{course}</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* STATUS BREAKDOWN (DONUT CHART) */}
          <Panel title="Status Breakdown">
            <p className="chart-sub" style={{ marginBottom: '24px' }}>Current standing of all requests.</p>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              
              <div style={{
                width: '180px', height: '180px', borderRadius: '50%',
                background: `conic-gradient(
                  #20c997 0% ${clearedPercent}%, 
                  #fcc419 ${clearedPercent}% ${clearedPercent + pendingPercent}%, 
                  #ff6b6b ${clearedPercent + pendingPercent}% 100%
                )`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--clay-shadow-out)',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '120px', height: '120px', borderRadius: '50%', background: '#fff',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.05)'
                }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-dark)' }}>{stats.totalRequests}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#20c997' }} />
                  Cleared ({stats.approvedRequests})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#fcc419' }} />
                  Pending ({stats.pendingRequests})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#ff6b6b' }} />
                  Rejected ({stats.rejectedRequests})
                </div>
              </div>

            </div>
          </Panel>
        </div>
      </>
    );
  };

  // ============================================================
  // MAIN LAYOUT
  // ============================================================
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-family)' }}>
      
      <aside style={{ width: '280px', padding: '24px 20px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '8px', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '24px' }}>
          <div style={{ width: '42px', height: '42px', background: 'var(--blue-primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px' }}>🛡️</div>
          <div><h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>ClearPass</h1><span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>DEPARTMENT PORTAL</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '12px', borderRadius: '20px', boxShadow: 'var(--clay-shadow-out)', marginBottom: '24px' }}>
          <div style={{ width: '44px', height: '44px', background: '#e8eaf6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>👨‍💼</div>
          <div><span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-dark)', display: 'block' }}>mamalinta</span><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Department Head</span></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {[{ id: 'dashboard', label: 'Dashboard', icon: '🏠' }, { id: 'requests', label: 'Clearance Requests', icon: '📄' }, { id: 'approved', label: 'Approved List', icon: '✅' }, { id: 'reports', label: 'Reports', icon: '📊' }].map((item) => (
            <button key={item.id} onClick={() => handleNavClick(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '14px 18px', borderRadius: '16px', border: 'none', background: activeTab === item.id ? 'var(--blue-primary)' : 'transparent', color: activeTab === item.id ? '#fff' : 'var(--text-muted)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', borderRadius: '16px', border: 'none', background: '#fff0f0', color: '#e03131', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>🚪 Logout</button>
      </aside>

      <main style={{ flex: 1, padding: '32px 48px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ flex: 1, maxWidth: '400px' }}><SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Global Search..." /></div>
          
          {/* ========================================================
              FUNCTIONAL NOTIFICATION BELL DROPDOWN
             ======================================================== */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)} 
              style={{ 
                background: '#fff', border: 'none', width: '48px', height: '48px', borderRadius: '50%', 
                boxShadow: 'var(--clay-shadow-out)', cursor: 'pointer', fontSize: '20px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' 
              }}
            >
              🔔
              {recentNotifications.length > 0 && (
                <span style={{ position: 'absolute', top: '8px', right: '10px', width: '10px', height: '10px', background: '#ff4757', borderRadius: '50%', border: '2px solid #fff' }} />
              )}
            </button>
            
            {isNotifOpen && (
              <div style={{ 
                position: 'absolute', top: '60px', right: 0, width: '320px', background: '#fff', 
                borderRadius: '16px', padding: '16px', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid #eee' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>Notifications</h4>
                  <span style={{ fontSize: '11px', color: 'var(--blue-primary)', fontWeight: 600, cursor: 'pointer' }}>Mark all read</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {recentNotifications.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No new notifications.</p>
                  ) : (
                    recentNotifications.map((notif, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', padding: '10px', borderRadius: '8px', background: 'var(--bg-base)' }}>
                        <span style={{ fontSize: '18px' }}>{notif.icon}</span>
                        <div>
                          <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>{notif.title}</p>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{notif.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <button 
                  onClick={() => { setIsNotifOpen(false); handleNavClick('requests'); }}
                  style={{ width: '100%', marginTop: '12px', padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--blue-light)', color: 'var(--blue-primary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  View All Requests
                </button>
              </div>
            )}
          </div>
        </header>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'requests' && renderRequests()}
        {activeTab === 'approved' && renderApproved()}
        {activeTab === 'reports' && renderReports()}
      </main>
    </div>
  );
};

export default DepartmentPortal;