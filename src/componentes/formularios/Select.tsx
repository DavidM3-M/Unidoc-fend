import { forwardRef } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <select
        className={`mt-1 block w-full rounded-md border-[#1e3a5f]/30 shadow-sm focus:border-[#1e3a5f] focus:ring-[#1e3a5f] sm:text-sm ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

export default Select;  