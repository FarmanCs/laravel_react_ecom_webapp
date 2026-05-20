import React from 'react';

class ErrorBoundary extends React.Component {
   constructor(props) {
      super(props);
      this.state = {
         hasError: false,
         error: null,
         errorInfo: null,
         errorCount: 0,
      };
   }

   static getDerivedStateFromError(error) {
      return { hasError: true };
   }

   componentDidCatch(error, errorInfo) {
      this.setState((prevState) => ({
         error,
         errorInfo,
         errorCount: prevState.errorCount + 1,
      }));

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
         console.error('Error caught by boundary:', error, errorInfo);
      }

      // Log to external service in production
      if (process.env.NODE_ENV === 'production') {
         // Example: logErrorToService(error, errorInfo);
      }
   }

   handleReset = () => {
      this.setState({
         hasError: false,
         error: null,
         errorInfo: null,
      });
   };

   render() {
      if (this.state.hasError) {
         const isDevelopment = process.env.NODE_ENV === 'development';

         return (
            <div style={styles.container}>
               <div style={styles.errorCard}>
                  <div style={styles.iconContainer}>
                     <span style={styles.icon}>⚠️</span>
                  </div>
                  <h1 style={styles.title}>Oops! Something went wrong</h1>
                  <p style={styles.message}>
                     We're sorry, but the application encountered an unexpected error.
                  </p>

                  {isDevelopment && this.state.error && (
                     <div style={styles.devSection}>
                        <h3 style={styles.devTitle}>Error Details (Development Only)</h3>
                        <pre style={styles.errorTrace}>
                           {this.state.error.toString()}
                        </pre>
                        {this.state.errorInfo && (
                           <pre style={styles.errorTrace}>
                              {this.state.errorInfo.componentStack}
                           </pre>
                        )}
                     </div>
                  )}

                  <div style={styles.actions}>
                     <button onClick={this.handleReset} style={styles.primaryBtn}>
                        Try Again
                     </button>
                     <button
                        onClick={() => (window.location.href = '/products')}
                        style={styles.secondaryBtn}
                     >
                        Go to Home
                     </button>
                  </div>

                  {this.state.errorCount > 3 && (
                     <p style={styles.warningText}>
                        Multiple errors detected. Please refresh the page or contact support.
                     </p>
                  )}
               </div>
            </div>
         );
      }

      return this.props.children;
   }
}

const styles = {
   container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f6fa',
      padding: '20px',
   },
   errorCard: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      padding: '40px',
      maxWidth: '500px',
      textAlign: 'center',
   },
   iconContainer: {
      marginBottom: '20px',
   },
   icon: {
      fontSize: '60px',
   },
   title: {
      color: '#2c3e50',
      fontSize: '28px',
      margin: '0 0 16px',
   },
   message: {
      color: '#666',
      fontSize: '16px',
      lineHeight: '1.6',
      margin: '0 0 20px',
   },
   devSection: {
      backgroundColor: '#f8f9fa',
      borderLeft: '4px solid #e74c3c',
      padding: '16px',
      borderRadius: '4px',
      marginBottom: '20px',
      textAlign: 'left',
   },
   devTitle: {
      color: '#e74c3c',
      fontSize: '14px',
      margin: '0 0 12px',
   },
   errorTrace: {
      backgroundColor: '#2c3e50',
      color: '#ecf0f1',
      padding: '12px',
      borderRadius: '4px',
      fontSize: '12px',
      overflow: 'auto',
      maxHeight: '200px',
      margin: 0,
      fontFamily: 'monospace',
   },
   actions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      marginTop: '24px',
   },
   primaryBtn: {
      padding: '12px 24px',
      backgroundColor: '#3498db',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
   },
   secondaryBtn: {
      padding: '12px 24px',
      backgroundColor: '#ecf0f1',
      color: '#2c3e50',
      border: '1px solid #bdc3c7',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
   },
   warningText: {
      color: '#e74c3c',
      fontSize: '13px',
      marginTop: '16px',
      backgroundColor: '#fee',
      padding: '10px',
      borderRadius: '4px',
   },
};

export default ErrorBoundary;