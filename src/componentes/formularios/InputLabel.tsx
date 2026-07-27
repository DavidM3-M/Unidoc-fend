type Props = {
  value?: string;
  className?: string;
  children?: React.ReactNode;
  htmlFor: string;
}

export const InputLabel = ({ className = "", value, children, ...props }: Props) => {
  return (
    <label
      {...props}
      /* Se ajusta el color a #1e3a5f (Azul institucional) para autoridad o #6b7a8d (muted) para apoyo. 
         Se mantiene la tipografía Inter (font-sans) y el peso 500 según especificación de metadatos.
      */
      className={`${className} text-[14px] font-medium text-[#1e3a5f] block mb-2`}
    >
      {value ? value : children}
    </label>
  );
};