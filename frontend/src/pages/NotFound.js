import { useNavigate } from 'react-router-dom';

const NotFound = () => {
   const navigate = useNavigate();

   return (
      <div style={styles.container}>
         <div style={styles.content}>
            <div style={styles.errorCode}>404</div>
            <h1 style={styles.title}>Page Not Found</h1>
            <p style={styles.description}>
               Sorry, the page you are looking for doesn't exist or has been moved.
            </p>

            <div style={styles.illustration}>
               <svg
                  viewBox="0 0 200 200"
                  style={{ width: '200px', height: '200px' }}
               >
                  <circle cx="100" cy="100" r="90" fill="none" stroke="#ecf0f1" strokeWidth="2" />
                  <text
                     x="100"
                     y="110"
                     textAnchor="middle"
                     fontSize="60"
                     fill="#3498db"
                     fontWeight="bold"
                  >
                     ?
                  </text>
               </svg>
            </div>

            <div style={styles.actions}>
               <button
                  onClick={() => navigate('/products')}
                  style={styles.primaryBtn}
               >
                  Go to Home
               </button>
               <button
                  onClick={() => navigate(-1)}
                  style={styles.secondaryBtn}
               >
                  Go Back
               </button>
            </div>

            <div style={styles.suggestionsBox}>
               <h3 style={styles.suggestionsTitle}>Here are some helpful links:</h3>
               <ul style={styles.suggestionsList}>
                  <li><a href="/products" style={styles.link}>Shop Products</a></li>
                  <li><a href="/cart" style={styles.link}>View Cart</a></li>
                  <li><a href="/orders" style={styles.link}>My Orders</a></li>
               </ul>
            </div>
         </div>
      </div>
   );
};

const styles = {
   container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f6fa',
      padding: '20px',
   },
   content: {
      textAlign: 'center',
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      padding: '60px 40px',
      maxWidth: '500px',
   },
   errorCode: {
      fontSize: '120px',
      fontWeight: 'bold',
      color: '#3498db',
      margin: '0 0 20px',
      lineHeight: 1,
   },
   title: {
      fontSize: '32px',
      color: '#2c3e50',
      margin: '0 0 16px',
   },
   description: {
      fontSize: '16px',
      color: '#666',
      margin: '0 0 30px',
      lineHeight: '1.6',
   },
   illustration: {
      margin: '30px 0',
   },
   actions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      margin: '30px 0',
      flexWrap: 'wrap',
   },
   primaryBtn: {
      padding: '12px 32px',
      backgroundColor: '#3498db',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
   },
   secondaryBtn: {
      padding: '12px 32px',
      backgroundColor: '#ecf0f1',
      color: '#2c3e50',
      border: '1px solid #bdc3c7',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
   },
   suggestionsBox: {
      marginTop: '40px',
      paddingTop: '20px',
      borderTop: '1px solid #ecf0f1',
      textAlign: 'left',
   },
   suggestionsTitle: {
      color: '#2c3e50',
      fontSize: '16px',
      margin: '0 0 12px',
   },
   suggestionsList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
   },
   link: {
      color: '#3498db',
      textDecoration: 'none',
      fontSize: '14px',
      display: 'block',
      padding: '8px 0',
      transition: 'color 0.2s',
   },
};

export default NotFound;