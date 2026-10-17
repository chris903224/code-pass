import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import Panel from '../components/common/Panel';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: false,
    language: 'en',
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleSettingChange = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePassword = () => {
    if (password.new !== password.confirm) {
      alert('Passwords do not match!');
      return;
    }
    if (password.new.length < 8) {
      alert('Password must be at least 8 characters!');
      return;
    }
    alert('Password updated successfully!');
    setPassword({ current: '', new: '', confirm: '' });
  };

  return (
    <Layout title="Settings">
      <div className="settings-page">
        <div className="page-header">
          <div className="page-header-text">
            <h2>Settings</h2>
            <p>Manage your account preferences and security</p>
          </div>
        </div>

        <div className="settings-content">
          <Panel title="🔔 Notifications">
            <div className="settings-options">
              <div className="setting-item">
                <div className="setting-info">
                  <strong>Push Notifications</strong>
                  <p>Receive notifications about your clearance status</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={() => handleSettingChange('notifications')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <strong>Email Updates</strong>
                  <p>Receive email updates about your clearance requests</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.emailUpdates}
                    onChange={() => handleSettingChange('emailUpdates')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </Panel>

          <Panel title="🔐 Security">
            <div className="password-section">
              <h4>Change Password</h4>
              <Input
                type="password"
                name="current"
                label="Current Password"
                value={password.current}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />
              <Input
                type="password"
                name="new"
                label="New Password"
                value={password.new}
                onChange={handlePasswordChange}
                placeholder="Enter new password (min. 8 characters)"
              />
              <Input
                type="password"
                name="confirm"
                label="Confirm New Password"
                value={password.confirm}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
              />
              <Button variant="primary" onClick={handleSavePassword}>
                Update Password
              </Button>
            </div>
          </Panel>

          <Panel title="🌐 Preferences">
            <div className="settings-options">
              <div className="setting-item">
                <div className="setting-info">
                  <strong>Language</strong>
                  <p>Select your preferred language</p>
                </div>
                <select
                  className="select-filter"
                  value={settings.language}
                  onChange={(e) => setSettings((prev) => ({ ...prev, language: e.target.value }))}
                >
                  <option value="en">English</option>
                  <option value="tl">Filipino</option>
                </select>
              </div>
              <div className="setting-item">
                <div className="setting-info">
                  <strong>Dark Mode</strong>
                  <p>Switch between light and dark theme</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={() => handleSettingChange('darkMode')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;