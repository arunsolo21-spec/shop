import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { productsApi } from '../api/products';
import ImageUpload from '../components/ImageUpload';
import '../assets/styles/global.css';

interface ProductFormData {
  name: string;
  brand: string;
  variant: string;
  price: number;
  mrp: number;
  quantity: number;
  discount: number;
  description: string;
  imageUrl: string;
  inStock: boolean;
}

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    brand: '',
    variant: '',
    price: 0,
    mrp: 0,
    quantity: 0,
    discount: 0,
    description: '',
    imageUrl: '',
    inStock: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && location.state?.product) {
      const product = location.state.product;
      setFormData({
        name: product.name || '',
        brand: product.brand || '',
        variant: product.variant || '',
        price: product.price || 0,
        mrp: product.mrp || 0,
        quantity: product.quantity || 0,
        discount: product.discount || 0,
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        inStock: product.inStock ?? true,
      });
    }
  }, [isEdit, location.state]);

  const calculateDiscount = useCallback((price: number, mrp: number): number => {
    if (!mrp || mrp <= 0) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  }, []);

  const handleImageSelect = async (file: File, previewUrl: string) => {
    try {
      const response = await productsApi.uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl: response.imageUrl }));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to upload image';
      setError(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (formData.price > formData.mrp) {
        throw new Error('Selling price cannot be greater than MRP');
      }

      if (formData.price <= 0 || formData.mrp <= 0) {
        throw new Error('Price and MRP must be greater than 0');
      }

      if (!formData.variant || formData.variant.trim() === '') {
        throw new Error('Variant is required (e.g., 5kg, 500g, 1L)');
      }

      const calculatedDiscount = calculateDiscount(formData.price, formData.mrp);
      const payload = {
        ...formData,
        discount: calculatedDiscount,
      };

      if (isEdit) {
        await productsApi.update(Number(id), payload);
        setSuccess('Product updated successfully');
      } else {
        await productsApi.create(payload);
        setSuccess('Product created successfully');
      }

      setTimeout(() => navigate('/products'), 1000);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to save product';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      const newValue = type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
      const updated = { ...prev, [name]: newValue };

      if (name === 'price' || name === 'mrp') {
        const price = name === 'price' ? Number(value) : prev.price;
        const mrp = name === 'mrp' ? Number(value) : prev.mrp;
        updated.discount = calculateDiscount(price, mrp);
      }

      return updated;
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{isEdit ? 'Edit Product' : 'Add Product'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/products')}>Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
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

        <div className="form-grid">
          <div className="form-section">
            <h3>Product Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter product name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="brand">Brand *</label>
              <input
                id="brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter brand name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="variant">Variant / Size *</label>
              <input
                id="variant"
                name="variant"
                type="text"
                value={formData.variant}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="e.g., 5kg, 500g, 1L, 100ml"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input form-textarea"
                rows={4}
                placeholder="Enter product description"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Pricing & Stock</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Selling Price (₹) *</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="mrp">MRP (₹) *</label>
                <input
                  id="mrp"
                  name="mrp"
                  type="number"
                  value={formData.mrp}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">Stock Quantity *</label>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="discount">Discount (%)</label>
                <input
                  id="discount"
                  name="discount"
                  type="number"
                  value={formData.discount}
                  readOnly
                  className="form-input"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={handleChange}
                />
                <span>In Stock</span>
              </label>
            </div>
          </div>

          <div className="form-section full-width">
            <h3>Product Image</h3>
            <ImageUpload
              onImageSelect={handleImageSelect}
              existingImageUrl={formData.imageUrl}
              label="Upload Product Image"
              maxSize={5 * 1024 * 1024}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              isEdit ? 'Update Product' : 'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;