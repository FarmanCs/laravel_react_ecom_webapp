import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, loading } = useAuth();
  const { addError } = useError();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      addError({
        type: 'error',
        message: 'Validation Error',
        details: 'Name is required',
      });
      return false;
    }

    if (!formData.email.trim()) {
      addError({
        type: 'error',
        message: 'Validation Error',
        details: 'Email is required',
      });
      return false;
    }

    if (!formData.password) {
      addError({
        type: 'error',
        message: 'Validation Error',
        details: 'Password is required',
      });
      return false;
    }

    if (formData.password.length < 8) {
      addError({
        type: 'error',
        message: 'Validation Error',
        details: 'Password must be at least 8 characters',
      });
      return false;
    }

    if (formData.password !== formData.passwordConfirmation) {
      addError({
        type: 'error',
        message: 'Validation Error',
        details: 'Passwords do not match',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const user = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.passwordConfirmation
      );
      if (user) {
        navigate('/products');
      }
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>📝</span>
        </div>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join us today and start shopping</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter your name"
              disabled={isSubmitting || loading}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="Enter your email"
              disabled={isSubmitting || loading}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="••••••••"
              disabled={isSubmitting || loading}
              required
            />
            <p style={styles.hint}>Minimum 8 characters</p>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="passwordConfirmation"
              value={formData.passwordConfirmation}
              onChange={handleChange}
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
            {isSubmitting || loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={styles.linkText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Login here
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
    minHeight: '90vh',
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
    fontSize: '30px',
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
  hint: {
    fontSize: '12px',
    color: '#999',
    margin: '4px 0 0',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginTop: '8px',
  },
  linkText: {
    textAlign: 'center',
    marginTop: '20px',
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

export default Register;