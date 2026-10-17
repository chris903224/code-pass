import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Brand from './Brand';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: string | number;
  disabled?: boolean;
  children?: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  userType?: string;
  className?: string;
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  navItems,
  userType = 'admin',
  className = '',
  isMobile = false,
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const expanded: string[] = [];

    navItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => currentPath.includes(child.path)
        );
        if (hasActiveChild) {
          expanded.push(item.id);
        }
      }
    });

    setExpandedItems(expanded);
  }, [location.pathname, navItems]);

  const handleNavClick = (path: string) => {
    if (path.startsWith('/')) {
      navigate(path);
    } else {
      navigate(`/${userType}/${path}`);
    }
    if (isMobile) {
      onClose();
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const isActive = (path: string) => {
    const currentPath = location.pathname;
    if (path.startsWith('/')) {
      return currentPath === path;
    }
    return currentPath.includes(path);
  };

  const classes = [
    'sidebar',
    isOpen ? 'sidebar-open' : '',
    isMobile ? 'sidebar-mobile' : 'sidebar-desktop',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.path);

    return (
      <div key={item.id} className="nav-item-wrapper">
        <div
          className={[
            'nav-item',
            active ? 'active' : '',
            item.disabled ? 'disabled' : '',
            hasChildren ? 'has-children' : '',
            isExpanded ? 'expanded' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ paddingLeft: depth > 0 ? `${depth * 16 + 16}px` : undefined }}
          onClick={() => {
            if (item.disabled) return;
            if (hasChildren) {
              toggleExpand(item.id);
            } else {
              handleNavClick(item.path);
            }
          }}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
          {item.badge && (
            <span className="nav-badge">{item.badge}</span>
          )}
          {hasChildren && (
            <span className="nav-chevron">
              {isExpanded ? '⌄' : '›'}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="nav-children">
            {item.children!.map((child) =>
              renderNavItem(child, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <aside className={classes}>
        <div className="sidebar-header">
          <Brand variant="compact" />
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => renderNavItem(item))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-illustration" aria-hidden="true" />
        </div>
      </aside>

      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}
    </>
  );
};

export default Sidebar;