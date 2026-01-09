// Input de texto

const TextInput = ({ type = "text", className = "", ...props }) => {
  return (
    <input
      {...props}
      type={type}
      className={`${className}         
          h-12 w-full rounded-xl border-2 border-gray-300
          shadow-md p-3 text-sm text-slate-900 font-medium
          focus:outline-none focus:border-blue-500 focus:shadow-lg focus:ring-1 focus:ring-blue-400
          transition-all duration-200 placeholder-gray-400`}
    ></input>
  );
};

export default TextInput;
