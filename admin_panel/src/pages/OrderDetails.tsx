import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ordersApi } from '../api/orders';
import StatusChip from '../components/StatusChip';
import { Order } from '../types/order.types';
import '../assets/styles/global.css';

const OrderDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  const loadOrderDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('📦 [ORDER DETAILS] Loading order', id);
      const data = await ordersApi.getByIdAdmin(Number(id));
      console.log('✅ [ORDER DETAILS] Loaded:', data);
      setOrder(data);
    } catch (err: any) {
      console.error('❌ [ORDER DETAILS] Failed to load:', err);
      setError(err.message || 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    setIsUpdating(true);
    try {
      console.log('🔄 [ORDER DETAILS] Updating status to', newStatus);
      await ordersApi.updateStatus(order.id, newStatus);
      console.log('✅ [ORDER DETAILS] Status updated');
      await loadOrderDetails();
    } catch (err: any) {
      console.error('❌ [ORDER DETAILS] Status update failed:', err);
      const message = err?.response?.data?.message || err?.message || 'Failed to update status';
      alert(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'PACKED', label: 'Packed' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];

  const getStatusStep = (status: string): number => {
    const steps: Record<string, number> = {
      'PENDING': 1,
      'CONFIRMED': 2,
      'PACKED': 3,
      'OUT_FOR_DELIVERY': 4,
      'DELIVERED': 5,
      'CANCELLED': 0,
    };
    return steps[status] || 0;
  };

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="error-page">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h2>Order Not Found</h2>
        <p>{error || 'The requested order does not exist'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/orders')}>
          Back to Orders
        </button>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Order Details</h1>
          <p className="page-subtitle">{order.orderId}</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/orders')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>
        </div>
      </div>

      <div className="order-details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Order Information */}
        <div className="detail-card glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--border-light)' }}>
            Order Information
          </h3>
          <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
            <strong style={{ color: 'var(--accent-orange)' }}>{order.orderId}</strong>
          </div>
          <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Order Date:</span>
            <strong>{formatDate(order.createdAt)}</strong>
          </div>
          <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Status:</span>
            <StatusChip 
              status={getStatusColor(order.status)} 
              label={order.status?.replace('_', ' ') || 'PENDING'} 
              size="small"
            />
          </div>
          <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Payment Method:</span>
            <strong>{order.paymentMethod || 'COD'}</strong>
          </div>
          <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Update Status:</span>
            <select
              value={order.status || 'PENDING'}
              onChange={(e) => handleStatusUpdate(e.target.value)}
              disabled={isUpdating}
              className="status-select"
              style={{ cursor: isUpdating ? 'not-allowed' : 'pointer' }}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Customer Information */}
        <div className="detail-card glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--border-light)' }}>
            Customer Information
          </h3>
          <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Name:</span>
            <strong>{order.user?.name || 'Guest'}</strong>
          </div>
          <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
            <strong>{order.user?.email || 'N/A'}</strong>
          </div>
          <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Phone:</span>
            <strong>{order.user?.phone || 'N/A'}</strong>
          </div>
          {order.address && (
            <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Address:</span>
              <strong style={{ textAlign: 'right', maxWidth: '60%' }}>
                {order.address.street}, {order.address.landmark ? order.address.landmark + ', ' : ''}{order.address.city}, {order.address.district || ''}, {order.address.state} {order.address.zip}
              </strong>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="detail-card glass-panel" style={{ padding: '24px', gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--border-light)' }}>
            Order Items ({order.items?.length || 0})
          </h3>
          {order.items?.length === 0 ? (
            <p className="empty-state">No items in this order</p>
          ) : (
            <div className="order-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.items?.map((item, index) => (
                <div 
                  key={index} 
                  className="order-item-row glass-panel" 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px'
                  }}
                >
                  <div className="item-info" style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name || 'Product'} 
                        className="item-image"
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '8px', 
                          objectFit: 'cover',
                          border: '1px solid var(--border-light)'
                        }}
                      />
                    ) : (
                      <div 
                        style={{ 
                          width: '60px', 
                          height: '60px', 
                          borderRadius: '8px',
                          background: 'var(--bg-surface)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--border-light)'
                        }}
                      >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div className="item-name" style={{ fontWeight: 600, marginBottom: '4px' }}>
                        {item.name || 'Product'}
                      </div>
                      <div className="item-quantity" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Quantity: {item.quantity} × ₹{(item.price || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                  <div className="item-price" style={{ fontWeight: 700, fontSize: '16px', color: 'var(--accent-orange)' }}>
                    ₹{((item.price || 0) * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="detail-card glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--border-light)' }}>
            Order Summary
          </h3>
          <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
            <strong>₹{(order.totalAmount || 0).toLocaleString('en-IN')}</strong>
          </div>
          <div className="detail-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee:</span>
            <strong>₹40</strong>
          </div>
          <div className="detail-row total" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            padding: '16px 0',
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--accent-orange)',
            borderTop: '2px solid var(--border-light)',
            marginTop: '12px'
          }}>
            <span>Total:</span>
            <strong>₹{((order.totalAmount || 0) + 40).toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="detail-card glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid var(--border-light)' }}>
            Order Tracking
          </h3>
          <div className="order-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { step: 1, status: 'PENDING', label: 'Order Placed', icon: '📦' },
              { step: 2, status: 'CONFIRMED', label: 'Order Confirmed', icon: '✅' },
              { step: 3, status: 'PACKED', label: 'Packed', icon: '📭' },
              { step: 4, status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🚚' },
              { step: 5, status: 'DELIVERED', label: 'Delivered', icon: '🏠' },
            ].map((item) => {
              const isCompleted = currentStep >= item.step;
              const isCurrent = currentStep === item.step;
              
              return (
                <div 
                  key={item.step}
                  className="timeline-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    opacity: isCompleted ? 1 : 0.5,
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isCompleted ? 'var(--accent-orange)' : 'var(--bg-tertiary)',
                      color: isCompleted ? '#fff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.label}</div>
                    {isCurrent && (
                      <div style={{ fontSize: '12px', color: 'var(--accent-orange)' }}>Current Status</div>
                    )}
                  </div>
                  {isCompleted && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-green)" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;