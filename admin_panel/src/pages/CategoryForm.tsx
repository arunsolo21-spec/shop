import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { categoriesApi } from '../api/categories';
import ImageUpload from '../components/ImageUpload';
import '../assets/styles/global.css';

interface CategoryFormData {
  name: string;
  priority: number;
  isActive: boolean;
  image?: string;
}

const CategoryForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    priority: 0,
    isActive: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && location.state?.category) {
      const category = location.state.category;
      setFormData({
        name: category.name || '',
        priority: category.priority || 0,
        isActive: category.isActive ?? true,
        image: category.image || '',
      });
    }
  }, [isEdit, location.state]);

  const handleImageSelect = async (file: File, previewUrl: string) => {
    try {
      const response = await categoriesApi.uploadImage(file);
      setFormData((prev) => ({ ...prev, image: response.imageUrl }));
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
      if (!formData.name || formData.name.trim().length < 2) {
        throw new Error('Category name must be at least 2 characters');
      }

      if (formData.priority < 0) {
        throw new Error('Priority cannot be negative');
      }

      if (isEdit) {
        await categoriesApi.update(Number(id), formData);
        setSuccess('Category updated successfully');
      } else {
        await categoriesApi.create(formData);
        setSuccess('Category created successfully');
      }

      setTimeout(() => navigate('/categories'), 1000);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to save category';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{isEdit ? 'Edit Category' : 'Add Category'}</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/categories')}>
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
          <label htmlFor="name">Category Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Enter category name"
            minLength={2}
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Category Image</label>
          <ImageUpload
            onImageSelect={handleImageSelect}
            existingImageUrl={formData.image}
            label="Upload Category Image"
            maxSize={5 * 1024 * 1024}
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
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/categories')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              isEdit ? 'Update Category' : 'Create Category'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;