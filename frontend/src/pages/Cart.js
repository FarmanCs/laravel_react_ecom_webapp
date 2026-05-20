import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cartItems, cartTotal, loading, fetchCart, updateCartItem, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      console.error('Update cart error:', error);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Remove from cart error:', error);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Please add items to your cart before checking out');
      return;
    }
    navigate('/checkout');
  };

  if (!user) {
    return (
      <div className="container">
        <div className="empty-state">
          <ShoppingBag size={60} />
          <p className="empty-title">Login Required</p>
          <p className="empty-subtext">Please login to view your shopping cart</p>
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Go to Login
          </button>
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
          <ShoppingBag size={60} />
          <p className="empty-title">Your cart is empty</p>
          <p className="empty-subtext">Add some items to get started</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-section">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-info">
                  <h3 className="cart-item-name">{item.product?.name || 'Product'}</h3>
                  <p className="cart-item-price">${Number(item.price).toFixed(2)} each</p>
                </div>

                <div className="cart-item-controls">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="qty-btn"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="qty-display">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="qty-btn"
                  >
                    <Plus size={16} />
                  </button>

                  <span className="cart-subtotal">
                    ${Number(item.price * item.quantity).toFixed(2)}
                  </span>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-divider"></div>

            <div className="summary-total">
              <span>Subtotal:</span>
              <span>${Number(cartTotal).toFixed(2)}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-actions">
              <button onClick={() => navigate('/products')} className="btn btn-secondary btn-block">
                Continue Shopping
              </button>
              <button onClick={handleCheckout} className="btn btn-primary btn-block">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;