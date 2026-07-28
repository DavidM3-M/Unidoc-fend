import React from 'react';

type Props = {
  htmlFor: string;
  value?: string;
  className?: string;
  children?: React.ReactNode;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  label?: string;
};

export const LabelRadio = ({
  htmlFor,
  value,
  className = '',
  children,
  inputProps = {},
  label,
}: Props) => {
  return (
    <label htmlFor={htmlFor} className={`flex items-center gap-2 text-sm ${className}`}>
      <input
        type="radio"
        value={value}
        id={htmlFor}
        className="accent-[#1e3a5f] h-4 w-4 flex cursor-pointer"
        {...inputProps}
      />
      <span className="text-[#1e3a5f] text-sm">{label ?? children}</span>
    </label>
  );
};