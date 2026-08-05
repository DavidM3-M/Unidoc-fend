type Props = {
  value?: string;
  className?: string;
}
export const Texto = ({className=" ",value,...props}:Props) => {

  return (
    <p
      {...props}
      className={`${className} text-base font-medium text-[#121417] `}
    >
      {value}
    </p>
  )
}
