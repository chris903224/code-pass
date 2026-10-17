import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';
import Panel from '../components/common/Panel';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    email: user?.email || 'user@example.com',
    studentId: user?.studentId || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // TODO: Save profile changes
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <Layout title="Profile">
      <div className="profile-page">
        <div className="page-header">
          <div className="page-header-text">
            <h2>My Profile</h2>
            <p>View and manage your personal information</p>
          </div>
          <div className="page-header-actions">
            <Button
              variant={isEditing ? 'success' : 'primary'}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              {isEditing ? '💾 Save Changes' : '✏️ Edit Profile'}
            </Button>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-avatar-large">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
              alt={user?.fullName}
            />
          </div>

          <Panel title="Personal Information">
            <div className="profile-form">
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                icon="👤"
              />
              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={!isEditing}
                icon="🆔"
              />
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                icon="📧"
              />
              {user?.studentId && (
                <Input
                  label="Student ID"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  disabled={true}
                  icon="🎓"
                />
              )}
            </div>
          </Panel>

          <Panel title="Account Information">
            <div className="account-info">
              <div className="info-row">
                <span className="info-label">Account Type</span>
                <span className="info-value">
                  {user?.userType === 'student' ? 'Student' :
                   user?.userType === 'department' ? 'Department Head' : 'Administrator'}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Account Status</span>
                <span className="info-value status-active">Active</span>
              </div>
              <div className="info-row">
                <span className="info-label">Joined</span>
                <span className="info-value">January 2024</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;