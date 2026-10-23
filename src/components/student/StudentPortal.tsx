import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// ============================================================
// TYPES & MOCK DATA
// ============================================================
interface ClearanceStats {
  totalDepartments: number;
  cleared: number;
  pending: number;
  inProgress: number;
  progress: number;
}

interface StudentDepartmentStatus {
  departmentId: string;
  departmentName: string;
  status: 'cleared' | 'pending' | 'rejected';
  dateUpdated: string;
  requirements?: string[];
  remarks?: string;
}

interface Remark {
  id: string;
  department: string;
  date: string;
  status: 'cleared' | 'pending' | 'rejected';
  remarks: string;
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

const StatCard = ({ label, value, icon, color, subtext, onClick }: any) => (
  <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
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
          <tr>
            {columns.map((col: any) => <th key={col.key}>{col.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, idx: number) => (
            <tr key={row.id || idx}>
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

const DonutChart = ({ data, total, centerValue, centerLabel }: any) => {
  const cleared = data.find((d:any) => d.label === 'Cleared')?.value || 0;
  const pending = data.find((d:any) => d.label === 'Pending')?.value || 0;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ 
        width: '150px', height: '150px', borderRadius: '50%', 
        background: `conic-gradient(#2ecc71 0% ${(cleared/(total||1))*100}%, #ffa94d ${(cleared/(total||1))*100}% ${((cleared+pending)/(total||1))*100}%, #6c8cff ${((cleared+pending)/(total||1))*100}% 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        boxShadow: 'var(--clay-shadow-out)'
      }}>
        <div style={{ 
          width: '110px', height: '110px', borderRadius: '50%', background: '#fff', 
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--clay-shadow-in)'
        }}>
          <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-dark)' }}>{centerValue}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{centerLabel}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {data.map((d: any) => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-dark)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color }} />
            {d.label} ({d.value})
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const StudentPortal: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth(); 

  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clearance' | 'remarks'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  // Default state, pero magbabago ito sa useEffect
  const [userName, setUserName] = useState('Student');
  
  const [stats, setStats] = useState<ClearanceStats>({ totalDepartments: 5, cleared: 2, pending: 2, inProgress: 1, progress: 40 });
  const [departments, setDepartments] = useState<StudentDepartmentStatus[]>([
    { departmentId: '1', departmentName: 'Library', status: 'cleared', dateUpdated: '2026-10-10', requirements: ['Returned all books'], remarks: 'Clearance approved.' },
    { departmentId: '2', departmentName: 'IT Department', status: 'pending', dateUpdated: '2026-10-15', requirements: ['Return lab equipment'], remarks: 'Waiting for lab check.' },
    { departmentId: '3', departmentName: 'Student Affairs', status: 'cleared', dateUpdated: '2026-10-12', requirements: ['Org clearance'], remarks: 'No pending org issues.' },
    { departmentId: '4', departmentName: 'Registrar', status: 'pending', dateUpdated: '2026-10-18', requirements: ['Clearance form'], remarks: 'Form under review.' },
    { departmentId: '5', departmentName: 'Finance', status: 'rejected', dateUpdated: '2026-10-20', requirements: ['Settle balance'], remarks: 'Unpaid balance for this semester.' },
  ]);
  const [remarks] = useState<Remark[]>([
    { id: '1', department: 'Finance', date: '2026-10-20', status: 'rejected', remarks: 'Unpaid balance for this semester.' },
    { id: '2', department: 'Library', date: '2026-10-10', status: 'cleared', remarks: 'All books returned.' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<StudentDepartmentStatus | null>(null);

  useEffect(() => {
    // ============================================================
    // FIX: I-CHECK LAHAT NG POSIBLENG LOCALSTORAGE KEYS
    // ============================================================
    const possibleKeys = ['user', 'auth_user', 'currentUser', 'student_user', 'userData'];
    let foundName = null;

    // 1. Unahin natin si AuthContext (kung may laman)
    if (user) {
      const u: any = user;
      foundName = u.name || u.fullName || u.firstName || u.username;
    }

    // 2. Kung wala sa AuthContext, hanapin sa localStorage
    if (!foundName) {
      for (const key of possibleKeys) {
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.name || parsed.fullName || parsed.firstName || parsed.username) {
              foundName = parsed.name || parsed.fullName || parsed.firstName || parsed.username;
              break;
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
      }
    }

    // 3. Kung talagang wala, i-set natin sa 'Student'
    setUserName(foundName || 'Student');

    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- NOTIFICATIONS DATA ---
  const notifications = useMemo(() => {
    const notifs = [];
    if (stats.pending > 0) {
      notifs.push({ id: '1', title: `You have ${stats.pending} pending clearance requests.`, time: 'Just now', icon: '⏳' });
    }
    const rejectedDepts = departments.filter(d => d.status === 'rejected');
    if (rejectedDepts.length > 0) {
      notifs.push({ id: '2', title: `Your clearance at ${rejectedDepts[0].departmentName} was rejected.`, time: 'Recently', icon: '❌' });
    }
    if (notifs.length === 0) {
      notifs.push({ id: '3', title: 'All clear! No pending actions.', time: 'Updated today', icon: '✅' });
    }
    return notifs;
  }, [stats, departments]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        if (logout) await logout();
        // I-clear lahat ng posibleng keys
        localStorage.removeItem('token'); 
        localStorage.removeItem('user');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('currentUser');
        navigate('/login', { replace: true });
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };

  const handleViewDepartment = (dept: StudentDepartmentStatus) => {
    setSelectedDept(dept);
    setIsViewModalOpen(true);
  };

  const handleExportRemarks = (dataToExport: Remark[]) => {
    if (dataToExport.length === 0) {
      alert("No remarks available to export.");
      return;
    }
    const headers = ['Department', 'Date', 'Status', 'Remarks'];
    const csvRows = dataToExport.map(r => [r.department, r.date, r.status.toUpperCase(), `"${r.remarks}"`]);
    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `My_Remarks_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const donutData = [
    { label: 'Cleared', value: stats.cleared, color: '#2ecc71' },
    { label: 'Pending', value: stats.pending, color: '#ffa94d' },
    { label: 'In Progress', value: stats.inProgress, color: '#6c8cff' },
  ];

  if (isLoading) {
    return (
      <div className="loading-container" style={{ height: '100vh' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading Student Data...</p>
      </div>
    );
  }

  // ============================================================
  // VIEWS
  // ============================================================

  const renderDashboard = () => (
    <>
      <section className="hero" style={{ marginBottom: '24px' }}>
        <div className="hero-text">
          {/* FIX: Dynamic userName variable */}
          <h2>Hello, {userName}! <span className="wave">👋</span></h2>
          <p>Welcome to your student dashboard.</p>
        </div>
      </section>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard label="My Clearance Status" value={stats.progress > 0 ? `${stats.progress}%` : 'No Data'} icon="⏳" color="orange" subtext="Pending Departments" />
        <StatCard label="Total Departments" value={stats.totalDepartments} icon="🏢" color="blue" subtext="Departments to clear" />
        <StatCard label="Cleared" value={stats.cleared} icon="✔" color="green" subtext="Departments cleared" />
        <StatCard label="Pending" value={stats.pending} icon="⏱" color="red" subtext="Departments pending" />
      </div>

      <div className="content-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '24px' }}>
        <Panel title="Clearance Overview">
          <DonutChart data={donutData} total={stats.totalDepartments} centerValue={stats.progress > 0 ? `${stats.progress}%` : '0%'} centerLabel="Cleared" />
        </Panel>
        <Panel title="Recently Updated">
          {departments.length === 0 ? (
            <div className="empty-message" style={{ padding: '40px 0' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📭</span>
              <p>No departments added yet</p>
            </div>
          ) : (
            <ul className="recent-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {departments.slice(0, 5).map((dept) => (
                <li key={dept.departmentId} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ fontSize: '20px' }}>{dept.status === 'cleared' ? '✅' : dept.status === 'pending' ? '⏳' : '❌'}</span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '14px', color: 'var(--text-dark)', display: 'block' }}>{dept.departmentName}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{dept.dateUpdated}</span>
                  </div>
                  <Badge variant={dept.status === 'cleared' ? 'approved' : dept.status === 'pending' ? 'pending' : 'rejected'}>{dept.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );

  const renderClearance = () => {
    const columns = [
      { key: 'departmentName', header: 'Department', render: (item: StudentDepartmentStatus) => <strong>{item.departmentName}</strong> },
      { key: 'status', header: 'Status', render: (item: StudentDepartmentStatus) => <Badge variant={item.status === 'cleared' ? 'approved' : item.status === 'pending' ? 'pending' : 'rejected'}>{item.status}</Badge> },
      { key: 'dateUpdated', header: 'Date Updated' },
      { key: 'requirements', header: 'Requirements', render: (item: StudentDepartmentStatus) => <span>{item.requirements?.join(', ') || 'No requirements'}</span> },
      { key: 'action', header: 'Action', render: (item: StudentDepartmentStatus) => <Button variant="ghost" size="sm" onClick={() => handleViewDepartment(item)}>View</Button> }
    ];

    return (
      <>
        <section className="page-header">
          <div className="page-header-text">
            <h2>My Clearance</h2>
            <p>Detailed view of your clearance status across all departments.</p>
          </div>
          <Button variant="primary" onClick={() => window.print()}>🖨️ Print Clearance</Button>
        </section>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', marginBottom: '24px' }}>
          <StatCard label="Cleared" value={stats.cleared} icon="✔" color="green" subtext="Departments" />
          <StatCard label="Pending" value={stats.pending} icon="⏳" color="orange" subtext="Departments" />
          <StatCard label="Overall Progress" value={`${stats.progress}%`} icon="📊" color="blue" subtext={`${stats.cleared} of ${stats.totalDepartments} cleared`} />
        </div>

        <Panel title="Department Clearance Details">
          <Table columns={columns} data={departments} emptyMessage="No departments added yet." />
        </Panel>
      </>
    );
  };

  const renderRemarks = () => {
    const filteredRemarks = remarks.filter(r => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchSearch = !searchTerm || r.department.toLowerCase().includes(searchTerm.toLowerCase()) || r.remarks.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });

    const columns = [
      { key: 'department', header: 'Department', render: (item: Remark) => <strong>{item.department}</strong> },
      { key: 'date', header: 'Date' },
      { key: 'status', header: 'Status', render: (item: Remark) => <Badge variant={item.status === 'cleared' ? 'approved' : item.status === 'pending' ? 'pending' : 'rejected'}>{item.status}</Badge> },
      { key: 'remarks', header: 'Remarks' }
    ];

    return (
      <>
        <section className="page-header">
          <div className="page-header-text">
            <h2>View Remarks</h2>
            <p>Review feedback and remarks from different departments.</p>
          </div>
          <Button variant="ghost" onClick={() => handleExportRemarks(filteredRemarks)}>⬇ Export Remarks</Button>
        </section>

        <div className="toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Search by department or remarks..." />
          <select className="select-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="cleared">Cleared</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <Panel>
          <Table columns={columns} data={filteredRemarks} emptyMessage="No remarks found." />
        </Panel>
      </>
    );
  };

  // ============================================================
  // MAIN LAYOUT
  // ============================================================
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-family)' }}>
      
      {/* SIDEBAR */}
      <aside style={{ 
        width: '280px', padding: '24px 20px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
        borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '8px',
        position: 'sticky', top: 0, height: '100vh'
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '24px' }}>
          <div style={{ width: '42px', height: '42px', background: 'var(--blue-primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px', boxShadow: 'var(--clay-shadow-out)' }}>🛡️</div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-dark)', letterSpacing: '-0.5px' }}>ClearPass</h1>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>STUDENT PORTAL</span>
          </div>
        </div>

        <div style={{ 
          display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '12px', 
          borderRadius: '20px', boxShadow: 'var(--clay-shadow-out)', marginBottom: '24px'
        }}>
          <div style={{ width: '44px', height: '44px', background: '#e8eaf6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>👩‍🎓</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Dynamic userName sa sidebar */}
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.2 }}>{userName}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Student</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
            { id: 'clearance', label: 'My Clearance', icon: '📋' },
            { id: 'remarks', label: 'View Remarks', icon: '📝' },
          ].map((item) => (
            <button
              key={item.id} onClick={() => setActiveTab(item.id as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '14px 18px',
                borderRadius: '16px', border: 'none', background: activeTab === item.id ? 'var(--blue-primary)' : 'transparent',
                color: activeTab === item.id ? '#fff' : 'var(--text-muted)', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: activeTab === item.id ? '0 8px 16px rgba(47, 75, 214, 0.25)' : 'none',
                textAlign: 'left'
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px',
              borderRadius: '16px', border: 'none', background: '#fff0f0', color: '#e03131', fontWeight: 700, fontSize: '14px',
              cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: 'var(--clay-shadow-out)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#ffe3e3'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#fff0f0'}
          >
            <span style={{ fontSize: '18px' }}>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '32px 48px', overflowY: 'auto' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Global Search..." />
          </div>
          
          {/* NOTIFICATION BELL */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              style={{ background: '#fff', border: 'none', width: '48px', height: '48px', borderRadius: '50%', boxShadow: 'var(--clay-shadow-out)', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
            >
              🔔
              {notifications.length > 0 && (
                <span style={{ position: 'absolute', top: '8px', right: '10px', width: '10px', height: '10px', background: '#ff4757', borderRadius: '50%', border: '2px solid #fff' }} />
              )}
            </button>

            {isNotifOpen && (
              <div style={{
                position: 'absolute', top: '60px', right: 0, width: '320px',
                background: '#fff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                padding: '16px', zIndex: 1000, border: '1px solid #eee'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>Notifications</h4>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.map((notif, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '12px', padding: '10px', borderRadius: '8px', background: 'var(--bg-base)' }}>
                      <span style={{ fontSize: '18px' }}>{notif.icon}</span>
                      <div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>{notif.title}</p>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => { setIsNotifOpen(false); setActiveTab('clearance'); }}
                  style={{ width: '100%', marginTop: '12px', padding: '10px', borderRadius: '8px', border: 'none', background: 'var(--blue-light)', color: 'var(--blue-primary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  View My Clearance
                </button>
              </div>
            )}
          </div>
        </header>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'clearance' && renderClearance()}
        {activeTab === 'remarks' && renderRemarks()}
      </main>

      {/* ============================================================
          VIEW MODAL (Functional Action)
          ============================================================ */}
      {isViewModalOpen && selectedDept && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(26, 34, 64, 0.4)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', boxShadow: 'var(--clay-shadow-hover)' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ fontSize: '32px' }}>
                {selectedDept.status === 'cleared' ? '✅' : selectedDept.status === 'pending' ? '⏳' : '❌'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-dark)' }}>{selectedDept.departmentName}</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Status: <Badge variant={selectedDept.status === 'cleared' ? 'approved' : selectedDept.status === 'pending' ? 'pending' : 'rejected'}>{selectedDept.status}</Badge></span>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', color: 'var(--text-dark)', marginBottom: '8px' }}>Requirements</h4>
              <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                {selectedDept.requirements && selectedDept.requirements.length > 0 ? (
                  selectedDept.requirements.map((req, i) => <li key={i}>{req}</li>)
                ) : (
                  <li>No specific requirements</li>
                )}
              </ul>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', color: 'var(--text-dark)', marginBottom: '8px' }}>Remarks / Notes</h4>
              <p style={{ padding: '16px', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                {selectedDept.remarks || 'No remarks provided.'}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-faint)' }}>Last updated: {selectedDept.dateUpdated}</span>
              <Button variant="primary" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentPortal;