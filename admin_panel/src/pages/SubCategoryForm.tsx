import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { subcategoriesApi } from '../api/subcategories';
import { categoriesApi } from '../api/categories';
import ImageUpload from '../components/ImageUpload';
import { Category, SubCategoryCreate } from '../types/product.types';
import '../assets/styles/global.css';

const SubCategoryForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = !!id;
  const [formData, setFormData] = useState<SubCategoryCreate>({
    name: '',
    categoryId: 0,
    priority: 0,
    isActive: true,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
    if (isEdit && location.state?.subcategory) {
      const subcategory = location.state.subcategory;
      setFormData({
        name: subcategory.name || '',
        categoryId: subcategory.categoryId || 0,
        priority: subcategory.priority || 0,
        isActive: subcategory.isActive ?? true,
      });
    } else if (location.state?.categoryId) {
      setFormData((prev) => ({ ...prev, categoryId: location.state.categoryId }));
    }
  }, [isEdit, location.state]);

  const loadCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleImageSelect = async (file: File, previewUrl: string) => {
    try {
      const response = await subcategoriesApi.uploadImage(file);
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
        throw new Error('Subcategory name must be at least 2 characters');
      }
      if (!formData.categoryId || formData.categoryId === 0) {
        throw new Error('Please select a category');
      }
      if (formData.priority < 0) {
        throw new Error('Priority cannot be negative');
      }

      const payload = {
  ...formData,
  categoryId: typeof formData.categoryId === 'string' 
    ? Number(formData.categoryId) 
    : formData.categoryId,
};
      if (isEdit) {
        await subcategoriesApi.update(Number(id), payload);
        setSuccess('Subcategory updated successfully');
      } else {
        await subcategoriesApi.create(payload);
        setSuccess('Subcategory created successfully');
      }
      setTimeout(() => navigate('/subcategories'), 1500);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to save subcategory';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{isEdit ? 'Edit SubCategory' : 'Add SubCategory'}</h1>
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/subcategories')}
        >
          Cancel
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="form-container form-container-small"
      >
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
          <label htmlFor="categoryId">Category *</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className="form-input"
          >
            <option value={0}>Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="name">SubCategory Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="Enter subcategory name"
          />
        </div>
        <div className="form-group">
          <label>SubCategory Image</label>
          <ImageUpload
            onImageSelect={handleImageSelect}
            existingImageUrl={formData.image}
            label="Upload SubCategory Image"
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
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/subcategories')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              isEdit ? 'Update SubCategory' : 'Create SubCategory'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubCategoryForm;