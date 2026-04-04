import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { bannersApi } from '../api/banners';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import ImageUpload from '../components/ImageUpload';
import '../assets/styles/global.css';

interface Product {
  id: number;
  name: string;
  brand: string;
}

interface Category {
  id: number;
  name: string;
}

interface BannerFormData {
  imageUrl: string;
  linkType: string;
  targetId: string;
  targetIds: string[];
  priority: number;
  isActive: boolean;
  title: string;
  subtitle: string;
  discount: number;
}

const BannerForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState<BannerFormData>({
    imageUrl: '',
    linkType: 'NONE',
    targetId: '',
    targetIds: [],
    priority: 0,
    isActive: true,
    title: '',
    subtitle: '',
    discount: 0,
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProductsAndCategories();
    if (isEdit && location.state?.banner) {
      const banner = location.state.banner;
      setFormData({
        imageUrl: banner.imageUrl || '',
        linkType: banner.linkType || 'NONE',
        targetId: banner.targetId || '',
        targetIds: banner.targetIds || [],
        priority: banner.priority || 0,
        isActive: banner.isActive ?? true,
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        discount: banner.discount || 0,
      });
    }
  }, [isEdit, location.state]);

  const loadProductsAndCategories = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productsApi.getAll({ page: 1, limit: 100 }),
        categoriesApi.getAll(),
      ]);
      setProducts(productsData.data || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error('Failed to load products/categories:', err);
    }
  };

  const handleImageSelect = async (file: File, previewUrl: string) => {
    try {
      setError(null);
      const response = await bannersApi.uploadImage(file);
      if (response.imageUrl) {
        setFormData(prev => ({ ...prev, imageUrl: response.imageUrl }));
        setSuccess('Image uploaded successfully');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to upload image';
      setError(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!formData.imageUrl) {
        throw new Error('Banner image is required');
      }

      if (formData.linkType === 'PRODUCT' && !formData.targetId) {
        throw new Error('Please select a product');
      }

      if (formData.linkType === 'CATEGORY' && !formData.targetId) {
        throw new Error('Please select a category');
      }

      if (formData.linkType === 'MULTIPLE_PRODUCTS' && formData.targetIds.length === 0) {
        throw new Error('Please select at least one product');
      }

      const payload = {
        imageUrl: formData.imageUrl,
        linkType: formData.linkType,
        targetScreen: formData.linkType === 'PRODUCT' ? 'product' :
                     formData.linkType === 'CATEGORY' ? 'category' :
                     formData.linkType === 'MULTIPLE_PRODUCTS' ? 'products' : 'home',
        targetId: formData.targetId || undefined,
        targetIds: formData.targetIds,
        priority: formData.priority,
        isActive: formData.isActive,
        title: formData.title || undefined,
        subtitle: formData.subtitle || undefined,
        discount: formData.discount,
      };

      if (isEdit) {
        await bannersApi.update(Number(id), payload);
      } else {
        await bannersApi.create(payload);
      }

      navigate('/banners');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to save banner';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
        ? Number(value)
        : value,
    }));
  };

  const handleProductToggle = (productId: string) => {
    setFormData(prev => {
      const exists = prev.targetIds.includes(productId);
      if (exists) {
        return { ...prev, targetIds: prev.targetIds.filter(id => id !== productId) };
      } else {
        return { ...prev, targetIds: [...prev.targetIds, productId] };
      }
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{isEdit ? 'Edit Banner' : 'Add Banner'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/banners')}>
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-container form-container-small">
        {error && (
          <div className="error-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <div className="form-group">
          <label>Banner Image *</label>
          <ImageUpload
            onImageSelect={handleImageSelect}
            existingImageUrl={formData.imageUrl}
            label="Upload Banner Image"
            required
            maxSize={5 * 1024 * 1024}
          />
        </div>

        <div className="form-group">
          <label htmlFor="linkType">Link Type *</label>
          <select
            id="linkType"
            name="linkType"
            value={formData.linkType}
            onChange={handleChange}
            required
            className="form-input"
          >
            <option value="NONE">No Link</option>
            <option value="PRODUCT">Specific Product</option>
            <option value="CATEGORY">Specific Category</option>
            <option value="MULTIPLE_PRODUCTS">Multiple Products</option>
            <option value="SEARCH">Search Results</option>
          </select>
        </div>

        {formData.linkType === 'PRODUCT' && (
          <div className="form-group">
            <label htmlFor="targetId">Select Product *</label>
            <select
              id="targetId"
              name="targetId"
              value={formData.targetId}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Select a product...</option>
              {products.map(product => (
                <option key={product.id} value={product.id.toString()}>
                  {product.name} ({product.brand})
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.linkType === 'CATEGORY' && (
          <div className="form-group">
            <label htmlFor="targetId">Select Category *</label>
            <select
              id="targetId"
              name="targetId"
              value={formData.targetId}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="">Select a category...</option>
              {categories.map(category => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.linkType === 'MULTIPLE_PRODUCTS' && (
          <div className="form-group">
            <label>Select Products *</label>
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '12px'
            }}>
              {products.map(product => (
                <label key={product.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border-light)'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.targetIds.includes(product.id.toString())}
                    onChange={() => handleProductToggle(product.id.toString())}
                    style={{ marginRight: '8px' }}
                  />
                  <span>{product.name} ({product.brand})</span>
                </label>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Selected: {formData.targetIds.length} product(s)
            </p>
          </div>
        )}

        {formData.linkType === 'SEARCH' && (
          <div className="form-group">
            <label htmlFor="targetId">Search Query *</label>
            <input
              id="targetId"
              name="targetId"
              type="text"
              value={formData.targetId}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="e.g., rice, coffee, milk"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title">Banner Title (Optional)</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., Summer Sale"
          />
        </div>

        <div className="form-group">
          <label htmlFor="subtitle">Subtitle (Optional)</label>
          <input
            id="subtitle"
            name="subtitle"
            type="text"
            value={formData.subtitle}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., Up to 50% OFF"
          />
        </div>

        <div className="form-group">
          <label htmlFor="discount">Discount % (Optional)</label>
          <input
            id="discount"
            name="discount"
            type="number"
            value={formData.discount}
            onChange={handleChange}
            min="0"
            max="100"
            className="form-input"
            placeholder="e.g., 50"
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <input
            id="priority"
            name="priority"
            type="number"
            value={formData.priority}
            onChange={handleChange}
            min="0"
            className="form-input"
            placeholder="Lower number = higher priority"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <span>Active</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/banners')}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !formData.imageUrl}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              isEdit ? 'Update Banner' : 'Create Banner'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BannerForm;