import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Textarea = forwardRef(({
  label,
  error,
  placeholder,
  disabled = false,
  required = false,
  rows = 4,
  maxLength,
  showCount = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [count, setCount] = React.useState(0);

  const baseClasses = 'w-full px-4 py-3 bg-gray-800 border rounded-xl text-gray-100 placeholder-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none';

  const borderClasses = error
    ? 'border-red-500 focus:ring-red-500'
    : 'border-dark-600 hover:border-dark-500';

  const handleChange = (e) => {
    if (showCount) {
      setCount(e.target.value.length);
    }
    props.onChange?.(e);
  };

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-200 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          ref={ref}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          className={`
            ${baseClasses}
            ${borderClasses}
            ${className}
          `}
          onChange={handleChange}
          {...props}
        />
        
        {error && (
          <div className="absolute right-4 top-3 text-red-500">
            <AlertCircle className="w-5 h-5" />
          </div>
        )}
      </div>
      
      <div className="mt-1.5 flex items-center justify-between">
        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <div />
        )}
        
        {showCount && maxLength && (
          <p className="text-sm text-gray-400">
            {count} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
