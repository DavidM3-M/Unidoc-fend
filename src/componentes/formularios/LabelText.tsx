type Props = {
  value?: string;
  className?: string;
}
export const LabelText = ({className=" ",value,...props}:Props) => {

  return (
    <p
      {...props}
      className={`${className} text-base font-medium text-[#637887] `}
    >
      {value}
    </p>
  )
}
