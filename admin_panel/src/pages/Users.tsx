import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import StatusChip from '../components/StatusChip';
import '../assets/styles/global.css';

interface User {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  _count?: {
    orders: number;
  };
}

const Users: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('👥 [USERS] Fetching users...');
      
      const response = await axiosInstance.get('/users');
      console.log('👥 [USERS] Response:', response);
      console.log('👥 [USERS] Response data:', response.data);
      
      const usersData = response.data?.data || response.data || [];
      console.log('✅ [USERS] Loaded:', usersData.length, 'users');
      
      setUsers(Array.isArray(usersData) ? usersData : []);
      setFilteredUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err: any) {
      console.error('❌ [USERS] Failed to load:', err);
      console.error('❌ [USERS] Error response:', err.response);
      
      const message = err?.response?.data?.message || err?.message || 'Failed to load users';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    let filtered = [...users];

    // Filter by role
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query) ||
        user.id.toString().includes(query)
      );
    }

    console.log('🔍 [USERS] Filtered:', filtered.length, 'users');
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchQuery, roleFilter, users]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button key={1} className="pagination-btn" onClick={() => setCurrentPage(1)}>1</button>
      );
      if (startPage > 2) pages.push(<span key="dots1" className="pagination-dots">...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(<span key="dots2" className="pagination-dots">...</span>);
      pages.push(
        <button key={totalPages} className="pagination-btn" onClick={() => setCurrentPage(totalPages)}>
          {totalPages}
        </button>
      );
    }

    return (
      <div className="table-pagination">
        <button 
          className="pagination-btn" 
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <div className="pagination-numbers">{pages}</div>
        <button 
          className="pagination-btn" 
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage registered users</p>
        </div>
        <button className="btn btn-secondary" onClick={loadUsers}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-banner glass-panel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
          <button onClick={loadUsers}>Retry</button>
        </div>
      )}

      <div className="products-toolbar glass-panel">
        <div className="toolbar-section">
          <div className="search-box" style={{ flex: 1 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-field"
            />
          </div>
          <div className="filter-group">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'USER' | 'ADMIN')}
              className="filter-select"
            >
              <option value="ALL">All Roles</option>
              <option value="USER">Customers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="table-wrapper">
          <div className="page-loading">
            <div className="loading-spinner"></div>
            <p>Loading users...</p>
          </div>
        </div>
      ) : currentUsers.length === 0 ? (
        <div className="empty-state-modern glass-panel">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h3>No Users Found</h3>
          <p>
            {searchQuery || roleFilter !== 'ALL' 
              ? 'Try adjusting your filters' 
              : users.length === 0 
                ? 'No registered users yet' 
                : 'No users match your criteria'}
          </p>
          {users.length === 0 && (
            <button 
              className="btn btn-primary" 
              onClick={() => window.open('http://localhost:5173/auth/register', '_blank')}
            >
              Register Test User
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '10%' }}>ID</th>
                    <th style={{ width: '30%' }}>User</th>
                    <th style={{ width: '20%' }}>Phone</th>
                    <th style={{ width: '15%' }}>Role</th>
                    <th style={{ width: '15%' }}>Joined</th>
                    <th style={{ width: '10%', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="clickable" onClick={() => navigate(`/users/${user.id}`)}>
                      <td>
                        <span className="text-muted">#{user.id}</span>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-name" style={{ fontWeight: 600 }}>
                            {user.name || 'No Name'}
                          </div>
                          <div className="customer-email" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="text-muted">
                          {user.phone || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <StatusChip
                          status={user.role === 'ADMIN' ? 'info' : 'default'}
                          label={user.role === 'ADMIN' ? 'Admin' : 'Customer'}
                          size="small"
                        />
                      </td>
                      <td>
                        <div className="text-muted" style={{ fontSize: '12px' }}>
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="actions-cell">
                          <button 
                            className="btn-icon" 
                            onClick={() => navigate(`/users/${user.id}`)}
                            title="View Details"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {renderPagination()}
          
          <div className="products-stats">
            <span className="stats-text">
              Showing {currentUsers.length} of {filteredUsers.length} users
              {filteredUsers.length !== users.length && ` (Filtered from ${users.length} total)`}
              {currentPage > 1 && ` - Page ${currentPage} of ${totalPages}`}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default Users;