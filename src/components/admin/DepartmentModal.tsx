import React, { useState, useEffect } from 'react';
import type { Department } from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (department: Partial<Department>) => void;
  department?: Department | null;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  department,
}) => {
  const [formData, setFormData] = useState<Partial<Department>>({
    name: '',
    head: '',
    status: 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        head: department.head,
        status: department.status,
      });
    } else {
      setFormData({
        name: '',
        head: '',
        status: 'active',
      });
    }
    setErrors({});
  }, [department, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Department name is required';
    }
    if (!formData.head?.trim()) {
      newErrors.head = 'Department head is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving department:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay glass-overlay" onClick={onClose}>
      <div className="modal glass-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header glass-header">
          <h3>{department ? 'Edit Department' : 'Add Department'}</h3>
          <button className="modal-close glass-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body glass-body">
            <Input
              label="Department Name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              error={errors.name}
              placeholder="Enter department name"
              required
              disabled={isSubmitting}
              icon="🏛️"
            />

            <Input
              label="Department Head"
              name="head"
              value={formData.head || ''}
              onChange={handleChange}
              error={errors.head}
              placeholder="Enter department head name"
              required
              disabled={isSubmitting}
              icon="👤"
            />

            <div className="form-group glass-form-group">
              <label htmlFor="status" className="glass-label">Status</label>
              <select
                id="status"
                name="status"
                className="glass-select"
                value={formData.status || 'active'}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="modal-footer glass-footer">
            <Button 
              variant="ghost" 
              onClick={onClose}
              disabled={isSubmitting}
              className="glass-btn-cancel"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              isLoading={isSubmitting}
              className="glass-btn-create"
            >
              {department ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;