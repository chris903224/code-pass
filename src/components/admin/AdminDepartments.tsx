import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

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

const StatCard = ({ label, value, icon, subtext }: any) => (
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

const Table = ({ columns, data, emptyMessage, onRowClick }: any) => {
  if (!data || data.length === 0) return <div className="empty-message">{emptyMessage}</div>;
  return (
    <div className="table-responsive">
      <table>
        <thead>
          <tr>
            {columns.map((col: any) => <th key={col.key}>{col.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any) => (
            <tr key={row.id} onClick={() => onRowClick && onRowClick(row)} style={{ cursor: onRowClick ? 'pointer' : 'default' }}>
              {columns.map((col: any) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
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
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'departments' | 'students' | 'reports'>('dashboard');

  // --- HARDCODED DATA PARA BUMALIK SA DATI ---
  const [stats] = useState({ totalStudents: 120, totalRequests: 45, pendingRequests: 12, approvedRequests: 28, rejectedRequests: 5 });
  const [requests] = useState([
    { id: '1', studentId: '2023-001', studentName: 'Alice Johnson', department: 'Library', status: 'pending', dateSubmitted: '2026-10-15' },
    { id: '2', studentId: '2023-045', studentName: 'Bob Smith', department: 'IT Department', status: 'approved', dateSubmitted: '2026-10-14' },
    { id: '3', studentId: '2022-112', studentName: 'Charlie Brown', department: 'Finance', status: 'rejected', dateSubmitted: '2026-10-10' },
    { id: '4', studentId: '2024-008', studentName: 'Diana Prince', department: 'Registrar', status: 'pending', dateSubmitted: '2026-10-12' },
  ]);
  const [announcements] = useState([
    { id: '1', title: 'System Maintenance', content: 'System will be down on Sunday.', author: 'Admin', date: '2026-10-20' },
  ]);

  const [departments, setDepartments] = useState([
    { id: '1', name: 'IT Department', head: 'Dr. Reyes', status: 'Active' },
    { id: '2', name: 'Education Department', head: 'Dr. Cruz', status: 'Active' },
    { id: '3', name: 'Criminology', head: 'Dr. Santos', status: 'Active' },
  ]);

  const [students, setStudents] = useState([
    { id: '1', studentId: '2023-001', name: 'Alice Johnson', course: 'BSIT', status: 'Pending' },
    { id: '2', studentId: '2023-045', name: 'Bob Smith', course: 'BSED', status: 'Approved' },
    { id: '3', studentId: '2022-112', name: 'Charlie Brown', course: 'CRIM', status: 'Rejected' },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [deptName, setDeptName] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [deptStatus, setDeptStatus] = useState('Active');

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [studentNameInput, setStudentNameInput] = useState('');
  const [studentCourseInput, setStudentCourseInput] = useState('BSIT');
  const [studentStatusInput, setStudentStatusInput] = useState('Pending');

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  useEffect(() => { const timer = setTimeout(() => setIsLoading(false), 500); return () => clearTimeout(timer); }, []);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        if (logout) await logout();
        else { localStorage.removeItem('token'); localStorage.removeItem('user'); }
        navigate('/login', { replace: true });
      } catch (error) { console.error("Logout failed:", error); }
    }
  };

  const handleViewRequest = () => { if (selectedRequest) setIsViewModalOpen(true); else alert('Please select a request from the table first.'); };
  const handleOpenAddDeptModal = () => { setEditingDeptId(null); setDeptName(''); setDeptHead(''); setDeptStatus('Active'); setIsDeptModalOpen(true); };
  const handleOpenEditDeptModal = (dept: any) => { setEditingDeptId(dept.id); setDeptName(dept.name); setDeptHead(dept.head); setDeptStatus(dept.status); setIsDeptModalOpen(true); };
  const handleSaveDepartment = () => {
    if (!deptName.trim() || !deptHead.trim()) { alert("Please fill in both Department Name and Head."); return; }
    if (editingDeptId) setDepartments((prev: any[]) => prev.map((d: any) => d.id === editingDeptId ? { ...d, name: deptName, head: deptHead, status: deptStatus } : d));
    else setDepartments((prev: any[]) => [...prev, { id: Math.random().toString(), name: deptName, head: deptHead, status: deptStatus }]);
    setIsDeptModalOpen(false);
  };

  const handleOpenAddStudentModal = () => { setEditingStudentId(null); setStudentIdInput(''); setStudentNameInput(''); setStudentCourseInput('BSIT'); setStudentStatusInput('Pending'); setIsStudentModalOpen(true); };
  const handleOpenEditStudentModal = (student: any) => { setEditingStudentId(student.id); setStudentIdInput(student.studentId); setStudentNameInput(student.name); setStudentCourseInput(student.course); setStudentStatusInput(student.status); setIsStudentModalOpen(true); };
  const handleSaveStudent = () => {
    if (!studentIdInput.trim() || !studentNameInput.trim()) { alert("Please fill in both Student ID and Name."); return; }
    if (editingStudentId) setStudents((prev: any[]) => prev.map((s: any) => s.id === editingStudentId ? { ...s, studentId: studentIdInput, name: studentNameInput, course: studentCourseInput, status: studentStatusInput } : s));
    else setStudents((prev: any[]) => [...prev, { id: Math.random().toString(), studentId: studentIdInput, name: studentNameInput, course: studentCourseInput, status: studentStatusInput }]);
    setIsStudentModalOpen(false);
  };

  const handleExportSystemReport = () => {
    const summaryData = [
      ['System Clearance Report', ''], ['Generated On', new Date().toLocaleString()], ['', ''],
      ['SYSTEM TOTALS', ''], ['Total Students', stats.totalStudents], ['Total Requests', stats.totalRequests],
      ['Pending Requests', stats.pendingRequests], ['Approved Requests', stats.approvedRequests], ['Rejected Requests', stats.rejectedRequests],
      ['', ''], ['CLEARANCE REQUESTS DETAILS', ''], ['Student ID', 'Student Name', 'Department', 'Status', 'Date Submitted']
    ];
    const requestsData = requests.map((r: any) => [r.studentId, `"${r.studentName}"`, r.department, r.status.toUpperCase(), r.dateSubmitted]);
    const csvContent = [...summaryData.map(row => row.join(',')), ...requestsData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `System_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const filteredRequests = requests.filter((req: any) => {
    const matchSearch = req.studentId?.includes(searchTerm) || req.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const notifications = useMemo(() => {
    const notifs = [];
    if (stats.pendingRequests > 0) notifs.push({ id: '1', title: `You have ${stats.pendingRequests} pending clearance requests.`, time: 'Just now', icon: '⏳' });
    if (announcements.length > 0) notifs.push({ id: '2', title: `New announcement: ${announcements[0].title}`, time: 'Recently', icon: '📢' });
    if (notifs.length === 0) notifs.push({ id: '3', title: 'No new notifications.', time: 'Updated today', icon: '✅' });
    return notifs;
  }, [stats, announcements]);

  const requestColumns = [
    { key: 'studentId', header: 'Student ID' }, { key: 'studentName', header: 'Name' }, { key: 'department', header: 'Department' },
    { key: 'status', header: 'Status', render: (item: any) => <Badge variant={item.status as any}>{item.status}</Badge> },
    { key: 'dateSubmitted', header: 'Date' },
  ];

  if (isLoading) return <div className="loading-container" style={{ height: '100vh' }}><div className="spinner"></div></div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-family)' }}>
      <aside style={{ width: '280px', padding: '24px 20px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '8px', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '24px' }}>
          <div style={{ width: '42px', height: '42px', background: 'var(--blue-primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', boxShadow: 'var(--clay-shadow-out)' }}>🛡️</div>
          <div><h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-dark)', letterSpacing: '-0.5px' }}>ClearPass</h1><span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>ADMIN PORTAL</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '12px', borderRadius: '20px', boxShadow: 'var(--clay-shadow-out)', marginBottom: '24px' }}>
          <div style={{ width: '44px', height: '44px', background: '#e8eaf6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>👑</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.2 }}>Admin User</span><span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>System Administrator</span></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {[{ id: 'dashboard', label: 'Dashboard', icon: '🏠' }, { id: 'departments', label: 'Departments', icon: '🏢' }, { id: 'students', label: 'Students', icon: '👨‍🎓' }, { id: 'reports', label: 'Reports', icon: '📊' }].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '14px 18px', borderRadius: '16px', border: 'none', background: activeTab === item.id ? 'var(--blue-primary)' : 'transparent', color: activeTab === item.id ? '#fff' : 'var(--text-muted)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: activeTab === item.id ? '0 8px 16px rgba(47, 75, 214, 0.25)' : 'none', textAlign: 'left' }}>
              <span style={{ fontSize: '18px' }}>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', borderRadius: '16px', border: 'none', background: '#fff0f0', color: '#e03131', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: 'var(--clay-shadow-out)' }} onMouseEnter={(e) => e.currentTarget.style.background = '#ffe3e3'} onMouseLeave={(e) => e.currentTarget.style.background = '#fff0f0'}>
            <span style={{ fontSize: '18px' }}>🚪</span> Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '32px 48px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Global Search (ID or Name)..." />
          </div>
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button onClick={() => setIsNotifOpen(!isNotifOpen)} style={{ background: '#fff', border: 'none', width: '48px', height: '48px', borderRadius: '50%', boxShadow: 'var(--clay-shadow-out)', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              🔔
              {notifications.length > 0 && <span style={{ position: 'absolute', top: '8px', right: '10px', width: '10px', height: '10px', background: '#ff4757', borderRadius: '50%', border: '2px solid #fff' }} />}
            </button>
            {isNotifOpen && (
              <div style={{ position: 'absolute', top: '60px', right: 0, width: '320px', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '16px', zIndex: 1000, border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}><h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>Notifications</h4></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.map((notif, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', padding: '10px', borderRadius: '8px', background: 'var(--bg-base)' }}>
                      <span style={{ fontSize: '18px' }}>{notif.icon}</span>
                      <div><p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>{notif.title}</p><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{notif.time}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <>
            <section className="hero" style={{ marginBottom: '24px' }}>
              <div className="hero-text">
                <h2>Hello, Admin! <span className="wave">👋</span></h2>
                <p>Manage and monitor the whole clearance system.</p>
                <div className="quick-actions">
                  <button className="quick-card" onClick={() => setActiveTab('dashboard')}><span className="quick-icon">📋</span><span className="quick-copy"><strong>Clearance Requests</strong><small>Manage requests</small></span></button>
                  <button className="quick-card" onClick={() => setActiveTab('departments')}><span className="quick-icon">🏛️</span><span className="quick-copy"><strong>Department</strong><small>Manage departments</small></span></button>
                  <button className="quick-card" onClick={() => setActiveTab('students')}><span className="quick-icon">✅</span><span className="quick-copy"><strong>Students</strong><small>Manage students</small></span></button>
                  <button className="quick-card" onClick={() => setActiveTab('reports')}><span className="quick-icon">📈</span><span className="quick-copy"><strong>Report</strong><small>View reports</small></span></button>
                </div>
              </div>
            </section>
            <section className="stats-grid" style={{ marginBottom: '24px' }}>
              <StatCard label="Total Students" value={stats.totalStudents} icon="👨‍🎓" subtext="Registered" />
              <StatCard label="Approved Requests" value={stats.approvedRequests} icon="✔" subtext="This month" />
              <StatCard label="Rejected Requests" value={stats.rejectedRequests} icon="✖" subtext="This month" />
              <StatCard label="Pending Requests" value={stats.pendingRequests} icon="⏱" subtext="For approval" />
            </section>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              <Panel title="Recent Clearance Requests Overview" actions={<div style={{ display: 'flex', gap: '12px' }}><SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Search Student ID..." /><Button variant="primary" onClick={handleViewRequest}>View</Button></div>}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {filterTabs.map(tab => (
                    <button key={tab.key} onClick={() => setStatusFilter(tab.key)} style={{ padding: '8px 16px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', background: statusFilter === tab.key ? 'var(--blue-primary)' : 'var(--bg-base)', color: statusFilter === tab.key ? '#fff' : 'var(--text-muted)' }}>{tab.label}</button>
                  ))}
                </div>
                <Table columns={requestColumns} data={filteredRequests} onRowClick={(row: any) => setSelectedRequest(row)} emptyMessage="No clearance requests found." />
              </Panel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <Panel title="📢 Recent Announcements">
                  {announcements.length === 0 ? <div className="empty-message">No announcements available.</div> : announcements.map(a => (
                    <div key={a.id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}><span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--blue-primary)' }}>{a.author}</span><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{a.date}</span></div>
                      <p style={{ fontSize: '13px', color: 'var(--text-dark)', lineHeight: 1.5 }}><strong>{a.title}</strong><br />{a.content}</p>
                    </div>
                  ))}
                </Panel>
              </div>
            </div>
          </>
        )}

        {activeTab === 'departments' && (
          <>
            <section className="page-header"><div className="page-header-text"><h2>Departments Management</h2><p>View and manage academic departments in the system.</p></div><Button variant="primary" onClick={handleOpenAddDeptModal}>+ Add Department</Button></section>
            <Panel title="All Departments">
              <Table columns={[{ key: 'name', header: 'Department Name' }, { key: 'head', header: 'Department Head' }, { key: 'status', header: 'Status' }, { key: 'action', header: 'Action', render: (i: any) => <Button variant="ghost" size="sm" onClick={(e: any) => { e.stopPropagation(); handleOpenEditDeptModal(i); }}>Edit</Button> }]} data={departments} emptyMessage="No departments found." />
            </Panel>
          </>
        )}

        {activeTab === 'students' && (
          <>
            <section className="page-header"><div className="page-header-text"><h2>Students Management</h2><p>View and manage student records across all courses.</p></div><Button variant="primary" onClick={handleOpenAddStudentModal}>+ Add Student</Button></section>
            <Panel title="All Students">
              <Table columns={[{ key: 'studentId', header: 'Student ID' }, { key: 'name', header: 'Name' }, { key: 'course', header: 'Course' }, { key: 'status', header: 'Clearance Status', render: (i: any) => <Badge variant={i.status === 'Approved' ? 'approved' : i.status === 'Pending' ? 'pending' : 'rejected'}>{i.status}</Badge> }, { key: 'action', header: 'Action', render: (i: any) => <Button variant="ghost" size="sm" onClick={(e: any) => { e.stopPropagation(); handleOpenEditStudentModal(i); }}>Edit</Button> }]} data={students} emptyMessage="No students found." />
            </Panel>
          </>
        )}

        {activeTab === 'reports' && (
          <>
            <section className="page-header"><div className="page-header-text"><h2>System Reports</h2><p>Analytics and system-wide reports for clearance activities.</p></div><Button variant="ghost" onClick={handleExportSystemReport}>⬇ Export System Report</Button></section>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <Panel title="Clearance Status Overview"><div className="chart-placeholder" style={{ height: '250px', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}><p style={{ color: 'var(--text-muted)' }}>📊 Chart visualization here</p></div></Panel>
              <Panel title="Department Performance"><div className="chart-placeholder" style={{ height: '250px', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}><p style={{ color: 'var(--text-muted)' }}>📈 Chart visualization here</p></div></Panel>
            </div>
          </>
        )}
      </main>

      {/* MODALS */}
      {isViewModalOpen && selectedRequest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,34,64,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3>Clearance Request Details</h3>
            <p><strong>Student:</strong> {selectedRequest.studentName}</p>
            <p><strong>Department:</strong> {selectedRequest.department}</p>
            <p><strong>Status:</strong> <Badge variant={selectedRequest.status}>{selectedRequest.status}</Badge></p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}><Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>Close</Button></div>
          </div>
        </div>
      )}

      {isDeptModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,34,64,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3>{editingDeptId ? 'Edit Department' : 'Add New Department'}</h3>
            <input type="text" value={deptName} onChange={e => setDeptName(e.target.value)} placeholder="Department Name" style={{ width: '100%', marginBottom: '16px', padding: '10px' }} />
            <input type="text" value={deptHead} onChange={e => setDeptHead(e.target.value)} placeholder="Department Head" style={{ width: '100%', marginBottom: '16px', padding: '10px' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}><Button variant="ghost" onClick={() => setIsDeptModalOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleSaveDepartment}>Save</Button></div>
          </div>
        </div>
      )}

      {isStudentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,34,64,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
            <h3>{editingStudentId ? 'Edit Student' : 'Add New Student'}</h3>
            <input type="text" value={studentIdInput} onChange={e => setStudentIdInput(e.target.value)} placeholder="Student ID" style={{ width: '100%', marginBottom: '16px', padding: '10px' }} />
            <input type="text" value={studentNameInput} onChange={e => setStudentNameInput(e.target.value)} placeholder="Full Name" style={{ width: '100%', marginBottom: '16px', padding: '10px' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}><Button variant="ghost" onClick={() => setIsStudentModalOpen(false)}>Cancel</Button><Button variant="primary" onClick={handleSaveStudent}>Save</Button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;