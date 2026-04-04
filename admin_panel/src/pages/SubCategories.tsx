import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { subcategoriesApi } from '../api/subcategories';
import { categoriesApi } from '../api/categories';
import StatusChip from '../components/StatusChip';
import ImageUpload from '../components/ImageUpload';
import '../assets/styles/global.css';
import '../assets/styles/glass-theme.css';
import { SubCategory, Category } from '../types/product.types';

const ITEMS_PER_PAGE = 20;

const SubCategories: React.FC = () => {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<SubCategory | null>(null);

  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return 'https://via.placeholder.com/150x150?text=Subcategory';
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [categoriesData, subcategoriesData] = await Promise.all([
        categoriesApi.getAll(),
        subcategoriesApi.getAll(),
      ]);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setSubcategories(Array.isArray(subcategoriesData) ? subcategoriesData : []);
      setTotalPages(Math.ceil((subcategoriesData.length || 0) / ITEMS_PER_PAGE));
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      await subcategoriesApi.delete(id);
      await loadData();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to delete subcategory';
      setError(message);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await subcategoriesApi.toggleStatus(id, !currentStatus);
      await loadData();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to update status';
      setError(message);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    if (startPage > 1) {
      pages.push(
        <button key={1} className="pagination-btn" onClick={() => handlePageChange(1)}>1</button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots1" className="pagination-dots">...</span>);
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots2" className="pagination-dots">...</span>);
      }
      pages.push(
        <button key={totalPages} className="pagination-btn" onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </button>
      );
    }
    return (
      <div className="table-pagination">
        <button className="pagination-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <div className="pagination-numbers">{pages}</div>
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    );
  };

  const handleImageUpload = async (file: File, previewUrl: string) => {
    if (!selectedSubcategory) return;
    try {
      const response = await subcategoriesApi.uploadImage(file);
      await subcategoriesApi.update(selectedSubcategory.id, { image: response.imageUrl });
      await loadData();
      setShowImageModal(false);
      setSelectedSubcategory(null);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to upload image';
      setError(message);
    }
  };

  const filteredSubcategories = subcategories.filter((sub) => {
    if (selectedCategoryId !== 'ALL' && sub.categoryId !== Number(selectedCategoryId)) return false;
    if (searchQuery && !sub.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const paginatedSubcategories = filteredSubcategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">SubCategories</h1>
          <p className="page-subtitle">Manage your product subcategories</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/subcategories/new', { state: { categoryId: selectedCategoryId !== 'ALL' ? Number(selectedCategoryId) : undefined } })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add SubCategory
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
              placeholder="Search subcategories by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-field"
            />
          </div>
          <div className="filter-group">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="filter-select"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
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
      ) : paginatedSubcategories.length === 0 ? (
        <div className="empty-state-modern glass-panel">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <h3>No SubCategories Found</h3>
          <p>Get started by adding your first subcategory</p>
          <button className="btn btn-primary" onClick={() => navigate('/subcategories/new')}>
            Add Your First SubCategory
          </button>
        </div>
      ) : (
        <>
          <div className={`products-container ${viewMode}`}>
            {paginatedSubcategories.map((sub) => (
              <div key={sub.id} className={`product-card glass-panel ${viewMode}`}>
                <div className="product-image-container">
                  <img
                    src={getImageUrl(sub.image)}
                    alt={sub.name}
                    className="product-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                </div>
                <div className="product-content">
                  <div className="product-header">
                    <h3 className="product-name">{sub.name}</h3>
                    <p className="product-brand">{sub.category?.name || 'Category'}</p>
                  </div>
                  <div className="product-meta">
                    <div className="product-stock">
                      <StatusChip
                        status={sub.isActive ? 'success' : 'danger'}
                        label={sub.isActive ? 'Active' : 'Inactive'}
                        size="small"
                      />
                    </div>
                    <div className="product-category">Priority: {sub.priority}</div>
                  </div>
                  <div className="product-actions">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => {
                        setSelectedSubcategory(sub);
                        setShowImageModal(true);
                      }}
                      title="Upload Image"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      Image
                    </button>
                    <button
                      className="btn-action btn-edit"
                      onClick={() => navigate(`/subcategories/${sub.id}`, { state: { subcategory: sub } })}
                      title="Edit SubCategory"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(sub.id)}
                      title="Delete SubCategory"
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
          {renderPagination()}
          <div className="products-stats">
            <span className="stats-text">
              Showing {paginatedSubcategories.length} of {filteredSubcategories.length} subcategories{' '}
              {currentPage > 1 && `(Page ${currentPage} of ${totalPages})`}
            </span>
          </div>
        </>
      )}
      {showImageModal && selectedSubcategory && (
        <div className="modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Image - {selectedSubcategory.name}</h2>
              <button className="modal-close" onClick={() => setShowImageModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <ImageUpload
                onImageSelect={handleImageUpload}
                existingImageUrl={selectedSubcategory.image || undefined}
                label="SubCategory Image"
                maxSize={5 * 1024 * 1024}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubCategories;