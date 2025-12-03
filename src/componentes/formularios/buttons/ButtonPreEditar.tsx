import { EditIcon } from "../../../assets/icons/Iconos"

interface ButtonEditarProps {
  onClick: () => void
}

const ButtonPreEditar = ({ onClick }: ButtonEditarProps) => {
  return (
    <button
      onClick={onClick}
    >
        <EditIcon />
    </button>
  )
}

export default ButtonPreEditar
