import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesApi } from '../api/categories';
import { Category } from '../types/product.types';
import StatusChip from '../components/StatusChip';
import '../assets/styles/global.css';
import '../assets/styles/glass-theme.css';

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return 'https://via.placeholder.com/150x150?text=Category';
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoriesApi.getAll();
      const filtered = data.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setCategories(filtered);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load categories';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure? This will delete all subcategories too.')) return;
    try {
      await categoriesApi.delete(id);
      await loadData();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to delete category';
      alert(message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Manage your product categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/categories/new')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Category
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
          <button onClick={loadData}>Retry</button>
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
              placeholder="Search categories by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-field"
            />
          </div>
        </div>
        <div className="toolbar-section">
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
          <button className="btn btn-secondary" onClick={loadData}>
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
        <div className={`products-container ${viewMode}`}>
          {Array.from({ length: viewMode === 'grid' ? 12 : 6 }).map((_, index) => (
            <div key={index} className={`product-card glass-panel skeleton ${viewMode}`}>
              <div className="product-image-container skeleton-box" />
              <div className="product-content">
                <div className="skeleton-box" style={{ height: '16px', width: '70%' }} />
                <div className="skeleton-box" style={{ height: '14px', width: '50%' }} />
                <div className="skeleton-box" style={{ height: '32px', width: '100%', marginTop: 'auto' }} />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-state-modern glass-panel">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <h3>No Categories Found</h3>
          <p>Get started by adding your first category</p>
          <button className="btn btn-primary" onClick={() => navigate('/categories/new')}>
            Add Your First Category
          </button>
        </div>
      ) : (
        <>
          <div className={`products-container ${viewMode}`}>
            {categories.map((category) => (
              <div key={category.id} className={`product-card glass-panel ${viewMode}`}>
                <div className="product-image-container">
                  <img
                    src={getImageUrl(category.image)}
                    alt={category.name}
                    className="product-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                  {category.priority === 0 && (
                    <div className="badge-featured">Featured</div>
                  )}
                </div>
                <div className="product-content">
                  <div className="product-header">
                    <h3 className="product-name">{category.name}</h3>
                    <p className="product-brand">
                      {category.subCategories?.length || 0} subcategories
                    </p>
                  </div>
                  <div className="product-meta">
                    <div className="product-stock">
                      <StatusChip
                        status={category.isActive ? 'success' : 'danger'}
                        label={category.isActive ? 'Active' : 'Inactive'}
                        size="small"
                      />
                    </div>
                    <div className="product-category">Priority: {category.priority}</div>
                  </div>
                  <div className="product-actions">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => navigate(`/categories/${category.id}`, { state: { category } })}
                      title="Edit Category"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(category.id)}
                      title="Delete Category"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="products-stats">
            <span className="stats-text">
              Showing {categories.length} categor{categories.length === 1 ? 'y' : 'ies'}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default Categories;