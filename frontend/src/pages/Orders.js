import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { CheckCircle, Clock, XCircle, CreditCard, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState({});
  const [cancelLoading, setCancelLoading] = useState({});
  const { user } = useAuth();

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
      toast.error(error.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayOrder = async (orderId) => {
    setPaymentLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      await api.get(`/checkout/pay/${orderId}`);
      toast.success('Payment processed successfully!');
      fetchOrders();
    } catch (error) {
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      await api.post(`/orders/${orderId}/cancel`);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error.message || 'Failed to cancel order');
    } finally {
      setCancelLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (!user) {
    return (
      <div className="container">
        <div className="auth-required-box">
          <p>Please login to view your orders.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="heading">My Orders</h1>
      {orders.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No orders yet</p>
          <p className="empty-subtext">Your orders will appear here once you make a purchase</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPay={handlePayOrder}
              onCancel={handleCancelOrder}
              paymentLoading={paymentLoading[order.id]}
              cancelLoading={cancelLoading[order.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function OrderCard({ order, onPay, onCancel, paymentLoading, cancelLoading }) {
  const statusConfig = {
    paid: { icon: CheckCircle, color: '#27ae60', label: 'Paid' },
    pending: { icon: Clock, color: '#f39c12', label: 'Pending' },
    cancelled: { icon: XCircle, color: '#e74c3c', label: 'Cancelled' },
  };

  const config = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="order-card">
      <div className="order-header">
        <div>
          <h3 className="order-id">Order #{order.id}</h3>
          <p className="order-date">
            {new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="order-meta">
          <div className="order-status" style={{ borderColor: config.color }}>
            <StatusIcon size={16} color={config.color} />
            <span style={{ color: config.color }}>{config.label}</span>
          </div>
          <span className="order-total">${Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      {order.items && order.items.length > 0 && (
        <div className="order-items">
          {order.items.map((item, index) => (
            <div key={item.id || index} className="order-item">
              <span className="item-name">{item.product_name}</span>
              <span className="item-detail">×{item.quantity}</span>
              <span className="item-price">${Number(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {order.status === 'pending' && (
        <div className="order-actions">
          <button
            className="btn btn-primary"
            onClick={() => onPay(order.id)}
            disabled={paymentLoading}
          >
            <CreditCard size={16} />
            {paymentLoading ? 'Processing...' : 'Pay Now'}
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onCancel(order.id)}
            disabled={cancelLoading}
          >
            <X size={16} />
            {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Orders;