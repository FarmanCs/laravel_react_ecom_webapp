import React, { createContext, useState, useContext, useCallback } from 'react';

const ErrorContext = createContext(null);

export const ErrorProvider = ({ children }) => {
   const [errors, setErrors] = useState([]);

   const addError = useCallback((error, duration = 5000) => {
      const id = Date.now();
      const errorObj = {
         id,
         message: error.message || 'An error occurred',
         type: error.type || 'error',
         status: error.status,
         details: error.details,
         timestamp: new Date(),
      };

      setErrors((prev) => [...prev, errorObj]);

      if (duration > 0) {
         setTimeout(() => removeError(id), duration);
      }

      return id;
   }, []);

   const removeError = useCallback((id) => {
      setErrors((prev) => prev.filter((err) => err.id !== id));
   }, []);

   const clearAllErrors = useCallback(() => {
      setErrors([]);
   }, []);

   const getErrorMessage = (status) => {
      const errorMessages = {
         400: 'Bad Request - Please check your input',
         401: 'Unauthorized - Please login again',
         403: 'Forbidden - You do not have permission to access this resource',
         404: 'Not Found - The requested resource does not exist',
         408: 'Request Timeout - The server took too long to respond',
         429: 'Too Many Requests - Please wait a moment before trying again',
         500: 'Server Error - Something went wrong on the server',
         502: 'Bad Gateway - The server is temporarily unavailable',
         503: 'Service Unavailable - The server is under maintenance',
         504: 'Gateway Timeout - The server did not respond in time',
      };

      return errorMessages[status] || 'An unexpected error occurred';
   };

   return (
      <ErrorContext.Provider
         value={{
            errors,
            addError,
            removeError,
            clearAllErrors,
            getErrorMessage,
         }}
      >
         {children}
      </ErrorContext.Provider>
   );
};

export const useError = () => {
   const context = useContext(ErrorContext);
   if (!context) {
      throw new Error('useError must be used within ErrorProvider');
   }
   return context;
};