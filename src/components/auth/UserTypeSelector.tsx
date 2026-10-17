import React from 'react';
import type { UserType } from '../../types';

interface UserTypeSelectorProps {
  selectedType: UserType;
  onSelect: (type: UserType) => void;
  isRegister?: boolean;
  disabled?: boolean;
}

const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({
  selectedType,
  onSelect,
  isRegister = false,
  disabled = false,
}) => {
  const userTypes: { value: UserType; label: string; icon: string }[] = [
    { value: 'student', label: 'Student', icon: '👨‍🎓' },
    { value: 'department', label: 'Department', icon: '🏛️' },
    { value: 'admin', label: 'Admin', icon: '👑' },
  ];

  const className = isRegister ? 'register-type-btn' : '';

  const handleSelect = (type: UserType) => {
    if (!disabled) {
      onSelect(type);
    }
  };

  return (
    <div className="user-type-selector">
      {userTypes.map(({ value, label, icon }) => (
        <button
          key={value}
          className={`user-type-btn ${selectedType === value ? 'active' : ''} ${className}`}
          onClick={() => handleSelect(value)}
          type="button"
          disabled={disabled}
          aria-label={`Select ${label} role`}
        >
          <span className="user-type-icon">{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
};

export default UserTypeSelector;