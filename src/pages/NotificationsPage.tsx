import React from 'react';
import Layout from '../components/layout/Layout';
import Panel from '../components/common/Panel';
import Badge from '../components/common/Badge';

const NotificationsPage: React.FC = () => {
  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: 'Clearance Request Approved',
      message: 'Your clearance request for IT Department has been approved.',
      time: '2 hours ago',
      read: false,
      type: 'success',
    },
    {
      id: 2,
      title: 'New Requirement Added',
      message: 'Finance Office added a new requirement for your clearance.',
      time: '5 hours ago',
      read: false,
      type: 'warning',
    },
    {
      id: 3,
      title: 'Clearance Request Rejected',
      message: 'Your clearance request for Library was rejected. Please check the remarks.',
      time: '1 day ago',
      read: true,
      type: 'error',
    },
    {
      id: 4,
      title: 'Reminder: Submit Documents',
      message: 'Please submit your requirements for CSDL Office before the deadline.',
      time: '2 days ago',
      read: true,
      type: 'info',
    },
  ];

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'approved';
      case 'warning':
        return 'pending';
      case 'error':
        return 'rejected';
      default:
        return 'info';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  return (
    <Layout title="Notifications">
      <div className="notifications-page">
        <div className="page-header">
          <div className="page-header-text">
            <h2>Notifications</h2>
            <p>Stay updated with your clearance status</p>
          </div>
          <div className="page-header-actions">
            <button className="pill-btn ghost">
              Mark All as Read
            </button>
          </div>
        </div>

        <Panel>
          {notifications.length === 0 ? (
            <div className="panel-empty">
              <span className="empty-icon">🔔</span>
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                >
                  <div className="notification-icon">
                    <span>{getIcon(notif.type)}</span>
                  </div>
                  <div className="notification-content">
                    <div className="notification-header">
                      <strong>{notif.title}</strong>
                      <Badge variant={getBadgeVariant(notif.type)}>
                        {notif.type}
                      </Badge>
                    </div>
                    <p className="notification-message">{notif.message}</p>
                    <span className="notification-time">{notif.time}</span>
                  </div>
                  {!notif.read && (
                    <div className="notification-unread-dot"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </Layout>
  );
};

export default NotificationsPage;