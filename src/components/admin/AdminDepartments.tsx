import React, { useState, useEffect } from 'react';
import type { Department, Column } from '../../types';
import { adminService } from '../../services/admin.service';
import Layout from '../layout/Layout';
import Table from '../common/Table';
import Button from '../common/Button';
import Panel from '../common/Panel';
import Badge from '../common/Badge';
import SearchBox from '../common/SearchBox';
import DepartmentModal from './DepartmentModal';

const AdminDepartments: React.FC = () => {
  // ============================================================
  // STATE
  // ============================================================
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // FETCH DEPARTMENTS FROM SUPABASE
  // ============================================================
  useEffect(() => {
    const fetchDepartments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('🔍 Fetching departments from Supabase...');
        const data = await adminService.getDepartments();
        console.log('✅ Departments loaded:', data.length);
        setDepartments(data);
      } catch (err) {
        console.error('❌ Error fetching departments:', err);
        setError('Failed to load departments. Please try again.');
        setDepartments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // ============================================================
  // FILTER DEPARTMENTS
  // ============================================================
  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.head.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============================================================
  // TABLE COLUMNS
  // ============================================================
  const columns: Column<Department>[] = [
    {
      key: 'name',
      header: 'Department Name',
      render: (item: Department) => <strong>{item.name}</strong>,
    },
    { key: 'head', header: 'Head' },
    { key: 'totalRequests', header: 'Total Requests' },
    { key: 'pending', header: 'Pending' },
    { key: 'approved', header: 'Approved' },
    { key: 'rejected', header: 'Rejected' },
    {
      key: 'status',
      header: 'Status',
      render: (item: Department) => (
        <Badge variant={item.status === 'active' ? 'active' : 'inactive'}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: 'id',
      header: 'Action',
      render: (item: Department) => (
        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
          Edit
        </Button>
      ),
    },
  ];

  // ============================================================
  // HANDLERS - SAVE TO SUPABASE
  // ============================================================
  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleSave = async (departmentData: Partial<Department>) => {
    try {
      setIsLoading(true);
      
      if (editingDepartment) {
        // ===== UPDATE EXISTING DEPARTMENT =====
        console.log('📝 Updating department:', editingDepartment.id);
        const updated = await adminService.updateDepartment(
          editingDepartment.id,
          departmentData
        );
        
        // Update local state
        setDepartments((prev) =>
          prev.map((dept) =>
            dept.id === editingDepartment.id ? updated : dept
          )
        );
        console.log('✅ Department updated:', updated.name);
      } else {
        // ===== CREATE NEW DEPARTMENT =====
        console.log('📝 Creating new department...');
        const newDepartment: Omit<Department, 'id'> = {
          name: departmentData.name || '',
          head: departmentData.head || '',
          status: departmentData.status || 'active',
          totalRequests: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        };
        
        const created = await adminService.createDepartment(newDepartment);
        
        // Add to local state
        setDepartments((prev) => [...prev, created]);
        console.log('✅ Department created:', created.name);
      }
      
      setIsModalOpen(false);
    } catch (err) {
      console.error('❌ Error saving department:', err);
      alert('Failed to save department. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    
    try {
      setIsLoading(true);
      console.log('🗑️ Deleting department...');
      await adminService.deleteDepartment(id);
      
      // Remove from local state
      setDepartments((prev) => prev.filter((dept) => dept.id !== id));
      console.log('✅ Department deleted');
    } catch (err) {
      console.error('❌ Error deleting department:', err);
      alert('Failed to delete department. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (isLoading && departments.length === 0) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading departments...</p>
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
          <p className="error-message">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </Layout>
    );
  }


  return (
    <Layout>
      <div className="admin-page">
        {/* ===== HEADER ===== */}
        <section className="page-header">
          <div className="page-header-text">
            <h2>Departments</h2>
            <p>Manage all departments and their clearance status.</p>
          </div>
          <div className="page-header-actions">
            <Button variant="primary" onClick={handleAddDepartment}>
              + Add Department
            </Button>
          </div>
        </section>

        {/* ===== TOOLBAR ===== */}
        <div className="toolbar">
          <SearchBox
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search departments..."
          />
        </div>


        <Panel>
          <Table
            columns={columns}
            data={filteredDepartments}
            onRowClick={(row) => console.log('Selected:', row)}
            emptyMessage="No departments found. Click 'Add Department' to create one."
          />
          <div className="pagination">
            <span className="pagination-info">
              Showing {filteredDepartments.length} of {departments.length} departments
            </span>
          </div>
        </Panel>

        {/* ===== MODAL ===== */}
        <DepartmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          department={editingDepartment}
        />
      </div>
    </Layout>
  );
};

export default AdminDepartments;  