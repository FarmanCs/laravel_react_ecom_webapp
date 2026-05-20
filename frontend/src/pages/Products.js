import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  AlertCircle,
  Loader,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [error, setError] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [addingToCart, setAddingToCart] = useState({}); // track per-product loading
  const { user } = useAuth();
  const { addToCart } = useCart();
  const debounceTimeout = useRef(null);
  const isInitialMount = useRef(true);

  // Fetch function – kept stable with a ref to avoid dependency issues
  const fetchProductsRef = useRef();
  fetchProductsRef.current = async (
    page = 1,
    itemsPerPage = 15,
    showCategorySpinner = false,
    showSearchSpinner = false
  ) => {
    try {
      if (showCategorySpinner) setCategoryLoading(true);
      if (showSearchSpinner) setSearchLoading(true);
      if (!showCategorySpinner && !showSearchSpinner) setLoading(true);

      const params = { page, per_page: itemsPerPage };

      // Use current state values it captured inside the ref hot, so they are always fresh.
      if (selectedCategory) params.category_id = selectedCategory;
      if (search && search.trim().length >= 3) params.search = search.trim();

      const response = await api.get('/products', { params });

      setProducts(response.data.data || []);
      setCurrentPage(response.data.meta?.current_page || 1);
      setLastPage(response.data.meta?.last_page || 1);
      setPerPage(response.data.meta?.per_page || 15);
      setTotal(response.data.meta?.total || 0);
      setFrom(response.data.meta?.from || 0);
      setTo(response.data.meta?.to || 0);
      setError(null);
      setSearchError('');
      return true;
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
      setProducts([]);
      setError('Failed to load products');
      throw error;
    } finally {
      setLoading(false);
      setCategoryLoading(false);
      setSearchLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.warning('Failed to load categories', { autoClose: 2000 });
      setCategories([]);
    }
  };

  // Initial load
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchCategories();
        await fetchProductsRef.current(1, 15);
      } catch (err) {
        setError('Failed to load products. Please refresh the page.');
      } finally {
        isInitialMount.current = false;
      }
    };
    loadInitial();
  }, []);

  // Category change  immediate fetch lears any pending search debounce
  useEffect(() => {
    if (isInitialMount.current) return;
    // Cancel any pending search debounce when category changes
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    setCurrentPage(1);
    fetchProductsRef.current(1, perPage, true, false);
  }, [selectedCategory]);

  // Search effect (debounced, minimum 3 characters, no clearing of products)
  useEffect(() => {
    if (isInitialMount.current) return;

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    // Update validation message
    if (search.length > 0 && search.length < 3) {
      setSearchError(`Minimum 3 characters required (${search.length}/3)`);
    } else {
      setSearchError('');
    }

    const shouldSearch = search.length === 0 || search.length >= 3;

    if (shouldSearch) {
      debounceTimeout.current = setTimeout(() => {
        setCurrentPage(1);
        // Show search spinner for any search action (including clearing)
        fetchProductsRef.current(1, perPage, false, true);
      }, 1000);
    }

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [search, perPage]);

  // Add to cart with per-product loading state
  const handleAddToCart = async (productId) => {
    if (!user) {
      toast.warning('Please login to add items to cart', { autoClose: 2000 });
      return;
    }
    setAddingToCart((prev) => ({ ...prev, [productId]: true }));
    try {
      await addToCart(productId, 1);
      toast.success('Item added to cart', { autoClose: 2000 });
    } catch (error) {
      // console.error('Add to cart error:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > lastPage) return;
    setCurrentPage(newPage);
    fetchProductsRef.current(newPage, perPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePerPageChange = (e) => {
    const newPerPage = Number(e.target.value);
    setPerPage(newPerPage);
    setCurrentPage(1);
    fetchProductsRef.current(1, newPerPage);
  };

  if (loading && products.length === 0) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="spinner"></div>

          {/* <Loader color="#007bff" size={30} className="thin-spinner " /> */}
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="heading">Our Products</h1>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <div>
            <strong>Error:</strong> {error}
            <button
              onClick={() => window.location.reload()}
              className="btn btn-sm btn-danger"
              style={{ marginLeft: 'auto' }}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="filters">
        {/* Category Filter with thin spinner */}
        <div className="category-filter-wrapper">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
            disabled={categoryLoading}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {categoryLoading && (
            <div className="category-spinner-wrapper">
              <Loader size={16} className="thin-spinner" />
            </div>
          )}
        </div>

        {/* Search Input with thin spinner & validation */}
        <div className="search-wrapper">
          <div className="search-form">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              disabled={searchLoading}
              maxLength="100"
            />
            {searchLoading && (
              <div className="search-spinner-wrapper">
                <Loader size={16} className="thin-spinner" />
              </div>
            )}
          </div>
          {searchError && (
            <p className="search-helper-text search-error">
              <AlertCircle size={14} />
              {searchError}
            </p>
          )}
          {search.length > 0 && search.length >= 3 && !searchLoading && (
            <p className="search-helper-text search-success">
              ✓ Showing results for "{search}"
            </p>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            isAdding={addingToCart[product.id] || false}
          />
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && !error && !loading && (
        <div className="empty-state">
          <AlertCircle size={48} className="empty-icon" />
          <p className="empty-title">
            {search.length > 0 && search.length < 3
              ? 'Keep typing...'
              : 'No products found'}
          </p>
          <p className="empty-subtext">
            {search.length > 0 && search.length < 3
              ? `Enter at least ${3 - search.length} more character${3 - search.length !== 1 ? 's' : ''
              }`
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {total > 0 && (
        <div className="pagination-section">
          {lastPage > 1 && (
            <div className="pagination-controls">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="pagination-btn"
                title="First page"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <ChevronLeft size={18} />
                Previous
              </button>
              <div className="pagination-info">
                <span className="page-counter">
                  Page <strong>{currentPage}</strong> of <strong>{lastPage}</strong>
                </span>
                <span className="product-counter">
                  Showing <strong>{from}</strong>–<strong>{to}</strong> of{' '}
                  <strong>{total}</strong> products
                </span>
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === lastPage}
                className="pagination-btn"
              >
                Next
                <ChevronRight size={18} />
              </button>
              <button
                onClick={() => handlePageChange(lastPage)}
                disabled={currentPage === lastPage}
                className="pagination-btn"
                title="Last page"
              >
                Last
              </button>
            </div>
          )}
          <div className="items-per-page">
            <label htmlFor="per-page-select">Show per page:</label>
            <select
              id="per-page-select"
              value={perPage}
              onChange={handlePerPageChange}
              className="per-page-select"
            >
              <option value={15}>15 items</option>
              <option value={30}>30 items</option>
              <option value={60}>60 items</option>
              <option value={90}>90 items</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

function ProductCard({ product, onAddToCart, isAdding }) {
  return (
    <div className="product-card">
      <div className="product-category">{product.category}</div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-description">{product.description}</p>

      <div className="product-footer">
        <div className="product-price-row">
          <span className="product-price">
            ${Number(product.price).toFixed(2)}
          </span>
          <span
            className={`product-stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'
              }`}
          >
            {product.stock > 0
              ? `${product.stock} in stock`
              : 'Out of stock'}
          </span>
        </div>

        <button
          onClick={() => onAddToCart(product.id)}
          className={`btn btn-primary btn-block ${product.stock === 0 || isAdding ? 'disabled' : ''
            }`}
          disabled={product.stock === 0 || isAdding}
        >
          {isAdding ? (
            <Loader size={16} className="thin-spinner" />
          ) : product.stock === 0 ? (
            'Out of Stock'
          ) : (
            'Add to Cart'
          )}
        </button>
      </div>
    </div>
  );
}

export default Products;