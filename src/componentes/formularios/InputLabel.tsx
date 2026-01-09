type Props = {
  value?: string;
  className?: string;
  children?: React.ReactNode;
  htmlFor: string;
}
export const InputLabel = ({className=" ",value,children,...props}:Props) => {

  return (
    <label
      {...props}
      className={`${className} text-sm font-semibold text-gray-700 block mb-2`}
    >
      {value ? value : children}
    </label>
  )
}
