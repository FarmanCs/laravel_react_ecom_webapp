import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!email || !password) {
        toast.error('Please enter both email and password');
        setIsSubmitting(false);
        return;
      }

      const user = await login(email, password);
      if (user) {
        toast.success('Login successful!');
        navigate('/products');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-icon">
          <Lock size={48} />
        </div>
        <h2 className="auth-title">Login</h2>
        <p className="auth-subtitle">Enter your credentials to continue</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="your@email.com"
              disabled={isSubmitting || loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Lock size={16} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
              disabled={isSubmitting || loading}
              required
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-block ${isSubmitting || loading ? 'loading' : ''}`}
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link-text">
          Don't have an account?{' '}
          <Link to="/register" className="link">Register now</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;