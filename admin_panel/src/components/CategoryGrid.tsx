import React from 'react';
import { Category } from '../types/product.types';
import GlassCard from './GlassCard';
import '../assets/styles/glass-theme.css';

interface CategoryGridProps {
  categories: Category[];
  selectedCategoryId?: number;
  onCategorySelect: (categoryId: number) => void;
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
}) => {
  return (
    <div className="glass-grid">
      {categories.map((category) => (
        <GlassCard
          key={category.id}
          className={selectedCategoryId === category.id ? 'selected' : ''}
          onClick={() => onCategorySelect(category.id)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(255, 107, 53, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: '#FF6B35' }}
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#FFFFFF',
                }}
              >
                {category.name}
              </h3>
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                {category.subCategories?.length || 0} subcategories
              </p>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

export default CategoryGrid;