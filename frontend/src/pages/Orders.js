import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addError } = useError();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      setOrders(response.data || []);
    } catch (error) {
      addError({
        type: 'error',
        message: 'Failed to load orders',
        details: error.details || 'Unable to fetch your orders',
      });
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#27ae60';
      case 'pending':
        return '#f39c12';
      case 'failed':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return '✓';
      case 'pending':
        return '⏱';
      case 'failed':
        return '✕';
      default:
        return '?';
    }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.authRequiredBox}>
          <span style={styles.icon}>🔐</span>
          <h2 style={styles.authTitle}>Login Required</h2>
          <p>Please login to view your orders.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>My Orders</h1>

      {orders.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>📦</span>
          <p style={styles.empty}>No orders yet</p>
          <p style={styles.emptySubtext}>Your orders will appear here once you make a purchase</p>
        </div>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order.id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div>
                  <h3 style={styles.orderId}>Order #{order.id}</h3>
                  <p style={styles.orderDate}>
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div style={styles.orderMeta}>
                  <span
                    style={{
                      ...styles.status,
                      backgroundColor: getStatusColor(order.status),
                    }}
                  >
                    <span style={styles.statusIcon}>
                      {getStatusIcon(order.status)}
                    </span>
                    {order.status.toUpperCase()}
                  </span>
                  <span style={styles.orderTotal}>
                    ${Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>
              {order.items && order.items.length > 0 && (
                <div style={styles.orderItems}>
                  {order.items.map((item, index) => (
                    <div key={item.id || index} style={styles.orderItem}>
                      <span style={styles.itemName}>{item.product_name}</span>
                      <span style={styles.itemDetail}>×{item.quantity}</span>
                      <span style={styles.itemPrice}>
                        ${Number(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '24px' },
  heading: { color: '#2c3e50', marginBottom: '24px', fontSize: '32px' },
  authRequiredBox: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  icon: { fontSize: '60px', display: 'block', marginBottom: '16px' },
  authTitle: { color: '#2c3e50', marginBottom: '8px' },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
    gap: '20px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #ecf0f1',
    borderTopColor: '#3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  emptyIcon: { fontSize: '60px', display: 'block', marginBottom: '16px' },
  empty: { color: '#2c3e50', fontSize: '20px', margin: '0 0 8px', fontWeight: '600' },
  emptySubtext: { color: '#999', fontSize: '14px', margin: 0 },
  orderCard: {
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    marginBottom: '16px',
    overflow: 'hidden',
    transition: 'box-shadow 0.2s',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #eee',
    flexWrap: 'wrap',
    gap: '12px',
  },
  orderId: { margin: 0, color: '#2c3e50', fontSize: '16px', fontWeight: '600' },
  orderDate: { color: '#999', fontSize: '13px', margin: '4px 0 0' },
  orderMeta: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  status: {
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '600',
  },
  statusIcon: { fontSize: '14px' },
  orderTotal: { fontSize: '18px', fontWeight: 'bold', color: '#2c3e50' },
  orderItems: { padding: '12px 20px' },
  orderItem: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    gap: '12px',
    padding: '8px 0',
    fontSize: '14px',
    color: '#555',
    alignItems: 'center',
  },
  itemName: { color: '#2c3e50', fontWeight: '500' },
  itemDetail: { color: '#999', fontSize: '13px' },
  itemPrice: { color: '#27ae60', fontWeight: '600', textAlign: 'right' },
};

export default Orders;