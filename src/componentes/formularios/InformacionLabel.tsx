type Props = {
  text: string
}

const InformacionLabel = ({ text }: Props) => {
  return (
    <div className="text-base  text-gray-900">{text}</div>
  )
}

export default InformacionLabel;
