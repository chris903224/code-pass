import React, { useState, useEffect } from 'react';
import type { Column } from '../../types';
import Layout from '../layout/Layout';
import Panel from '../common/Panel';
import StatCard from '../common/StatCard';
import Button from '../common/Button';
import Table from '../common/Table';

interface ReportData {
  id: string;
  department: string;
  totalRequests: number;
  approved: number;
  pending: number;
  rejected: number;
  approvalRate: number;
}

interface ReportStats {
  totalRequests: number;
  approvalRate: number;
  processingTime: number;
  rejectionRate: number;
}

const DepartmentReport: React.FC = () => {
  // ============================================================
  // STATE
  // ============================================================
  const [period, setPeriod] = useState('semester');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [stats, setStats] = useState<ReportStats>({
    totalRequests: 0,
    approvalRate: 0,
    processingTime: 0,
    rejectionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const periods = [
    { value: 'semester', label: 'This Semester' },
    { value: 'month', label: 'This Month' },
    { value: 'week', label: 'This Week' },
  ];

  // ============================================================
  // FETCH DATA
  // ============================================================
  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        setStats({
          totalRequests: 0,
          approvalRate: 0,
          processingTime: 0,
          rejectionRate: 0,
        });
        setReportData([]);
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [period]);

  // ============================================================
  // TABLE COLUMNS
  // ============================================================
  const columns: Column<ReportData>[] = [
    {
      key: 'department',
      header: 'Department',
      render: (item: ReportData) => <strong>{item.department}</strong>,
    },
    { key: 'totalRequests', header: 'Total Requests' },
    { key: 'approved', header: 'Approved' },
    { key: 'pending', header: 'Pending' },
    { key: 'rejected', header: 'Rejected' },
    {
      key: 'approvalRate',
      header: 'Approval Rate',
      render: (item: ReportData) => `${item.approvalRate}%`,
    },
  ];

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleDownload = async () => {
    try {
      alert('Download functionality will be implemented.');
    } catch (error) {
      console.error('Error downloading report:', error);
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
          <p>Loading report data...</p>
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
        <section className="page-header">
          <div className="page-header-text">
            <h2>Report & Analytics</h2>
            <p>Insights and trends on clearance activity.</p>
          </div>
          <div className="page-header-actions">
            <select
              className="select-filter"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              {periods.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <Button variant="primary" onClick={handleDownload}>
              ⬇ Download Report
            </Button>
          </div>
        </section>

        <section className="stats-grid report-stat">
          <StatCard
            label="Total Requests"
            value={stats.totalRequests}
            icon="📋"
            color="blue"
            subtext={periods.find((p) => p.value === period)?.label}
          />
          <StatCard
            label="Approval Rate"
            value={`${stats.approvalRate}%`}
            icon="📈"
            color="green"
            subtext={`${stats.totalRequests > 0 ? Math.round(stats.totalRequests * stats.approvalRate / 100) : 0} of ${stats.totalRequests} requests`}
          />
          <StatCard
            label="Avg. Processing Time"
            value={`${stats.processingTime}d`}
            icon="⚡"
            color="purple"
            subtext="From request to decision"
          />
          <StatCard
            label="Rejection Rate"
            value={`${stats.rejectionRate}%`}
            icon="📉"
            color="red"
            subtext={`${stats.totalRequests > 0 ? Math.round(stats.totalRequests * stats.rejectionRate / 100) : 0} of ${stats.totalRequests} requests`}
          />
        </section>

        <div className="report-grid">
          <Panel title="Requests by Course">
            <p className="chart-sub">
              Number of clearance requests by course, {periods.find((p) => p.value === period)?.label}
            </p>
            <div className="chart-placeholder">
              <p className="empty-message">Chart data will be displayed here.</p>
            </div>
          </Panel>

          <Panel title="Status Breakdown">
            <p className="chart-sub">Current standing of all requests</p>
            <div className="chart-placeholder">
              <p className="empty-message">Donut chart will be displayed here.</p>
            </div>
          </Panel>
        </div>

        <Panel title="Requests by Department">
          <Table
            columns={columns}
            data={reportData}
            emptyMessage="No report data available."
          />
        </Panel>
      </div>
    </Layout>
  );
};

export default DepartmentReport;