import React, { useState } from 'react';
import { useError } from '../context/ErrorContext';

const ErrorNotification = () => {
   const { errors, removeError } = useError();
   return (
      <div className="error-notification-container">
         {errors.map((error) => (
            <ErrorToast key={error.id} error={error} onClose={() => removeError(error.id)} />
         ))}
      </div>
   );
};

const ErrorToast = ({ error, onClose }) => {
   const [isExiting, setIsExiting] = useState(false);
   const handleClose = () => {
      setIsExiting(true);
      setTimeout(onClose, 300);
   };
   const getErrorIcon = (type) => {
      switch (type) {
         case 'error': return '❌';
         case 'warning': return '⚠️';
         case 'info': return 'ℹ️';
         case 'success': return '✅';
         default: return '⚠️';
      }
   };
   const getToastClass = () => {
      let base = 'error-toast';
      if (isExiting) base += ' error-toast-exit';
      switch (error.type) {
         case 'error': return base + ' error-toast-error';
         case 'warning': return base + ' error-toast-warning';
         case 'info': return base + ' error-toast-info';
         case 'success': return base + ' error-toast-success';
         default: return base;
      }
   };
   return (
      <div className={getToastClass()}>
         <div className="error-toast-content">
            <span className="error-toast-icon">{getErrorIcon(error.type)}</span>
            <div className="error-toast-text">
               <h4 className="error-toast-title">{error.message}</h4>
               {error.details && <p className="error-toast-details">{error.details}</p>}
               {error.status && <p className="error-toast-status">Error Code: {error.status}</p>}
            </div>
         </div>
         <button onClick={handleClose} className="error-toast-close">✕</button>
      </div>
   );
};

export default ErrorNotification;