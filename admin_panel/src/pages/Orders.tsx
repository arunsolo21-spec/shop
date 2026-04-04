import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../api/orders';
import StatusChip from '../components/StatusChip';
import { Order, OrderStatus } from '../types/order.types';
import '../assets/styles/global.css';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const ITEMS_PER_PAGE = 15;

  const statusOptions: { value: string; label: string; color: string }[] = [
    { value: 'ALL', label: 'All Orders', color: 'default' },
    { value: 'PENDING', label: 'Pending', color: 'warning' },
    { value: 'CONFIRMED', label: 'Confirmed', color: 'info' },
    { value: 'PACKED', label: 'Packed', color: 'purple' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: 'blue' },
    { value: 'DELIVERED', label: 'Delivered', color: 'success' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'danger' },
  ];

  const loadOrders = useCallback(async () => {
    console.log('📦 [ORDERS] Loading orders...', { statusFilter, currentPage });
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ordersApi.getAllAdmin(
        statusFilter !== 'ALL' ? statusFilter : undefined,
        currentPage,
        ITEMS_PER_PAGE
      );
      
      console.log('✅ [ORDERS] API Response:', response);
      console.log('✅ [ORDERS] Response.data:', response.data);
      console.log('✅ [ORDERS] Response.total:', response.total);
      
      const ordersData = response.data || [];
      console.log('✅ [ORDERS] Extracted orders:', ordersData.length, 'orders');
      console.log('✅ [ORDERS] First order:', ordersData[0]);
      
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      setTotalPages(response.totalPages || 0);
      setTotalOrders(response.total || 0);
      
      if (ordersData.length === 0) {
        console.warn('⚠️ [ORDERS] No orders found in response');
      }
    } catch (err: any) {
      console.error('❌ [ORDERS] Failed to load:', err);
      console.error('❌ [ORDERS] Error details:', err.response?.data);
      const message = err?.response?.data?.message || err?.message || 'Failed to load orders';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, currentPage]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    let filtered = [...orders];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderId?.toLowerCase().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query) ||
        order.user?.phone?.includes(query)
      );
    }
    
    setFilteredOrders(filtered);
  }, [searchQuery, orders]);

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      console.log('🔄 [ORDERS] Updating order', orderId, 'to', newStatus);
      await ordersApi.updateStatus(orderId, newStatus);
      console.log('✅ [ORDERS] Status updated successfully');
      await loadOrders();
    } catch (err: any) {
      console.error('❌ [ORDERS] Status update failed:', err);
      const message = err?.response?.data?.message || err?.message || 'Failed to update status';
      alert(message);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <button key={1} className="pagination-btn" onClick={() => setCurrentPage(1)}>1</button>
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
          onClick={() => setCurrentPage(i)}
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
        <button key={totalPages} className="pagination-btn" onClick={() => setCurrentPage(totalPages)}>
          {totalPages}
        </button>
      );
    }
    
    return (
      <div className="table-pagination">
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <div className="pagination-numbers">{pages}</div>
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Manage customer orders</p>
        </div>
        <button className="btn btn-secondary" onClick={loadOrders}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Refresh
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
          <button onClick={loadOrders}>Retry</button>
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
              placeholder="Search by Order ID, Customer Name, Email or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-field"
            />
          </div>
          <div className="filter-group">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="table-wrapper">
          <div className="page-loading">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state-modern glass-panel">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <h3>No Orders Found</h3>
          <p>
            {searchQuery || statusFilter !== 'ALL'
              ? 'Try adjusting your filters'
              : totalOrders === 0
              ? 'No orders available yet'
              : 'No orders match your current filters'}
          </p>
          {totalOrders > 0 && (
            <button className="btn btn-primary" onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); }}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '15%' }}>Order ID</th>
                    <th style={{ width: '25%' }}>Customer</th>
                    <th style={{ width: '12%' }}>Items</th>
                    <th style={{ width: '15%' }}>Amount</th>
                    <th style={{ width: '15%' }}>Status</th>
                    <th style={{ width: '10%' }}>Date</th>
                    <th style={{ width: '8%', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="clickable" onClick={() => navigate(`/orders/${order.id}`)}>
                      <td>
                        <div className="order-id-cell">
                          <div className="order-id" style={{ fontWeight: 600, color: 'var(--accent-orange)' }}>
                            {order.orderId}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-name" style={{ fontWeight: 600 }}>
                            {order.user?.name || 'Guest'}
                          </div>
                          <div className="customer-email" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {order.user?.email || 'N/A'}
                          </div>
                          {order.user?.phone && (
                            <div className="customer-phone" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {order.user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px' }}>
                          {order.items?.length || 0} items
                        </div>
                      </td>
                      <td>
                        <div className="amount-cell" style={{ fontWeight: 700, color: 'var(--accent-green)' }}>
                          ₹{(order.totalAmount || 0).toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status || 'PENDING'}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className="status-select"
                          style={{ cursor: 'pointer' }}
                        >
                          {statusOptions.filter(s => s.value !== 'ALL').map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {formatDate(order.createdAt)}
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="actions-cell">
                          <button
                            className="btn-icon"
                            onClick={() => navigate(`/orders/${order.id}`)}
                            title="View Details"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {renderPagination()}
          
          <div className="products-stats">
            <span className="stats-text">
              Showing {filteredOrders.length} of {totalOrders} orders
              {currentPage > 1 && ` - Page ${currentPage} of ${totalPages}`}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;