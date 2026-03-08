
type Props = {
    children: React.ReactNode;
    className?: string;
}

const DivForm = ({ children, className }: Props) => {
  return (
    <div className={`flex flex-col pt-5${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  )
}
export default DivForm;
