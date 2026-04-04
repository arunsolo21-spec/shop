import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import StatusChip from '../components/StatusChip';
import '../assets/styles/global.css';
import '../assets/styles/glass-theme.css';
import { Product, Category } from '../types/product.types';

const ITEMS_PER_PAGE = 12;

const Products: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return 'https://via.placeholder.com/300x300?text=No+Image';
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [productsData, categoriesData] = await Promise.all([
        productsApi.getAll({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchQuery || undefined,
          categoryId: selectedCategory === 'ALL' ? undefined : selectedCategory,
          sortBy,
          sortOrder,
        }),
        categoriesApi.getAll(),
      ]);
      setProducts(productsData.data || []);
      setTotalProducts(productsData.total || 0);
      setTotalPages(productsData.totalPages || 0);
      setHasMore(productsData.hasMore || false);
      setCategories(categoriesData || []);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load products';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory, sortBy, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsApi.delete(id);
      await loadData();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to delete product';
      alert(message);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'name') {
      setSortBy('name');
      setSortOrder('asc');
    } else if (value === 'price') {
      setSortBy('price');
      setSortOrder('asc');
    } else {
      setSortBy('createdAt');
      setSortOrder('desc');
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
        <button key={1} className="pagination-btn" onClick={() => handlePageChange(1)}>
          1
        </button>
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
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
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

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product inventory</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Product
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
              placeholder="Search products by name or brand..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input-field"
            />
          </div>
          <div className="filter-group">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="filter-select"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <select
              value={sortBy === 'name' && sortOrder === 'asc' ? 'name' : sortBy === 'price' && sortOrder === 'asc' ? 'price' : 'createdAt'}
              onChange={handleSortChange}
              className="filter-select"
            >
              <option value="createdAt">Newest First</option>
              <option value="name">Name A-Z</option>
              <option value="price">Price: Low to High</option>
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
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
            <div key={index} className={`product-card glass-panel skeleton ${viewMode}`}>
              <div className="product-image-container skeleton-box" />
              <div className="product-content">
                <div className="skeleton-box" style={{ height: '16px', width: '70%' }} />
                <div className="skeleton-box" style={{ height: '14px', width: '50%' }} />
                <div className="skeleton-box" style={{ height: '20px', width: '40%', marginTop: '8px' }} />
                <div className="skeleton-box" style={{ height: '32px', width: '100%', marginTop: 'auto' }} />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state-modern glass-panel">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <h3>No Products Found</h3>
          <p>Get started by adding your first product</p>
          <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
            Add Your First Product
          </button>
        </div>
      ) : (
        <>
          <div className={`products-container ${viewMode}`}>
            {products.map((product) => (
              <div key={product.id} className={`product-card glass-panel ${viewMode}`}>
                <div className="product-image-container">
                  <img
                    src={getImageUrl(product.imageUrl)}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                  {product.isFeatured && (
                    <div className="badge-featured">Featured</div>
                  )}
                  {product.discount > 0 && (
                    <div className="badge-discount">-{product.discount}%</div>
                  )}
                </div>
                <div className="product-content">
                  <div className="product-header">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-brand">{product.brand}</p>
                  </div>
                  <div className="product-pricing">
                    <div className="price-current">₹{product.price.toLocaleString('en-IN')}</div>
                    {product.mrp > product.price && (
                      <div className="price-mrp">₹{product.mrp.toLocaleString('en-IN')}</div>
                    )}
                  </div>
                  <div className="product-meta">
                    <div className="product-stock">
                      <StatusChip
                        status={product.inStock ? 'success' : 'danger'}
                        label={product.inStock ? `In Stock (${product.quantity})` : 'Out of Stock'}
                        size="small"
                      />
                    </div>
                    {product.subCategory && (
                      <div className="product-category">
                        {product.subCategory.name}
                      </div>
                    )}
                  </div>
                  <div className="product-actions">
                    <button
                      className="btn-action btn-edit"
                      onClick={() => navigate(`/products/${product.id}`, { state: { product } })}
                      title="Edit Product"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(product.id)}
                      title="Delete Product"
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
              Showing {products.length} of {totalProducts} products {currentPage > 1 && `(Page ${currentPage} of ${totalPages})`}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default Products;