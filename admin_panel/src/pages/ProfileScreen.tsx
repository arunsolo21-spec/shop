import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { usersApi } from '../api/users';
import { User } from '../types/auth.types';
import '../assets/styles/global.css';

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuthContext();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    profileImage: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await usersApi.getProfile();
      setUser(userData);
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        profileImage: userData.profileImage || '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await usersApi.updateProfile({
        name: formData.name,
        phone: formData.phone,
      });
      setUser(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account settings</p>
        </div>
        <button className="btn btn-danger" onClick={handleLogout}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
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
          <button onClick={loadProfile}>Retry</button>
        </div>
      )}

      <div className="form-container form-container-small">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name || 'User'} />
            ) : (
              <span>{(user?.name || 'U')[0].toUpperCase()}</span>
            )}
          </div>
          <div className="profile-info">
            <h2>{user?.name || 'No Name'}</h2>
            <span className="badge badge-info">{user?.role || 'USER'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            {isEditing ? (
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
                required
              />
            ) : (
              <input
                id="name"
                type="text"
                value={user?.name || 'Not provided'}
                disabled
                className="form-input"
              />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            {isEditing ? (
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input"
                pattern="[6-9]\d{9}"
              />
            ) : (
              <input
                id="phone"
                type="tel"
                value={user?.phone || 'Not provided'}
                disabled
                className="form-input"
              />
            )}
          </div>

          <div className="form-group">
            <label>Account Status</label>
            <div className="status-badge">
              <span className={`badge ${user?.isActive ? 'badge-success' : 'badge-danger'}`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label>Member Since</label>
            <input
              type="text"
              value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'}
              disabled
              className="form-input"
            />
          </div>

          <div className="form-actions">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setIsEditing(false);
                    loadProfile();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileScreen;