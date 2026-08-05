import { PencilIcon } from "../../../assets/icons/Iconos"


interface ButtonEditarProps {
  onClick: () => void
}

const ButtonEditar = ({ onClick }: ButtonEditarProps) => {
  return (
    <button
      onClick={onClick}
    >
        <PencilIcon />
    </button>
  )
}

export default ButtonEditar
