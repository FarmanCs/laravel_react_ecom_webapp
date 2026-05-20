import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';

const Cart = () => {
  const { cartItems, cartTotal, loading, fetchCart, updateCartItem, removeFromCart } = useCart();
  const { user } = useAuth();
  const { addError } = useError();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      addError({ type: 'error', message: 'Invalid Quantity', details: 'Quantity must be at least 1' });
      return;
    }
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) { console.error('Update cart error:', error); }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      addError({ type: 'success', message: 'Item Removed', details: 'Item has been removed from cart' });
    } catch (error) { console.error('Remove from cart error:', error); }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      addError({ type: 'error', message: 'Empty Cart', details: 'Please add items to your cart before checking out' });
      return;
    }
    navigate('/checkout');
  };

  if (!user) {
    return (
      <div className="container">
        <div className="auth-required-box">
          <span className="auth-icon">🔐</span>
          <h2 className="auth-title">Login Required</h2>
          <p>Please login to view your shopping cart.</p>
          <button onClick={() => navigate('/login')} className="login-btn">Go to Login</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="heading">Shopping Cart</h1>
      {cartItems.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🛒</span>
          <p className="empty-title">Your cart is empty</p>
          <p className="empty-subtext">Add some items to get started</p>
          <button onClick={() => navigate('/products')} className="continue-shopping-btn">Continue Shopping</button>
        </div>
      ) : (
        <>
          <div className="items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <h3 className="item-name">{item.product?.name || 'Product'}</h3>
                  <p className="item-price">${Number(item.price).toFixed(2)} each</p>
                </div>
                <div className="item-actions">
                  <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="qty-btn">−</button>
                  <span className="qty">{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="qty-btn">+</button>
                  <span className="subtotal">${Number(item.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => handleRemove(item.id)} className="remove-btn">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="total-section">
            <div className="total-info">
              <h2 className="total-label">Total:</h2>
              <h2 className="total-amount">${Number(cartTotal).toFixed(2)}</h2>
            </div>
            <div className="cart-actions">
              <button onClick={() => navigate('/products')} className="continue-shopping-btn">Continue Shopping</button>
              <button onClick={handleCheckout} className="checkout-btn">Proceed to Checkout →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;