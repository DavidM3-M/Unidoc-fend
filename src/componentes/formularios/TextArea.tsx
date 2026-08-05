import React from "react";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ className = "", ...props }) => {
  return (
    <textarea
      {...props}
      className={`${className}         
h-32 w-full rounded-lg border-[1.8px] border-gray-200
          shadow-sm p-2 text-sm text-slate-900`}
    />
  );
};

export default TextArea;
