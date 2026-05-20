import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useError } from '../context/ErrorContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addError } = useError();

  const debounceTimeout = useRef(null);
  const isInitialMount = useRef(true);

  // Core fetch function
  const fetchProducts = useCallback(async () => {
    try {
      const params = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (search) params.search = search;

      const response = await api.get('/products', { params });
      setProducts(response.data.data || []);
      return true;
    } catch (error) {
      addError({
        type: 'error',
        message: 'Failed to load products',
        details: error.details,
      });
      setProducts([]);
      throw error;
    }
  }, [selectedCategory, search, addError]);

  // Category change only depends on selectedCategory, not fetchProducts
  useEffect(() => {
    if (isInitialMount.current) return;
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    setSearching(true);
    fetchProducts().finally(() => setSearching(false));
  }, [selectedCategory]);

  // ✅ Search debounce: fetch when empty OR >=3 chars, with 1000ms delay
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    const shouldSearch = search.length === 0 || search.length >= 3;

    if (shouldSearch) {
      setSearching(true);
      debounceTimeout.current = setTimeout(() => {
        fetchProducts().finally(() => setSearching(false));
      }, 1000);
    } else {
      setSearching(false);
    }

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [search, fetchProducts]);

  // Initial load (once)
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchCategories(), fetchProducts()]);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError('Failed to load products. Please refresh the page.');
      } finally {
        setLoading(false);
        isInitialMount.current = false;
      }
    };
    loadInitial();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      addError({
        type: 'warning',
        message: 'Failed to load categories',
        details: error.details,
      });
      setCategories([]);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (search.length === 0 || search.length >= 3) {
      setSearching(true);
      fetchProducts().finally(() => setSearching(false));
    } else {
      addError({
        type: 'warning',
        message: 'Search query too short',
        details: 'Please enter at least 3 characters to search.',
      });
    }
  };

  const handleAddToCart = async (productId) => {
    if (!user) {
      addError({
        type: 'warning',
        message: 'Login Required',
        details: 'Please login to add items to cart',
      });
      return;
    }
    try {
      await addToCart(productId, 1);
      addError({
        type: 'success',
        message: 'Success!',
        details: 'Item added to cart',
      });
    } catch (error) {
      console.error('Add to cart error:', error);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Our Products</h1>
      {error && (
        <div style={styles.errorBanner}>
          <span style={styles.errorIcon}>⚠️</span>
          <div><strong>Error:</strong> {error}</div>
          <button onClick={() => window.location.reload()} style={styles.retryBtn}>Retry</button>
        </div>
      )}
      <div style={styles.filters}>
        <div style={styles.categoryFilter}>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={styles.select}>
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
          <input
            type="text"
            placeholder="Search products... (min. 3 chars)"
            value={search}
            onChange={handleSearchChange}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchBtn} disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>
      {searching && (
        <div style={styles.searchingIndicator}>
          <div style={styles.smallSpinner}></div>
          <span>Searching...</span>
        </div>
      )}
      <div style={styles.grid}>
        {products.map((product) => (
          <div key={product.id} style={styles.card}>
            <div style={styles.cardBody}>
              <span style={styles.category}>{product.category}</span>
              <h3 style={styles.productName}>{product.name}</h3>
              <p style={styles.description}>{product.description}</p>
              <div style={styles.priceRow}>
                <span style={styles.price}>${Number(product.price).toFixed(2)}</span>
                <span style={{ ...styles.stock, color: product.stock > 0 ? '#27ae60' : '#e74c3c' }}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
              <button
                onClick={() => handleAddToCart(product.id)}
                style={{ ...styles.addBtn, opacity: product.stock === 0 ? 0.5 : 1, cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>
        ))}
      </div>
      {products.length === 0 && !error && !searching && (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>📦</span>
          <p style={styles.empty}>No products found.</p>
          <p style={styles.emptySubtext}>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '24px' },
  heading: { color: '#2c3e50', marginBottom: '24px', fontSize: '32px' },
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
  smallSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #ecf0f1',
    borderTopColor: '#3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  searchingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#e8f4f8',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#3498db',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#fee',
    borderLeft: '4px solid #e74c3c',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#c00',
  },
  errorIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },
  retryBtn: {
    marginLeft: 'auto',
    padding: '6px 12px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  filters: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  categoryFilter: {},
  select: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  searchForm: { display: 'flex', gap: '8px' },
  searchInput: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    minWidth: '200px',
  },
  searchBtn: {
    padding: '10px 20px',
    backgroundColor: '#3498db',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'opacity 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  cardBody: { padding: '16px' },
  category: {
    fontSize: '12px',
    color: '#7f8c8d',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  productName: { margin: '8px 0', color: '#2c3e50', fontSize: '18px', fontWeight: '600' },
  description: { color: '#666', fontSize: '14px', marginBottom: '12px', lineHeight: '1.4' },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  price: { fontSize: '20px', fontWeight: 'bold', color: '#27ae60' },
  stock: { fontSize: '13px', color: '#95a5a6' },
  addBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#2c3e50',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  emptyIcon: {
    fontSize: '60px',
    display: 'block',
    marginBottom: '16px',
  },
  empty: { color: '#999', fontSize: '18px', margin: '0 0 8px' },
  emptySubtext: { color: '#bbb', fontSize: '14px', margin: 0 },
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
document.head.appendChild(styleSheet);

export default Products;