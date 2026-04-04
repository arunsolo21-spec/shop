import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usersApi } from '../api/users';
import { User, Address, Order } from '../types/auth.types';
import StatusChip from '../components/StatusChip';
import '../assets/styles/global.css';

const UserDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'addresses' | 'orders'>('addresses');

  useEffect(() => {
    if (id) {
      loadUserDetails();
    }
  }, [id]);

  const loadUserDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userId = Number(id);
      const userData = await usersApi.getById(userId);
      setUser(userData);

      const addressesData = await usersApi.getAddresses(userId);
      setAddresses(addressesData);

      if (userData.orders) {
        setOrders(userData.orders);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load user details';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      await usersApi.blockUser(user.id, !user.isActive);
      await loadUserDetails();
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to update user status';
      setError(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user || !window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersApi.deleteUser(user.id);
      navigate('/users');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to delete user';
      setError(message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'default' => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'delivered') return 'success';
    if (statusLower === 'pending') return 'warning';
    if (statusLower === 'cancelled') return 'danger';
    if (statusLower === 'out_for_delivery') return 'info';
    if (statusLower === 'confirmed') return 'purple';
    if (statusLower === 'packed') return 'purple';
    return 'default';
  };

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading user details...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="error-page">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h2>User Not Found</h2>
        <p>{error || 'The requested user does not exist'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/users')}>
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Details</h1>
          <p className="page-subtitle">#{user.id} - {user.name || 'No Name'}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/users')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner glass-panel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
          <button onClick={loadUserDetails}>Retry</button>
        </div>
      )}

      <div className="order-details-grid">
        <div className="detail-card glass-panel">
          <h3>User Information</h3>
          <div className="detail-row">
            <span>User ID</span>
            <strong>#{user.id}</strong>
          </div>
          <div className="detail-row">
            <span>Name</span>
            <strong>{user.name || 'Not provided'}</strong>
          </div>
          <div className="detail-row">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div className="detail-row">
            <span>Phone</span>
            <strong>{user.phone || 'Not provided'}</strong>
          </div>
          <div className="detail-row">
            <span>Role</span>
            <StatusChip
              status={user.role === 'ADMIN' ? 'info' : 'default'}
              label={user.role === 'ADMIN' ? 'Admin' : 'Customer'}
              size="small"
            />
          </div>
          <div className="detail-row">
            <span>Status</span>
            <StatusChip
              status={user.isActive ? 'success' : 'danger'}
              label={user.isActive ? 'Active' : 'Inactive'}
              size="small"
            />
          </div>
          <div className="detail-row">
            <span>Joined</span>
            <strong>{formatDate(user.createdAt)}</strong>
          </div>
          <div className="detail-row">
            <span>Total Orders</span>
            <strong>{user.totalOrders || orders.length}</strong>
          </div>
        </div>

        <div className="detail-card glass-panel">
          <h3>Admin Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className={`btn ${user.isActive ? 'btn-danger' : 'btn-primary'}`}
              onClick={handleToggleStatus}
              disabled={isUpdating}
            >
              {user.isActive ? 'Deactivate User' : 'Activate User'}
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDeleteUser}
              disabled={isUpdating}
            >
              Delete User
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/orders?userId=${user.id}`)}
            >
              View Orders
            </button>
          </div>
        </div>

        <div className="detail-card glass-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="section-header">
            <h3>User Data</h3>
            <div className="tab-buttons">
              <button
                className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                Addresses ({addresses.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                Orders ({orders.length})
              </button>
            </div>
          </div>

          {activeTab === 'addresses' && (
            <div>
              {addresses.length === 0 ? (
                <p className="empty-state" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  No addresses found for this user.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '16px', marginTop: '16px' }}>
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className="glass-card"
                      style={{
                        padding: '16px',
                        border: address.isDefault ? '2px solid var(--accent-orange)' : '1px solid var(--border-light)',
                        borderRadius: '12px',
                        background: address.isDefault ? 'var(--accent-orange-light)' : 'var(--bg-tertiary)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>
                            {address.name}
                            {address.isDefault && (
                              <span style={{
                                marginLeft: '8px',
                                padding: '2px 8px',
                                background: 'var(--accent-orange)',
                                color: 'white',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600',
                              }}>
                                DEFAULT
                              </span>
                            )}
                          </h4>
                          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                            {address.phone}
                          </p>
                        </div>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                        <p style={{ margin: '0 0 4px 0' }}>{address.street}</p>
                        {address.landmark && <p style={{ margin: '0 0 4px 0' }}>{address.landmark}</p>}
                        <p style={{ margin: 0 }}>
                          {address.city}, {address.district || ''} - {address.zip}
                        </p>
                        <p style={{ margin: '4px 0 0 0' }}>
                          {address.state}, {address.country}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              {orders.length === 0 ? (
                <p className="empty-state" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  No orders found for this user.
                </p>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className="clickable"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          <td>
                            <strong style={{ color: 'var(--accent-orange)' }}>{order.orderId}</strong>
                          </td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>
                            <strong style={{ color: 'var(--accent-green)' }}>
                              {formatCurrency(order.totalAmount)}
                            </strong>
                          </td>
                          <td>
                            <StatusChip
                              status={getStatusColor(order.status)}
                              label={order.status.replace('_', ' ')}
                              size="small"
                            />
                          </td>
                          <td>{order.paymentMethod || 'COD'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;