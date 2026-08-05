import { AddIcon } from "../../../assets/icons/Iconos"

interface ButtonAgregarProps {
  onClick: () => void
}

const ButtonAgregar = ({ onClick }: ButtonAgregarProps) => {
  return (
    <button
      onClick={onClick}
    >
        <AddIcon />
    </button>
  )
}

export default ButtonAgregar
