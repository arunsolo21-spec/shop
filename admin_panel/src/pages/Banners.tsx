import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { bannersApi } from '../api/banners';
import StatusChip from '../components/StatusChip';
import '../assets/styles/global.css';

interface Banner {
  id: number;
  imageUrl: string;
  targetScreen: string | null;
  targetId: string | null;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt?: string;
}

const Banners: React.FC = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [filteredBanners, setFilteredBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return 'https://via.placeholder.com/150x50?text=No+Image';
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const loadBanners = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bannersApi.getAll();
      setBanners(Array.isArray(data) ? data : []);
      setFilteredBanners(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load banners';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  useEffect(() => {
    let filtered = [...banners];
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((banner) =>
        statusFilter === 'ACTIVE' ? banner.isActive : !banner.isActive
      );
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((banner) =>
        banner.targetScreen?.toLowerCase().includes(query) ||
        banner.targetId?.toLowerCase().includes(query) ||
        banner.imageUrl.toLowerCase().includes(query)
      );
    }
    setFilteredBanners(filtered);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, banners]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await bannersApi.delete(id);
      await loadBanners();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to delete banner';
      alert(message);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await bannersApi.toggleStatus(id);
      await loadBanners();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to update status';
      alert(message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalPages = Math.ceil(filteredBanners.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBanners = filteredBanners.slice(startIndex, endIndex);

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
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <div className="pagination-numbers">{pages}</div>
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
          <h1 className="page-title">Banners</h1>
          <p className="page-subtitle">Manage your app banners</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/banners/new')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Banner
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
          <button onClick={loadBanners}>Retry</button>
        </div>
      )}
      <div className="products-toolbar glass-panel">
        <div className="toolbar-section">
          <div className="search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search banners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-field"
            />
          </div>
          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              className="filter-select"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
        <div className="toolbar-section">
          <button className="btn btn-secondary" onClick={loadBanners}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="table-wrapper">
          <div className="page-loading">
            <div className="loading-spinner"></div>
            <p>Loading banners...</p>
          </div>
        </div>
      ) : currentBanners.length === 0 ? (
        <div className="empty-state-modern glass-panel">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <h3>No Banners Found</h3>
          <p>{searchQuery || statusFilter !== 'ALL' ? 'Try adjusting your filters' : 'Get started by adding your first banner'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/banners/new')}>
            Add Your First Banner
          </button>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Preview</th>
                    <th style={{ width: '20%' }}>Target Screen</th>
                    <th style={{ width: '15%' }}>Priority</th>
                    <th style={{ width: '15%' }}>Status</th>
                    <th style={{ width: '12%' }}>Created</th>
                    <th style={{ width: '8%', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBanners.map((banner) => (
                    <tr key={banner.id}>
                      <td>
                        <div className="banner-preview-cell">
                          <img
                            src={getImageUrl(banner.imageUrl)}
                            alt="Banner"
                            className="banner-thumbnail"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x50?text=No+Image';
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{banner.targetScreen || 'Home'}</strong>
                          {banner.targetId && (
                            <div className="text-muted" style={{ fontSize: '12px' }}>
                              ID: {banner.targetId}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="priority-badge">{banner.priority ?? 0}</span>
                      </td>
                      <td>
                        <StatusChip
                          status={banner.isActive ? 'success' : 'danger'}
                          label={banner.isActive ? 'Active' : 'Inactive'}
                          size="small"
                        />
                      </td>
                      <td>
                        <div className="text-muted" style={{ fontSize: '12px' }}>
                          {formatDate(banner.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="btn-icon"
                            onClick={() => navigate(`/banners/${banner.id}`, { state: { banner } })}
                            title="Edit"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleToggleStatus(banner.id, banner.isActive)}
                            title={banner.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2v20M2 12h20" />
                            </svg>
                          </button>
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => handleDelete(banner.id)}
                            title="Delete"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
              Showing {currentBanners.length} of {filteredBanners.length} banners
              {filteredBanners.length !== banners.length && ` (Filtered from ${banners.length} total)`}
              {currentPage > 1 && ` - Page ${currentPage} of ${totalPages}`}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default Banners;