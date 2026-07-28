type Props = {
  value?: string;
  className?: string;
}

export const Puntaje = ({className=" ", value, ...props}: Props) => {

  return (
    <p
      {...props}
      className={`${className} text-base font-semibold rounded-xl text-white bg-[#1e3a5f] w-fit px-6 py-1`}
    >
      Puntaje: {value}
    </p>
  )
}