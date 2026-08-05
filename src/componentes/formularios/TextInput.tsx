const TextInput = ({ type = "text", className = "", ...props }) => {
  return (
    <input
      {...props}
      type={type}
      className={`
        h-12 w-full rounded-xl border border-[rgba(30,58,95,0.15)]
        bg-white p-3 text-sm text-[#2c3e50] font-medium
        shadow-sm
        focus:outline-none focus:border-[#e8740e] focus:shadow-[0_0_0_2px_rgba(232,116,14,0.2)] 
        transition-all duration-200 placeholder-[#6b7a8d]
        ${className}
      `}
    />
  );
};

export default TextInput;