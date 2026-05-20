import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useError } from '../context/ErrorContext';

const Checkout = () => {
  const [shippingAddress, setShippingAddress] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [order, setOrder] = useState(null);
  const { cartItems, cartTotal, clearCart } = useCart();
  const { addError } = useError();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!shippingAddress.trim()) {
      addError({
        type: 'error',
        message: 'Validation Error',
        details: 'Shipping address is required',
      });
      return false;
    }

    if (shippingAddress.trim().length < 10) {
      addError({
        type: 'error',
        message: 'Validation Error',
        details: 'Shipping address must be at least 10 characters',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    try {
      const checkoutResponse = await api.post('/checkout', {
        shipping_address: shippingAddress,
        billing_address: billingAddress || shippingAddress,
        payment_method: paymentMethod,
      });

      const orderData = checkoutResponse.data.order;
      setOrder(orderData);

      // Try to process payment
      try {
        await api.get(`/checkout/pay/${orderData.id}`);
      } catch (paymentError) {
        addError({
          type: 'warning',
          message: 'Payment Processing',
          details: 'Your order has been created, but payment processing may take a moment.',
        });
      }

      setOrderComplete(true);
      clearCart();
      addError({
        type: 'success',
        message: 'Order Placed Successfully!',
        details: `Your order #${orderData.id} is now processing.`,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      addError({
        type: 'error',
        message: 'Checkout Failed',
        details: error.message || 'An error occurred during checkout. Please try again.',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (orderComplete && order) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Order Confirmed!</h2>
          <div style={styles.orderDetails}>
            <div style={styles.detailRow}>
              <span>Order Number:</span>
              <strong>#{order.id}</strong>
            </div>
            <div style={styles.detailRow}>
              <span>Total Amount:</span>
              <strong>${Number(order.total).toFixed(2)}</strong>
            </div>
            <div style={styles.detailRow}>
              <span>Status:</span>
              <strong style={{ color: '#27ae60' }}>Paid</strong>
            </div>
          </div>
          <p style={styles.confirmationText}>
            A confirmation email has been sent to your inbox.
          </p>
          <div style={styles.successActions}>
            <button
              onClick={() => navigate('/orders')}
              style={styles.viewOrdersBtn}
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/products')}
              style={styles.continueShoppingBtn}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Checkout</h1>

      {cartItems.length === 0 && !processing ? (
        <div style={styles.emptyCartBox}>
          <span style={styles.emptyIcon}>🛒</span>
          <p>Your cart is empty.</p>
          <button
            onClick={() => navigate('/products')}
            style={styles.continueShoppingBtn}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div style={styles.layout}>
          <div style={styles.formSection}>
            <form onSubmit={handleSubmit}>
              <h3 style={styles.sectionTitle}>Shipping Information</h3>
              <div style={styles.formGroup}>
                <label style={styles.label}>Shipping Address *</label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  style={styles.textarea}
                  required
                  rows={3}
                  placeholder="Enter your complete shipping address"
                  disabled={processing}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Billing Address</label>
                <textarea
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  style={styles.textarea}
                  rows={3}
                  placeholder="Leave empty to use shipping address"
                  disabled={processing}
                />
              </div>

              <h3 style={styles.sectionTitle}>Payment Method</h3>
              <div style={styles.formGroup}>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={styles.select}
                  disabled={processing}
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  ...styles.payBtn,
                  opacity: processing ? 0.7 : 1,
                  cursor: processing ? 'not-allowed' : 'pointer',
                }}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span style={styles.spinner}></span> Processing...
                  </>
                ) : (
                  `Pay $${Number(cartTotal).toFixed(2)}`
                )}
              </button>
            </form>
          </div>

          <div style={styles.summarySection}>
            <h3 style={styles.summaryTitle}>Order Summary</h3>
            <div style={styles.summaryItems}>
              {cartItems.map((item) => (
                <div key={item.id} style={styles.summaryItem}>
                  <span style={styles.itemDetail}>{item.product?.name || 'Item'}</span>
                  <span style={styles.itemQty}>x{item.quantity}</span>
                  <span style={styles.itemPrice}>${Number(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div style={styles.summaryTotal}>
              <strong style={styles.totalLabel}>Total</strong>
              <strong style={styles.totalPrice}>${Number(cartTotal).toFixed(2)}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '24px' },
  heading: { color: '#2c3e50', marginBottom: '24px', fontSize: '32px' },
  emptyCartBox: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  emptyIcon: { fontSize: '60px', display: 'block', marginBottom: '16px' },
  layout: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  formSection: { flex: '1', minWidth: '300px' },
  sectionTitle: { color: '#2c3e50', marginTop: 0, marginBottom: '16px', fontSize: '18px' },
  formGroup: { marginBottom: '16px' },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#2c3e50',
    fontSize: '14px',
    fontWeight: '500',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    marginTop: '4px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  select: {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  payBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  summarySection: {
    width: '300px',
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    alignSelf: 'flex-start',
    position: 'sticky',
    top: '20px',
  },
  summaryTitle: { margin: '0 0 16px', color: '#2c3e50', fontSize: '16px' },
  summaryItems: { marginBottom: '12px' },
  summaryItem: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    gap: '8px',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
    fontSize: '14px',
    alignItems: 'center',
  },
  itemDetail: { color: '#555' },
  itemQty: { color: '#999', fontSize: '13px' },
  itemPrice: { color: '#27ae60', fontWeight: '600', textAlign: 'right' },
  summaryTotal: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '8px',
    padding: '12px 0',
    fontSize: '18px',
    borderTop: '2px solid #2c3e50',
    marginTop: '8px',
  },
  totalLabel: { color: '#2c3e50' },
  totalPrice: { color: '#27ae60' },
  successCard: {
    textAlign: 'center',
    padding: '60px 40px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    backgroundColor: '#27ae60',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    margin: '0 auto 20px',
  },
  successTitle: { color: '#27ae60', fontSize: '32px', margin: '0 0 20px' },
  orderDetails: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '6px',
    marginBottom: '20px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #ecf0f1',
    fontSize: '14px',
  },
  confirmationText: { color: '#666', fontSize: '14px', marginBottom: '20px' },
  successActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  viewOrdersBtn: {
    padding: '12px 24px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  continueShoppingBtn: {
    padding: '12px 24px',
    backgroundColor: '#ecf0f1',
    color: '#2c3e50',
    border: '1px solid #bdc3c7',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default Checkout;