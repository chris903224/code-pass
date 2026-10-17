import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from 'react-router-dom';
import type { NavItem } from './Sidebar';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  onSearch?: (term: string) => void;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  onSearch,
  className = '',
}) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    if (isMobile) {
      setSidebarOpen(false);
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, [isMobile, location]);

  const getNavItems = (): NavItem[] => {
    if (!user) return [];

    const basePath = user.userType;

    // Student Nav Items - FIXED: Inalis ang duplicates
    const studentItems: NavItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '🏠',
        path: `/${basePath}/dashboard`,
      },
      {
        id: 'remarks',
        label: 'View Remarks',
        icon: '📝',
        path: `/${basePath}/remarks`,
      },
      {
        id: 'clearance',
        label: 'My Clearance',
        icon: '📋',
        path: `/${basePath}/clearance`,
      },
    ];

    const adminItems: NavItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '🏠',
        path: `/${basePath}/dashboard`,
      },
      {
        id: 'departments',
        label: 'Departments',
        icon: '🏛️',
        path: `/${basePath}/departments`,
      },
      {
        id: 'students',
        label: 'Students',
        icon: '👨‍🎓',
        path: `/${basePath}/students`,
      },
      {
        id: 'reports',
        label: 'Reports',
        icon: '📊',
        path: `/${basePath}/reports`,
      },
    ];

    const departmentItems: NavItem[] = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '🏠',
        path: `/${basePath}/dashboard`,
      },
      {
        id: 'requests',
        label: 'Clearance Requests',
        icon: '📄',
        path: `/${basePath}/requests`,
      },
      {
        id: 'approved',
        label: 'Approved List',
        icon: '✅',
        path: `/${basePath}/approved`,
      },
      {
        id: 'report',
        label: 'Report',
        icon: '📊',
        path: `/${basePath}/report`,
      },
    ];

    switch (user.userType) {
      case 'admin':
        return adminItems;
      case 'department':
        return departmentItems;
      case 'student':
        return studentItems;
      default:
        return [];
    }
  };

  const classes = [
    'app-layout',
    sidebarOpen ? 'sidebar-open' : '',
    isMobile ? 'app-mobile' : 'app-desktop',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (!user) {
    return (
      <div className="app-layout">
        <main className="main-content">
          <div className="page-content">{children}</div>
        </main>
      </div>
    );
  }

  return (
    <div className={classes}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navItems={getNavItems()}
        userType={user.userType}
        isMobile={isMobile}
      />

      <div className="main-content">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onSearch={onSearch}
          title={title}
        />

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;