// Input de texto

const TextInput = ({ type = "text", className = "", ...props }) => {
  return (
    <input
      {...props}
      type={type}
      className={`${className}         
          h-10 w-full rounded-lg border-[1.8px] border-gray-200
          shadow-sm p-2 text-sm text-slate-900`}
    ></input>
  );
};

export default TextInput;
