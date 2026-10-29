import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// ============================================================
// TYPES & CONSTANTS
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

const SYSTEM_DEPARTMENTS = [
  'Library', 
  'Finance', 
  'IT Department', 
  'Registrar', 
  'Student Affairs', 
  'Guidance Office'
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
          <tr>{columns.map((col: any) => <th key={col.key}>{col.header}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row: any, idx: number) => (
            <tr key={row.id || idx}>
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

const DonutChart = ({ data, total, centerValue, centerLabel }: any) => {
  const cleared = data.find((d:any) => d.label === 'Cleared')?.value || 0;
  const pending = data.find((d:any) => d.label === 'Pending')?.value || 0;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ 
        width: '150px', height: '150px', borderRadius: '50%', 
        background: total === 0 ? '#f0f0f0' : `conic-gradient(#2ecc71 0% ${(cleared/(total||1))*100}%, #ffa94d ${(cleared/(total||1))*100}% ${((cleared+pending)/(total||1))*100}%, #6c8cff ${((cleared+pending)/(total||1))*100}% 100%)`,
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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'clearance' | 'remarks'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Student');
  
  const [departments, setDepartments] = useState<StudentDepartmentStatus[]>(() => {
    const saved = localStorage.getItem('student_departments');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [remarks, setRemarks] = useState<Remark[]>(() => {
    const saved = localStorage.getItem('student_remarks');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<StudentDepartmentStatus | null>(null);
  
  const [isAddDeptModalOpen, setIsAddDeptModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('student_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('student_remarks', JSON.stringify(remarks));
  }, [remarks]);

  const stats: ClearanceStats = useMemo(() => {
    const total = departments.length;
    const cleared = departments.filter(d => d.status === 'cleared').length;
    const pending = departments.filter(d => d.status === 'pending').length;
    const progress = total > 0 ? Math.round((cleared / total) * 100) : 0;

    return {
      totalDepartments: total,
      cleared: cleared,
      pending: pending,
      inProgress: 0,
      progress: progress,
    };
  }, [departments]);

  // ============================================================
  // SUPER FALLBACK NAME LOGIC
  // ============================================================
  useEffect(() => {
    console.log("--- USER DATA DEBUG ---");
    console.log("AuthContext user object:", user);
    
    let foundName = null;

    // 1. Try AuthContext first
    if (user) {
      const u: any = user;
      foundName = u.name || u.fullName || u.firstName || u.username || u.userName || u.displayName;
    }

    // 2. Try all storage keys
    if (!foundName) {
      const storages = [localStorage, sessionStorage];
      
      for (const storage of storages) {
        // List of common keys
        const keysToTry = ['user', 'auth_user', 'currentUser', 'student_user', 'userData', 'user_info', 'profile'];
        
        for (const key of keysToTry) {
          const val = storage.getItem(key);
          if (val) {
            console.log(`Checking storage key [${key}]:`, val);
            try {
              const parsed = JSON.parse(val);
              // Check all common name variations
              const possibleName = parsed.name || parsed.fullName || parsed.firstName || parsed.username || parsed.userName;
              
              if (possibleName) {
                foundName = possibleName;
                break;
              }
              
              // If nested (e.g., { user: { name: '...' } })
              if (parsed.user) {
                const nestedName = parsed.user.name || parsed.user.fullName || parsed.user.firstName || parsed.user.username;
                if (nestedName) {
                  foundName = nestedName;
                  break;
                }
              }
            } catch (e) {
              console.log(`Error parsing ${key}`);
            }
          }
        }
        if (foundName) break;
      }
    }

    console.log("Final name found:", foundName);
    
    if (!foundName) {
      console.warn("No name found in AuthContext or Storage. Defaulting to 'Student'.");
    }

    setUserName(foundName || 'Student');
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      if (logout) await logout();
      localStorage.clear(); sessionStorage.clear();
      navigate('/login', { replace: true });
    }
  };

  const handleViewDepartment = (dept: StudentDepartmentStatus) => { setSelectedDept(dept); setIsViewModalOpen(true); };
  
  const handleAddDepartmentToStudent = (deptName: string) => {
    const newDept: StudentDepartmentStatus = {
      departmentId: Date.now().toString(),
      departmentName: deptName,
      status: 'pending',
      dateUpdated: new Date().toISOString().split('T')[0],
      requirements: ['Submit required documents'],
      remarks: 'Waiting for department review.'
    };
    
    setDepartments(prev => [...prev, newDept]);
    
    const newRemark: Remark = {
      id: Date.now().toString(),
      department: deptName,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      remarks: 'Waiting for department review.'
    };
    setRemarks(prev => [...prev, newRemark]);

    setIsAddDeptModalOpen(false);
  };

  const handleDeleteDepartment = (deptId: string, deptName: string) => {
    if (window.confirm(`Are you sure you want to remove ${deptName} from your clearance?`)) {
      setDepartments(prev => prev.filter(d => d.departmentId !== deptId));
      setRemarks(prev => prev.filter(r => r.department !== deptName));
    }
  };

  const handleExportRemarks = (dataToExport: Remark[]) => {
    if (dataToExport.length === 0) return alert("No remarks available to export.");
    
    const headers = ['Department', 'Date', 'Status', 'Remarks'];
    const csvRows = dataToExport.map(r => [r.department, r.date, r.status.toUpperCase(), `"${r.remarks}"`]);
    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); 
    link.href = url; 
    link.setAttribute('download', 'My_Remarks.csv');
    document.body.appendChild(link);
    link.click(); 
    document.body.removeChild(link);
  };

  const donutData = [
    { label: 'Cleared', value: stats.cleared, color: '#2ecc71' },
    { label: 'Pending', value: stats.pending, color: '#ffa94d' },
    { label: 'In Progress', value: stats.inProgress, color: '#6c8cff' },
  ];

  if (isLoading) return <div className="loading-container" style={{ height: '100vh' }}><div className="spinner"></div></div>;

  // ============================================================
  // VIEWS
  // ============================================================

  const renderDashboard = () => (
    <>
      <section className="hero" style={{ marginBottom: '24px' }}>
        <div className="hero-text">
          <h2>Hello, {userName}! <span className="wave">👋</span></h2>
          <p>Welcome to your student dashboard.</p>
        </div>
      </section>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard label="My Clearance Status" value={`${stats.progress}%`} icon="⏳" color="orange" subtext="Pending Departments" />
        <StatCard label="Total Departments" value={stats.totalDepartments} icon="🏢" color="blue" subtext="Departments to clear" />
        <StatCard label="Cleared" value={stats.cleared} icon="✔" color="green" subtext="Departments cleared" />
        <StatCard label="Pending" value={stats.pending} icon="⏱" color="red" subtext="Departments pending" />
      </div>

      <div className="content-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: '24px' }}>
        <Panel title="Clearance Overview">
          <DonutChart data={donutData} total={stats.totalDepartments} centerValue={`${stats.progress}%`} centerLabel="Cleared" />
        </Panel>
        <Panel title="Recently Updated">
          {departments.length === 0 ? (
            <div className="empty-message" style={{ padding: '40px 0' }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📭</span>
              <p>No departments added yet. Go to "My Clearance" to add one.</p>
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
      { key: 'action', header: 'Action', render: (item: StudentDepartmentStatus) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button variant="ghost" size="sm" onClick={() => handleViewDepartment(item)}>View</Button>
          <button onClick={() => handleDeleteDepartment(item.departmentId, item.departmentName)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '16px', opacity: 0.7 }} title="Delete">🗑️</button>
        </div>
      )}
    ];
    
    const joinedNames = departments.map(d => d.departmentName);
    const availableToJoin = SYSTEM_DEPARTMENTS.filter(d => !joinedNames.includes(d));

    return (
      <>
        <section className="page-header">
          <div className="page-header-text">
            <h2>My Clearance</h2>
            <p>Detailed view of your clearance status.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="ghost" onClick={() => setIsAddDeptModalOpen(true)}>+ Add Department</Button>
            <Button variant="primary" onClick={() => window.print()}>🖨️ Print Clearance</Button>
          </div>
        </section>
        
        <Panel title="Department Clearance Details">
          <Table columns={columns} data={departments} emptyMessage="You haven't added any departments yet. Click '+ Add Department' above." />
        </Panel>

        {isAddDeptModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26, 34, 64, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', padding: '32px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', boxShadow: 'var(--clay-shadow-hover)' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', color: 'var(--text-dark)' }}>Join a Department</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Select a department to request clearance.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {availableToJoin.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>You have already joined all available departments.</p>
                ) : (
                  availableToJoin.map((dept) => (
                    <button key={dept} onClick={() => handleAddDepartmentToStudent(dept)} style={{ padding: '14px', borderRadius: '12px', border: '1px solid #eee', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, color: 'var(--text-dark)' }} onMouseEnter={(e) => e.currentTarget.style.background = '#e8eaf6'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-base)'}>
                      <span>{dept}</span>
                      <span style={{ color: 'var(--blue-primary)' }}>+ Add</span>
                    </button>
                  ))
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <Button variant="ghost" onClick={() => setIsAddDeptModalOpen(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderRemarks = () => {
    const filteredRemarks = remarks.filter(r => (statusFilter === 'all' || r.status === statusFilter) && (!searchTerm || r.department.toLowerCase().includes(searchTerm.toLowerCase()) || r.remarks.toLowerCase().includes(searchTerm.toLowerCase())));
    const columns = [
      { key: 'department', header: 'Department', render: (item: Remark) => <strong>{item.department}</strong> },
      { key: 'date', header: 'Date' },
      { key: 'status', header: 'Status', render: (item: Remark) => <Badge variant={item.status === 'cleared' ? 'approved' : item.status === 'pending' ? 'pending' : 'rejected'}>{item.status}</Badge> },
      { key: 'remarks', header: 'Remarks' }
    ];
    return (
      <>
        <section className="page-header">
          <div className="page-header-text"><h2>View Remarks</h2><p>Review feedback and remarks.</p></div>
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
          <Table columns={columns} data={filteredRemarks} emptyMessage="No remarks found. Add a department first to generate remarks." />
        </Panel>
      </>
    );
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'var(--font-family)' }}>
      <aside style={{ width: '280px', padding: '24px 20px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderRight: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '8px', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '24px' }}>
          <div style={{ width: '42px', height: '42px', background: 'var(--blue-primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '20px' }}>🛡️</div>
          <div><h1 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>ClearPass</h1><span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>STUDENT PORTAL</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '12px', borderRadius: '20px', boxShadow: 'var(--clay-shadow-out)', marginBottom: '24px' }}>
          <div style={{ width: '44px', height: '44px', background: '#e8eaf6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>👩‍🎓</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-dark)' }}>{userName}</span><span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Student</span></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {[{ id: 'dashboard', label: 'Dashboard', icon: '🏠' }, { id: 'clearance', label: 'My Clearance', icon: '📋' }, { id: 'remarks', label: 'View Remarks', icon: '📝' }].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '14px 18px', borderRadius: '16px', border: 'none', background: activeTab === item.id ? 'var(--blue-primary)' : 'transparent', color: activeTab === item.id ? '#fff' : 'var(--text-muted)', fontWeight: 600, fontSize: '14px', cursor: 'pointer', textAlign: 'left' }}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </div>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', borderRadius: '16px', border: 'none', background: '#fff0f0', color: '#e03131', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>🚪 Logout</button>
      </aside>

      <main style={{ flex: 1, padding: '32px 48px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ flex: 1, maxWidth: '400px' }}><SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Global Search..." /></div>
          
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button onClick={() => setIsNotifOpen(!isNotifOpen)} style={{ background: '#fff', border: 'none', width: '48px', height: '48px', borderRadius: '50%', boxShadow: 'var(--clay-shadow-out)', cursor: 'pointer', fontSize: '20px' }}>🔔</button>
            {isNotifOpen && (
              <div style={{ position: 'absolute', top: '60px', right: 0, width: '320px', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '16px', zIndex: 1000, border: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-dark)' }}>Notifications</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', gap: '12px', padding: '10px', borderRadius: '8px', background: 'var(--bg-base)' }}>
                    <span style={{ fontSize: '18px' }}>📢</span>
                    <div>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-dark)' }}>Welcome to ClearPass!</p>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Start by adding departments.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'clearance' && renderClearance()}
        {activeTab === 'remarks' && renderRemarks()}
      </main>

      {isViewModalOpen && selectedDept && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(26, 34, 64, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', boxShadow: 'var(--clay-shadow-hover)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ fontSize: '32px' }}>{selectedDept.status === 'cleared' ? '✅' : selectedDept.status === 'pending' ? '⏳' : '❌'}</div>
              <div><h3 style={{ margin: 0, fontSize: '20px', color: 'var(--text-dark)' }}>{selectedDept.departmentName}</h3><span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Status: <Badge variant={selectedDept.status === 'cleared' ? 'approved' : selectedDept.status === 'pending' ? 'pending' : 'rejected'}>{selectedDept.status}</Badge></span></div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', color: 'var(--text-dark)', marginBottom: '8px' }}>Requirements</h4>
              <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{selectedDept.requirements && selectedDept.requirements.length > 0 ? selectedDept.requirements.map((req, i) => <li key={i}>{req}</li>) : <li>No specific requirements</li>}</ul>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '14px', color: 'var(--text-dark)', marginBottom: '8px' }}>Remarks / Notes</h4>
              <p style={{ padding: '16px', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>{selectedDept.remarks || 'No remarks provided.'}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="primary" onClick={() => setIsViewModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;