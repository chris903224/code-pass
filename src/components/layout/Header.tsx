import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import SearchBox from '../common/SearchBox';

interface HeaderProps {
  onMenuClick: () => void;
  onSearch?: (term: string) => void;
  title?: string;
}

const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onSearch,
  title,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // ============================================================
  // CHECK MOBILE
  // ============================================================
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // ============================================================
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown((prev) => !prev);
  };

  // ============================================================
  // NAVIGATION HANDLERS
  // ============================================================
  const navigateToProfile = () => {
    setShowDropdown(false);
    navigate(`/${user?.userType}/profile`);
  };

  const navigateToSettings = () => {
    setShowDropdown(false);
    navigate(`/${user?.userType}/settings`);
  };

  const navigateToHelp = () => {
    setShowDropdown(false);
    navigate(`/${user?.userType}/help`);
  };

  // ============================================================
  // USER INFO
  // ============================================================
  const userRole = user?.userType === 'student'
    ? 'Student'
    : user?.userType === 'department'
    ? 'Department Head'
    : 'Administrator';

  const userInitial = user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U';

  // ============================================================
  // DROPDOWN ITEMS WITH NAVIGATION
  // ============================================================
  const dropdownItems = [
    { 
      icon: '👤', 
      label: 'Profile', 
      onClick: navigateToProfile,
      description: 'View and edit your profile'
    },
    { 
      icon: '⚙️', 
      label: 'Settings', 
      onClick: navigateToSettings,
      description: 'Manage your preferences'
    },
    { 
      icon: '❓', 
      label: 'Help & Support', 
      onClick: navigateToHelp,
      description: 'Get assistance'
    },
  ];

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <header className="topbar">
      <button className="menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
        ☰
      </button>

      {title && (
        <div className="topbar-title">
          <h2>{title}</h2>
        </div>
      )}

      <SearchBox
        value={searchValue}
        onChange={handleSearch}
        placeholder={isMobile ? 'Search...' : 'Search here...'}
        className="topbar-search"
      />

      <div className="top-actions">
        <button 
          className="icon-btn" 
          aria-label="Notifications"
          onClick={() => navigate(`/${user?.userType}/notifications`)}
        >
          🔔<span className="dot"></span>
        </button>

        <div
          className="profile"
          onClick={toggleDropdown}
          ref={profileRef}
        >
          <div className="profile-avatar">
            {user?.fullName ? (
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                alt={user.fullName}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="profile-initial">{userInitial}</span>
            )}
          </div>
          <div className="profile-text">
            <strong>{user?.fullName || user?.username || 'User'}</strong>
            <span>{userRole}</span>
          </div>
          <span className="chevron">{showDropdown ? '⌃' : '⌄'}</span>
        </div>

        {showDropdown && (
          <div className="logout-dropdown" ref={dropdownRef}>
            <div className="dropdown-header">
              <div className="dropdown-user">
                <div className="dropdown-avatar">
                  {user?.fullName ? (
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                      alt={user.fullName}
                    />
                  ) : (
                    <span className="dropdown-initial">{userInitial}</span>
                  )}
                </div>
                <div className="dropdown-user-info">
                  <div className="dropdown-name">{user?.fullName || user?.username}</div>
                  <div className="dropdown-role">{userRole}</div>
                  <div className="dropdown-email">{user?.email || 'user@example.com'}</div>
                </div>
              </div>
            </div>

            <div className="dropdown-divider" />

            {dropdownItems.map((item, index) => (
              <div
                key={index}
                className="dropdown-item"
                onClick={item.onClick}
              >
                <span className="dropdown-item-icon">{item.icon}</span>
                <div className="dropdown-item-content">
                  <div className="dropdown-item-label">{item.label}</div>
                  {item.description && (
                    <div className="dropdown-item-description">{item.description}</div>
                  )}
                </div>
              </div>
            ))}

            <div className="dropdown-divider" />

            <div
              className="dropdown-item logout"
              onClick={handleLogout}
            >
              <span className="dropdown-item-icon">🚪</span>
              <div className="dropdown-item-content">
                <div className="dropdown-item-label">Logout</div>
                <div className="dropdown-item-description">Sign out of your account</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;