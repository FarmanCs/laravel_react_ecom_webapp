import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loading } = useAuth();
  const { addError } = useError();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate inputs
      if (!email || !password) {
        addError({
          type: 'error',
          message: 'Validation Error',
          details: 'Please enter both email and password',
        });
        setIsSubmitting(false);
        return;
      }

      const user = await login(email, password);
      if (user) {
        navigate('/products');
      }
    } catch (error) {
      // Error is already handled by addError in AuthContext
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>🔐</span>
        </div>
        <h2 style={styles.title}>Login</h2>
        <p style={styles.subtitle}>Enter your credentials to continue</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="your@email.com"
              disabled={isSubmitting || loading}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              disabled={isSubmitting || loading}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: isSubmitting || loading ? 0.7 : 1,
              cursor: isSubmitting || loading ? 'not-allowed' : 'pointer',
            }}
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.divider}>or</div>

        <p style={styles.linkText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '20px',
  },
  card: {
    background: '#fff',
    padding: '40px 32px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  iconContainer: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  icon: {
    fontSize: '48px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '8px',
    color: '#2c3e50',
    fontSize: '28px',
    fontWeight: '600',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    fontSize: '14px',
    marginBottom: '24px',
    margin: '8px 0 24px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    marginBottom: '6px',
    color: '#2c3e50',
    fontSize: '14px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: '8px',
  },
  divider: {
    textAlign: 'center',
    color: '#999',
    margin: '20px 0',
    position: 'relative',
  },
  linkText: {
    textAlign: 'center',
    marginTop: '16px',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#3498db',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'color 0.2s',
  },
};

export default Login;