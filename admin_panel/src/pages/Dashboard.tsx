import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { ordersApi } from '../api/orders';
import { productsApi } from '../api/products';
import StatusChip from '../components/StatusChip';
import '../assets/styles/global.css';
import '../assets/styles/glass-theme.css';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  bgColor: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [ordersRes, productsRes] = await Promise.all([
        ordersApi.getAll(),
        productsApi.getAll({ page: 1, limit: 1 }),
      ]);

      const orders = Array.isArray(ordersRes) ? ordersRes : [];
      const productsTotal = productsRes.total || 0;

      const deliveredRevenue = orders
        .filter((o: any) => o.status === 'DELIVERED')
        .reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => o.status === 'PENDING').length,
        totalProducts: productsTotal,
        totalRevenue: deliveredRevenue,
      });

      setRecentOrders(orders.slice(0, 5));
      
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load dashboard data';
      setError(errorMessage);
      console.error('Dashboard error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards: StatCard[] = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      bgColor: 'rgba(102, 126, 234, 0.1)',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      bgColor: 'rgba(245, 87, 108, 0.1)',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      bgColor: 'rgba(79, 172, 254, 0.1)',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      bgColor: 'rgba(67, 233, 123, 0.1)',
    },
  ];

  const quickActions = [
    {
      title: 'Add Product',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        </svg>
      ),
      color: '#667eea',
      path: '/products/new',
    },
    {
      title: 'View Orders',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        </svg>
      ),
      color: '#f093fb',
      path: '/orders',
    },
    {
      title: 'Manage Categories',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
      color: '#4facfe',
      path: '/categories',
    },
    {
      title: 'Update Banners',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        </svg>
      ),
      color: '#43e97b',
      path: '/banners',
    },
  ];

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'delivered') return 'success';
    if (statusLower === 'pending') return 'warning';
    if (statusLower === 'cancelled') return 'danger';
    if (statusLower === 'shipped') return 'info';
    if (statusLower === 'confirmed') return 'info';
    return 'default';
  };

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">
              {currentTime.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="user-greeting">
            <div className="greeting-avatar">
              {(user?.name || 'A')[0].toUpperCase()}
            </div>
            <div className="greeting-info">
              <span className="greeting-name">{user?.name || 'Admin'}</span>
              <span className="greeting-role">{user?.role || 'ADMIN'}</span>
            </div>
          </div>
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
          <button className="btn btn-sm" onClick={loadDashboardData}>Retry</button>
        </div>
      )}

      <div className="stats-grid-modern">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card-modern glass-panel">
            <div className="stat-card-header">
              <div className="stat-icon-wrapper" style={{ background: stat.bgColor }}>
                <div className="stat-icon" style={{ color: stat.gradient.split(' ')[1] }}>
                  {stat.icon}
                </div>
              </div>
            </div>
            <div className="stat-card-body">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
            </div>
            <div className="stat-card-gradient" style={{ background: stat.gradient }} />
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel dashboard-section">
          <div className="section-header">
            <h3 className="section-title">Quick Actions</h3>
          </div>
          <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="quick-action-card"
                onClick={() => navigate(action.path)}
                style={{ '--action-color': action.color } as React.CSSProperties}
              >
                <div className="action-icon-wrapper">
                  {action.icon}
                </div>
                <span className="action-title">{action.title}</span>
                <div className="action-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel dashboard-section">
          <div className="section-header">
            <h3 className="section-title">Recent Orders</h3>
            <button className="btn btn-text" onClick={() => navigate('/orders')}>
              View All
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="empty-state-modern">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <p>No recent orders</p>
            </div>
          ) : (
            <div className="orders-list-modern">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="order-item-modern"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="order-left">
                    <div className="order-id-badge">
                      #{order.orderId || `ORD${order.id}`}
                    </div>
                    <div className="order-details">
                      <span className="order-customer">{order.user?.name || 'Customer'}</span>
                      <span className="order-date">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className="order-right">
                    <span className="order-amount">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</span>
                    <StatusChip
                      status={getStatusColor(order.status)}
                      label={order.status || 'PENDING'}
                      size="small"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;