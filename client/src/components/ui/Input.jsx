import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  type = 'text',
  placeholder,
  disabled = false,
  required = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const baseClasses = 'w-full px-4 py-3 bg-gray-800 border rounded-xl placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Explicitly set text color for all input types
  const textColorClasses = 'text-gray-100 caret-primary-400';

  const borderClasses = error
    ? 'border-red-500 focus:ring-red-500'
    : 'border-dark-600 hover:border-dark-500';

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-200 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            ${baseClasses}
            ${textColorClasses}
            ${borderClasses}
            ${Icon ? 'pl-12' : ''}
            ${error ? 'pr-12' : ''}
            ${className}
          `}
          style={{ WebkitTextFillColor: 'white' }}
          {...props}
        />
        
        {error && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
            <AlertCircle className="w-5 h-5" />
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1.5 text-sm text-red-500 flex items-center">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
