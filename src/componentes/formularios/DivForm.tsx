
type Props = {
    children: React.ReactNode;

}

const DivForm = ({ children }: Props) => {
  return (
    <div className="flex flex-col pt-5">
      {children}
    </div>
  )
}
export default DivForm;
