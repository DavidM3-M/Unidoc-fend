type Props = {
  text?: string | null
}


const LabelVer = ({ text }: Props) => {
  return (
    <div className="block text-sm font-medium text-gray-500 mb-1">{text}</div>
  )
}

export default LabelVer;
