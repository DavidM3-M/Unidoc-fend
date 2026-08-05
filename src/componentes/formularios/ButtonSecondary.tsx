type Props = {
  value: string
  className?: string
}

export const ButtonSecondary = ({className, value }: Props) => {
  return (
    <p
      className={`border-2 border-[#1e3a5f] hover:bg-[#f3ede1] text-[#1e3a5f] font-semibold py-2 px-16 rounded-2xl cursor-pointer text-center ${className}`}
    > { value } </p>
  )
}