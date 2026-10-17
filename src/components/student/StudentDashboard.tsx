import React, { useState, useEffect } from 'react';
import type { ClearanceStats, StudentDepartmentStatus } from '../../types';
import Layout from '../layout/Layout';
import StatCard from '../common/StatCard';
import Panel from '../common/Panel';
import Button from '../common/Button';
import Badge from '../common/Badge';
import DonutChart from '../dashboard/DonutChart';

interface StudentDashboardProps {
  studentId?: string;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  studentId,
}) => {
  // ============================================================
  // STATE
  // ============================================================
  const [stats, setStats] = useState<ClearanceStats>({
    totalDepartments: 0,
    cleared: 0,
    pending: 0,
    inProgress: 0,
    progress: 0,
  });

  const [departments, setDepartments] = useState<StudentDepartmentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('Student');

  // ============================================================
  // FETCH DATA
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fullName = sessionStorage.getItem('fullName') || 'Student';
        setUserName(fullName);

        // TODO: Replace with actual API calls
        setStats({
          totalDepartments: 0,
          cleared: 0,
          pending: 0,
          inProgress: 0,
          progress: 0,
        });
        setDepartments([]);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // ============================================================
  // DONUT CHART DATA
  // ============================================================
  const donutData = [
    {
      label: 'Cleared',
      value: stats.cleared,
      color: '#2ecc71',
    },
    {
      label: 'Pending',
      value: stats.pending,
      color: '#ffa94d',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      color: '#6c8cff',
    },
  ];

  // ============================================================
  // HANDLERS - ADD THESE
  // ============================================================
  const handleContactSupport = () => {
    alert('Support team has been notified. You will receive an email shortly.');
  };

  const handleStatCardClick = (cardName: string) => {
    console.log(`Clicked: ${cardName}`);
    // Navigate to relevant page
  };

  const handleDonutSegmentClick = (label: string) => {
    console.log(`Clicked donut segment: ${label}`);
    // Filter or navigate based on segment
  };

  const handleReminderClick = (title: string) => {
    console.log(`Clicked reminder: ${title}`);
    // Show details or navigate
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
      <div className="student-dashboard">
        {/* ===== HERO SECTION ===== */}
        <section className="hero hero-open">
          <div className="hero-text">
            <h2>
              Hello, {userName}! <span className="wave">👋</span>
            </h2>
            <p>Welcome to your student dashboard.</p>
          </div>
        </section>

        {/* ===== STATS ROW ===== */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-lg-3" onClick={() => handleStatCardClick('Clearance Status')}>
            <StatCard
              label="My Clearance Status"
              value={stats.progress > 0 ? `${stats.progress}%` : 'No Data'}
              icon="⏳"
              color="orange"
              subtext={
                stats.pending > 0
                  ? `You have ${stats.pending} pending departments`
                  : 'No pending departments'
              }
            />
          </div>
          <div className="col-6 col-lg-3" onClick={() => handleStatCardClick('Total Departments')}>
            <StatCard
              label="Total Departments"
              value={stats.totalDepartments}
              icon="🏢"
              color="blue"
              subtext="Departments to clear"
            />
          </div>
          <div className="col-6 col-lg-3" onClick={() => handleStatCardClick('Cleared')}>
            <StatCard
              label="Cleared"
              value={stats.cleared}
              icon="✔"
              color="green"
              subtext="Departments cleared"
            />
          </div>
          <div className="col-6 col-lg-3" onClick={() => handleStatCardClick('Pending')}>
            <StatCard
              label="Pending"
              value={stats.pending}
              icon="⏱"
              color="red"
              subtext="Departments pending"
            />
          </div>
        </div>

        {/* ===== CONTENT ROW ===== */}
        <div className="row g-3 mb-3">
          {/* ===== CLEARANCE OVERVIEW ===== */}
          <div className="col-lg-4">
            <Panel title="Clearance Overview">
              <div onClick={() => console.log('Donut chart clicked')}>
                <DonutChart
                  data={donutData}
                  total={stats.totalDepartments}
                  centerValue={stats.progress > 0 ? `${stats.progress}%` : '0%'}
                  centerLabel="Cleared"
                  showLegend={true}
                  legendPosition="bottom"
                />
              </div>
            </Panel>
          </div>

          {/* ===== RECENTLY UPDATED ===== */}
          <div className="col-lg-4">
            <Panel title="Recently Updated">
              {departments.length === 0 ? (
                <div className="panel-empty">
                  <span className="empty-icon">📭</span>
                  <p>No departments added yet</p>
                </div>
              ) : (
                <ul className="recent-list">
                  {departments.slice(0, 5).map((dept) => (
                    <li 
                      key={dept.departmentId}
                      onClick={() => console.log(`Clicked: ${dept.departmentName}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="recent-icon">
                        {dept.status === 'cleared' ? '✅' : '⏳'}
                      </span>
                      <div className="recent-main">
                        <strong>{dept.departmentName}</strong>
                        <span className="recent-date">{dept.dateUpdated}</span>
                      </div>
                      <Badge
                        variant={
                          dept.status === 'cleared'
                            ? 'approved'
                            : dept.status === 'pending'
                            ? 'pending'
                            : 'rejected'
                        }
                      >
                        {dept.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          {/* ===== REMINDERS ===== */}
          <div className="col-lg-4">
            <Panel title="⏰ Reminders">
              <div 
                className="reminder-item"
                onClick={() => handleReminderClick('Submit all required documents')}
                style={{ cursor: 'pointer' }}
              >
                <span className="reminder-icon chip-yellow">📄</span>
                <div>
                  <strong>Submit all required documents</strong>
                  <p>
                    Please ensure all required documents are submitted in a
                    timely manner.
                  </p>
                </div>
              </div>
              <div 
                className="reminder-item"
                onClick={() => handleReminderClick('Follow schedule')}
                style={{ cursor: 'pointer' }}
              >
                <span className="reminder-icon chip-blue">📅</span>
                <div>
                  <strong>Follow schedule</strong>
                  <p>Follow the scheduled deadlines and timelines.</p>
                </div>
              </div>
              <div 
                className="reminder-item"
                onClick={() => handleReminderClick('Clearance completion')}
                style={{ cursor: 'pointer' }}
              >
                <span className="reminder-icon chip-green">✅</span>
                <div>
                  <strong>Clearance completion</strong>
                  <p>
                    Ensure that all clearance requirements are completed before
                    the end of the semester.
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </div>

        {/* ===== HELP SECTION ===== */}
        <div className="panel help-panel-row">
          <div className="help-panel-icon">🎧</div>
          <div className="help-panel-text">
            <h3 className="panel-title mb-1">Need Help?</h3>
            <p>
              If you have questions or encounter issues with your clearance,
              please contact your department or the system administrator for
              assistance.
            </p>
          </div>
          <Button 
            variant="primary" 
            onClick={handleContactSupport} 
            className="help-btn"
          >
            🎧 Contact Support
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;