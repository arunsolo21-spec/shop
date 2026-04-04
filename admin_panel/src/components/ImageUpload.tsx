import React, { useRef, useState, useCallback } from 'react';
import '../assets/styles/global.css';

export interface ImageUploadProps {
  onImageSelect: (file: File, previewUrl: string) => void;
  existingImageUrl?: string;
  accept?: string;
  maxSize?: number;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  existingImageUrl,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024,
  label = 'Upload Image',
  required = false,
  disabled = false,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(existingImageUrl || '');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file';
    }
    if (file.size > maxSize) {
      return `File size must be less than ${maxSize / 1024 / 1024}MB`;
    }
    return null;
  };

  const handleFile = useCallback((file: File) => {
    setError('');
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onImageSelect(file, result);
      setIsLoading(false);
    };
    reader.onerror = () => {
      setError('Failed to read file');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, [onImageSelect, maxSize]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    setPreview('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`image-upload ${className}`}>
      <label className="image-upload-label">
        {label}
        {required && <span className="required-indicator">*</span>}
      </label>
      <div
        className={`image-upload-area ${isDragging ? 'dragging' : ''} ${preview ? 'has-image' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        aria-label={label}
      >
        {isLoading ? (
          <div className="image-upload-loading">
            <div className="loading-spinner"></div>
            <p>Processing image...</p>
          </div>
        ) : preview ? (
          <div className="image-preview">
            <img src={preview} alt="Preview" className="preview-image" />
            {!disabled && (
              <button
                className="remove-image-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                type="button"
                aria-label="Remove image"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className="image-upload-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="upload-text">
              <span className="upload-highlight">Click to upload</span> or drag and drop
            </p>
            <p className="upload-hint">
              SVG, PNG, JPG or GIF (max. {maxSize / 1024 / 1024}MB)
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="image-upload-input"
          disabled={disabled}
          aria-label={label}
        />
      </div>
      {error && (
        <div className="image-upload-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;