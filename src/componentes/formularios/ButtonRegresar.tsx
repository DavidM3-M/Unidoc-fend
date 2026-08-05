import ArrowLeft from '@heroicons/react/24/outline/ArrowLeftIcon';

type Props = {
  className?: string;
  onClick?: () => void;
};

export const ButtonRegresar = ({ className, onClick }: Props) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center justify-center rounded-full 
        bg-[#1e3a5f] text-white size-8 
        hover:bg-[#e8740e] transition-all duration-200 
        shadow-md hover:shadow-lg active:scale-95
        ${className}
      `}
    >
      <ArrowLeft className="size-5 stroke-[2.5]" />
    </button>
  );
};