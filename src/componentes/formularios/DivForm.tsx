
type Props = {
    children: React.ReactNode;

}

const DivForm = ({ children }: Props) => {
  return (
    <div className="flex flex-col">
      {children}
    </div>
  )
}
export default DivForm;
