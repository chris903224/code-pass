import React, { useRef } from 'react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  icon?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
}

const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholder = 'Search here...',
  className = '',
  onSearch,
  onClear,
  icon = '🔍',
  disabled = false,
  size = 'md',
  autoFocus = false,
}) => {
  // ============================================================
  // REFS
  // ============================================================
  const inputRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  const handleClear = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus();
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(value);
    }
  };

  // ============================================================
  // SIZES
  // ============================================================
  const sizeClasses: Record<string, string> = {
    sm: 'search-sm',
    md: 'search-md',
    lg: 'search-lg',
  };

  // ============================================================
  // CLASSES
  // ============================================================
  const classes = [
    'search-box',
    sizeClasses[size],
    disabled ? 'search-disabled' : '',
    value ? 'search-has-value' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className={classes}>
      <span className="search-icon">{icon}</span>

      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        autoFocus={autoFocus}
        className="search-input"
        aria-label={placeholder}
      />

      {value && (
        <button
          className="search-clear"
          onClick={handleClear}
          type="button"
          aria-label="Clear search"
        >
          ✕
        </button>
      )}

      {onSearch && value && (
        <button
          className="search-submit"
          onClick={handleSearch}
          type="button"
          aria-label="Search"
        >
          {icon}
        </button>
      )}
    </div>
  );
};

export default SearchBox;