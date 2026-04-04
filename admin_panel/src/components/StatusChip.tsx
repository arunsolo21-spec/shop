import React from 'react';
import '../assets/styles/global.css';

export type StatusType =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'purple'
  | 'default';

export interface StatusChipProps {
  status: StatusType;
  label: string;
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  size = 'medium',
  icon,
  onClick,
  className = '',
}) => {
  const getStatusClasses = () => {
    const baseClasses = `badge badge-${status} ${className}`;
    switch (size) {
      case 'small':
        return `${baseClasses} badge-sm`;
      case 'large':
        return `${baseClasses} badge-lg`;
      default:
        return baseClasses;
    }
  };

  const getStatusIcon = () => {
    if (icon) return icon;
    const defaultIcons: Record<StatusType, React.ReactNode> = {
      success: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      warning: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
      danger: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
      info: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      ),
      purple: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      default: null,
    };
    return defaultIcons[status];
  };

  return (
    <span
      className={getStatusClasses()}
      onClick={onClick}
      role={onClick ? 'button' : 'status'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {getStatusIcon() && <span className="badge-icon">{getStatusIcon()}</span>}
      <span className="badge-label">{label}</span>
    </span>
  );
};

export default StatusChip;