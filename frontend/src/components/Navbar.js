import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { LogOut, ShoppingCart, Package, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <Home size={24} />
          ShopApp
        </Link>

        <ul className="navbar-links">
          <li>
            <Link to="/products" className="navbar-link">Products</Link>
          </li>

          {user ? (
            <>
              <li>
                <Link to="/cart" className="navbar-link cart-link">
                  <ShoppingCart size={15} />
                  Cart ({cartItems.length})
                </Link>
              </li>
              <li>
                <Link to="/orders" className="navbar-link">
                  <Package size={20} />
                  Orders
                </Link>
              </li>
              <li className="navbar-user">
                <span className="user-name">{user.name}</span>
                <button onClick={handleLogout} className="btn btn-logout">
                  <LogOut size={18} />
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="navbar-link">Login</Link>
              </li>
              <li>
                <Link to="/register" className="btn btn-success btn-sm ">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;