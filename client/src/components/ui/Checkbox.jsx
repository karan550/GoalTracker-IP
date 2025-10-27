import React, { forwardRef } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const Checkbox = forwardRef(({
  label,
  error,
  disabled = false,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`flex items-start ${containerClassName}`}>
      <label className="relative flex items-center cursor-pointer">
        <input
          ref={ref}
          type="checkbox"
          disabled={disabled}
          className="sr-only peer"
          {...props}
        />
        <motion.div
          whileTap={!disabled ? { scale: 0.95 } : {}}
          className={`
            w-5 h-5 rounded-md border-2 transition-all duration-200
            flex items-center justify-center
            ${error 
              ? 'border-red-500' 
              : 'border-dark-600 peer-checked:border-primary-500 peer-checked:bg-primary-500'
            }
            ${disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:border-primary-400'
            }
            ${className}
          `}
        >
          <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </motion.div>
      </label>
      
      {label && (
        <div className="ml-3 flex-1">
          <div className={`
            text-sm text-gray-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}>
            {label}
          </div>
          {error && (
            <p className="mt-0.5 text-sm text-red-500">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
