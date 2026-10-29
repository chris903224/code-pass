import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { Column, ClearanceRequest, DashboardStats, Announcement } from '../../types';
import { usePagination } from '../../hooks/usePagination';

// ============================================================
// TYPES
// ============================================================
interface Department {
  id: string;
  name: string;
  head: string;
  status: string;
}

interface Student {
  id: string;
  studentId: string;
  name: string;
  course: string;
  status: string;
}

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
          <tr>{columns.map((col: any) => <th key={col.key}>{col.header}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row: any) => (
            <tr key={row.id} onClick={() => onRowClick && onRowClick(row)} style={{ cursor: onRowClick ? 'pointer' : 'default' }}>
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
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'departments' | 'students' | 'reports'>('dashboard');

  // ============================================================
  // FIX: GINAWANG 0 AT EMPTY ARRAYS LAHAT NG DATA
  // ============================================================
  const [stats] = useState<DashboardStats>({
    totalStudents: 0, 
    totalRequests: 0, 
    pendingRequests: 0, 
    approvedRequests: 0, 
    rejectedRequests: 0,
  });
  
  const [requests] = useState<any[]>([]);
  
  const [announcements] = useState<Announcement[]>([]);

  const [departments, setDepartments] = useState<Department[]>(() => {
    const saved = localStorage.getItem('admin_departments');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('admin_departments', JSON.stringify(departments));
  }, [departments]);

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('admin_students');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('admin_students', JSON.stringify(students));
  }, [students]);
  
  // --- UI STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
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

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        if (logout) await logout();
        localStorage.clear(); sessionStorage.clear();
        navigate('/login', { replace: true });
      } catch (error) { console.error("Logout failed:", error); }
    }
  };

  const handleViewRequest = () => {
    if (selectedRequest) setIsViewModalOpen(true);
    else alert('Please select a request from the table first.');
  };

  const handleOpenAddDeptModal = () => {
    setEditingDeptId(null);
    setDeptName(''); setDeptHead(''); setDeptStatus('Active');
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDeptModal = (dept: Department) => {
    setEditingDeptId(dept.id);
    setDeptName(dept.name); setDeptHead(dept.head); setDeptStatus(dept.status);
    setIsDeptModalOpen(true);
  };

  const handleSaveDepartment = () => {
    if (!deptName.trim() || !deptHead.trim()) return alert("Please fill in both Department Name and Head.");
    
    if (editingDeptId) {
      setDepartments((prev: Department[]) => prev.map((d: Department) => d.id === editingDeptId ? { ...d, name: deptName, head: deptHead, status: deptStatus } : d));
    } else {
      const newId = Date.now().toString();
      setDepartments((prev: Department[]) => [...prev, { id: newId, name: deptName, head: deptHead, status: deptStatus }]);
    }
    setIsDeptModalOpen(false);
  };

  const handleOpenAddStudentModal = () => {
    setEditingStudentId(null);
    setStudentIdInput(''); setStudentNameInput(''); setStudentCourseInput('BSIT'); setStudentStatusInput('Pending');
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudentModal = (student: Student) => {
    setEditingStudentId(student.id);
    setStudentIdInput(student.studentId); setStudentNameInput(student.name); setStudentCourseInput(student.course); setStudentStatusInput(student.status);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = () => {
    if (!studentIdInput.trim() || !studentNameInput.trim()) return alert("Please fill in both Student ID and Name.");
    
    if (editingStudentId) {
      setStudents((prev: Student[]) => prev.map((s: Student) => s.id === editingStudentId ? { ...s, studentId: studentIdInput, name: studentNameInput, course: studentCourseInput, status: studentStatusInput } : s));
    } else {
      const newId = Date.now().toString();
      setStudents((prev: Student[]) => [...prev, { id: newId, studentId: studentIdInput, name: studentNameInput, course: studentCourseInput, status: studentStatusInput }]);
    }
    setIsStudentModalOpen(false);
  };

  const handleExportSystemReport = () => {
    if (requests.length === 0 && departments.length === 0 && students.length === 0) return alert("No data available to export.");
    const summaryData = [
      ['System Clearance Report', ''], ['Generated On', new Date().toLocaleString()], ['', ''],
      ['SYSTEM TOTALS', ''], ['Total Students', stats.totalStudents], ['Total Requests', stats.totalRequests],
      ['Pending Requests', stats.pendingRequests], ['Approved Requests', stats.approvedRequests], ['Rejected Requests', stats.rejectedRequests],
      ['', ''], ['CLEARANCE REQUESTS DETAILS', ''], ['Student ID', 'Student Name', 'Department', 'Status', 'Date Submitted']
    ];
    const requestsData = requests.map(r => [r.studentId, `"${r.studentName}"`, r.department, r.status.toUpperCase(), r.dateSubmitted]);
    const csvContent = [...summaryData.map(row => row.join(',')), ...requestsData.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.setAttribute('download', `System_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const filteredRequests = requests.filter((req: any) => {
    const matchSearch = req.studentId?.includes(searchTerm) || req.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const { paginatedItems } = usePagination(filteredRequests, 5);

  const notifications = useMemo(() => {
    const notifs = [];
    if (stats.pendingRequests > 0) notifs.push({ id: '1', title: `You have ${stats.pendingRequests} pending clearance requests.`, time: 'Just now', icon: '⏳' });
    if (announcements.length > 0) notifs.push({ id: '2', title: `New announcement: ${announcements[0].title}`, time: 'Recently', icon: '📢' });
    if (notifs.length === 0) notifs.push({ id: '3', title: 'No new notifications.', time: 'Updated today', icon: '✅' });
    return notifs;
  }, [stats, announcements]);

  const requestColumns: Column<any>[] = [
    { key: 'studentId', header: 'Student ID' }, 
    { key: 'studentName', header: 'Name' }, 
    { key: 'department', header: 'Department' },
    { key: 'status', header: 'Status', render: (item: any) => <Badge variant={item.status}>{item.status}</Badge> }, 
    { key: 'dateSubmitted', header: 'Date' },
  ];

  if (isLoading) return <div className="loading-container" style={{ height: '100vh' }}><div className="spinner"></div></div>;

  const renderDashboard = () => (
    <>
      <section className="hero" style={{ marginBottom: '24px' }}>
        <div className="hero-text">
          <h2>Hello, Admin! <span className="wave">👋</span></h2>
          <p>Manage and monitor the whole clearance system.</p>
        </div>
      </section>

      <section className="stats-grid" style={{ marginBottom: '24px' }}>
        <StatCard label="Total Students" value={stats.totalStudents} icon="👨‍🎓" subtext="Registered" />
        <StatCard label="Approved Requests" value={stats.approvedRequests} icon="✔" subtext="This month" />
        <StatCard label="Rejected Requests" value={stats.rejectedRequests} icon="✖" subtext="This month" />
        <StatCard label="Pending Requests" value={stats.pendingRequests} icon="⏱" subtext="For approval" />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <Panel
          title="Recent Clearance Requests Overview"
          actions={<Button variant="primary" onClick={handleViewRequest}>View</Button>}
        >
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {filterTabs.map(tab => (
              <button key={tab.key} onClick={() => setStatusFilter(tab.key)} style={{ padding: '8px 16px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '13px', background: statusFilter === tab.key ? 'var(--blue-primary)' : 'var(--bg-base)', color: statusFilter === tab.key ? '#fff' : 'var(--text-muted)' }}>
                {tab.label}
              </button>
            ))}
          </div>
          <Table columns={requestColumns} data={paginatedItems} onRowClick={(row: any) => setSelectedRequest(row)} emptyMessage="No clearance requests found." />
        </Panel>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Panel title="📢 Recent Announcements">
            {announcements.length === 0 ? (
              <div className="panel-empty" style={{ textAlign: 'center', padding: '40px 0' }}>
                <span className="empty-icon" style={{ fontSize: '32px' }}>📭</span>
                <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>No announcements available.</p>
              </div>
            ) : (
              announcements.map((announcement: Announcement) => (
                <div key={announcement.id} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--blue-primary)' }}>{announcement.author}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{announcement.date}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-dark)', lineHeight: 1.5 }}><strong>{announcement.title}</strong><br />{announcement.content}</p>
                </div>
              ))
            )}
          </Panel>
        </div>
      </div>
    </>
  );

  const renderDepartments = () => (
    <>
      <section className="page-header">
        <div className="page-header-text"><h2>Departments Management</h2><p>View and manage academic departments.</p></div>
        <Button variant="primary" onClick={handleOpenAddDeptModal}>+ Add Department</Button>
      </section>
      <Panel title="All Departments">
        <Table
          columns={[
            { key: 'name', header: 'Department Name' }, { key: 'head', header: 'Department Head' }, { key: 'status', header: 'Status' },
            { key: 'action', header: 'Action', render: (item: Department) => <Button variant="ghost" size="sm" onClick={(e: any) => { e.stopPropagation(); handleOpenEditDeptModal(item); }}>Edit</Button> }
          ]}
          data={departments} emptyMessage="No departments found."
        />
      </Panel>
    </>
  );

  const renderStudents = () => (
    <>
      <section className="page-header">
        <div className="page-header-text"><h2>Students Management</h2><p>View and manage student records.</p></div>
        <Button variant="primary" onClick={handleOpenAddStudentModal}>+ Add Student</Button>
      </section>
      <Panel title="All Students">
        <Table
          columns={[
            { key: 'studentId', header: 'Student ID' }, { key: 'name', header: 'Name' }, { key: 'course', header: 'Course' },
            { key: 'status', header: 'Clearance Status', render: (item: Student) => <Badge variant={item.status === 'Approved' ? 'approved' : item.status === 'Pending' ? 'pending' : 'rejected'}>{item.status}</Badge> },
            { key: 'action', header: 'Action', render: (item: Student) => <Button variant="ghost" size="sm" onClick={(e: any) => { e.stopPropagation(); handleOpenEditStudentModal(item); }}>Edit</Button> }
          ]}
          data={students} emptyMessage="No students found."
        />
      </Panel>
    </>
  );

  const renderReports = () => {
    const totalRequests = requests.length || 1;
    const pendingCount = requests.filter(r => r.status === 'pending').length;
    const approvedCount = requests.filter(r => r.status === 'approved').length;
    const rejectedCount = requests.filter(r => r.status === 'rejected').length;

    const pendingPct = (pendingCount / totalRequests) * 100;
    const approvedPct = (approvedCount / totalRequests) * 100;
    const rejectedPct = (rejectedCount / totalRequests) * 100;

    const deptCounts = requests.reduce((acc: any, req: any) => {
      acc[req.department] = (acc[req.department] || 0) + 1;
      return acc;
    }, {});
    const maxDeptCount = Math.max(...(Object.values(deptCounts) as number[]), 1);

    return (
      <>
        <section className="page-header">
          <div className="page-header-text"><h2>System Reports</h2><p>Analytics and system-wide reports.</p></div>
          <Button variant="ghost" onClick={handleExportSystemReport}>⬇ Export System Report</Button>
        </section>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          <Panel title="Clearance Status Overview">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0' }}>
              <div style={{
                width: '180px', height: '180px', borderRadius: '50%',
                background: requests.length === 0 ? '#f0f0f0' : `conic-gradient(
                  #fcc419 0% ${pendingPct}%, 
                  #20c997 ${pendingPct}% ${pendingPct + approvedPct}%, 
                  #ff6b6b ${pendingPct + approvedPct}% 100%
                )`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--clay-shadow-out)', marginBottom: '24px'
              }}>
                <div style={{
                  width: '120px', height: '120px', borderRadius: '50%', background: '#fff',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.05)'
                }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-dark)' }}>{requests.length}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total</span>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Department Performance">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '250px', padding: '0 20px', marginTop: '20px' }}>
              {Object.keys(deptCounts).length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>No data available</div>
              ) : (
                Object.entries(deptCounts).map(([dept, count]: any) => (
                  <div key={dept} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>{count}</span>
                    <div style={{ width: '100%', height: `${(count / maxDeptCount) * 180}px`, background: 'linear-gradient(180deg, #4c6ef5, #3b5bdb)', borderRadius: '8px 8px 0 0' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 600, textAlign: 'center', wordBreak: 'break-word' }}>{dept}</span>
                  </div>
                ))
              )}
            </div>
          </Panel>

        </div>
      </>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-family)' }}>
      
      <aside style={{ width: '280px', padding: '24px 20px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '8px', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '24px' }}>
          <div style={{ width: '42px', height: '42px', background: 'var(--blue-primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px' }}>🛡️</div>
          <div><h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>ClearPass</h1><span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>ADMIN PORTAL</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '12px', borderRadius: '20px', boxShadow: 'var(--clay-shadow-out)', marginBottom: '24px' }}>
          <div style={{ width: '44px', height: '44px', background: '#e8eaf6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>👑</div>
          <div><span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-dark)', display: 'block' }}>Admin User</span><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>System Administrator</span></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {[{ id: 'dashboard', label: 'Dashboard', icon: '🏠' }, { id: 'departments', label: 'Departments', icon: '🏢' }, { id: 'students', label: 'Students', icon: '👨‍🎓' }, { id: 'reports', label: 'Reports', icon: '📊' }].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '14px 18px', borderRadius: '16px', border: 'none', background: activeTab === item.id ? 'var(--blue-primary)' : 'transparent', color: activeTab === item.id ? '#fff' : 'var(--text-muted)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', borderRadius: '16px', border: 'none', background: '#fff0f0', color: '#e03131', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>🚪 Logout</button>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>Notifications</h4>
                </div>
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

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'departments' && renderDepartments()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'reports' && renderReports()}
      </main>

      {isViewModalOpen && selectedRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26, 34, 64, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', boxShadow: 'var(--clay-shadow-hover)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', color: 'var(--text-dark)' }}>Clearance Request Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px' }}><span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Student ID</span><strong style={{ color: 'var(--text-dark)' }}>{selectedRequest.studentId}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px' }}><span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Name</span><strong style={{ color: 'var(--text-dark)' }}>{selectedRequest.studentName}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px' }}><span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Department</span><strong style={{ color: 'var(--text-dark)' }}>{selectedRequest.department}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', paddingBottom: '8px' }}><span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Status</span><Badge variant={selectedRequest.status}>{selectedRequest.status}</Badge></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Date Submitted</span><strong style={{ color: 'var(--text-dark)' }}>{selectedRequest.dateSubmitted}</strong></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {isDeptModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26, 34, 64, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', boxShadow: 'var(--clay-shadow-hover)' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', color: 'var(--text-dark)' }}>
              {editingDeptId ? 'Edit Department' : 'Add New Department'}
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Department Name</label>
              <input type="text" value={deptName} onChange={(e) => setDeptName(e.target.value)} placeholder="e.g. IT Department" style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--bg-base)', boxShadow: 'var(--clay-shadow-in)', fontFamily: 'var(--font-family)', fontSize: '14px', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Department Head</label>
              <input type="text" value={deptHead} onChange={(e) => setDeptHead(e.target.value)} placeholder="e.g. Dr. Reyes" style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--bg-base)', boxShadow: 'var(--clay-shadow-in)', fontFamily: 'var(--font-family)', fontSize: '14px', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Status</label>
              <select value={deptStatus} onChange={(e) => setDeptStatus(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--bg-base)', boxShadow: 'var(--clay-shadow-in)', fontFamily: 'var(--font-family)', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="ghost" onClick={() => setIsDeptModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveDepartment}>{editingDeptId ? 'Save Changes' : 'Add Department'}</Button>
            </div>
          </div>
        </div>
      )}

      {isStudentModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26, 34, 64, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', boxShadow: 'var(--clay-shadow-hover)' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '20px', color: 'var(--text-dark)' }}>
              {editingStudentId ? 'Edit Student' : 'Add New Student'}
            </h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Student ID</label>
              <input type="text" value={studentIdInput} onChange={(e) => setStudentIdInput(e.target.value)} placeholder="e.g. 2023-001" style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--bg-base)', boxShadow: 'var(--clay-shadow-in)', fontFamily: 'var(--font-family)', fontSize: '14px', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Full Name</label>
              <input type="text" value={studentNameInput} onChange={(e) => setStudentNameInput(e.target.value)} placeholder="e.g. Alice Johnson" style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--bg-base)', boxShadow: 'var(--clay-shadow-in)', fontFamily: 'var(--font-family)', fontSize: '14px', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Course</label>
              <select value={studentCourseInput} onChange={(e) => setStudentCourseInput(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--bg-base)', boxShadow: 'var(--clay-shadow-in)', fontFamily: 'var(--font-family)', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
                <option value="BSIT">BSIT</option>
                <option value="BSED">BSED</option>
                <option value="CRIM">CRIM</option>
                <option value="BSPSY">BSPSY</option>
                <option value="BSA">BSA</option>
              </select>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '8px' }}>Clearance Status</label>
              <select value={studentStatusInput} onChange={(e) => setStudentStatusInput(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--bg-base)', boxShadow: 'var(--clay-shadow-in)', fontFamily: 'var(--font-family)', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="ghost" onClick={() => setIsStudentModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveStudent}>{editingStudentId ? 'Save Changes' : 'Add Student'}</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;