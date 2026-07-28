type Props = {
  value: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

export const ButtonTable = ({ className, value, onClick, type = "button" }: Props) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        flex items-center justify-center
        bg-[#1e3a5f] hover:bg-[#2c3e50] 
        text-white font-semibold py-2 px-8 rounded-lg 
        transition-all duration-200 shadow-sm
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {value}
    </button>
  );
};