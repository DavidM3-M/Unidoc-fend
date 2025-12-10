import { PlusIcon } from "@heroicons/react/24/outline"

interface ButtonAgregarVacioProps {
  onClick: () => void
  tipo?: string
}

const ButtonAgregarVacio = ({ onClick, tipo }: ButtonAgregarVacioProps) => {
  return (
    <button
      onClick={onClick}
      className="flex border-2 border-dashed border-gray-400 p-3 rounded-md w-full justify-center items-center hover:border-gray-500 hover:bg-gray-100 transition gap-2 cursor-pointer"
    >
        <PlusIcon className="size-8 text-gray-600 "/>
        <p className="text-gray-600 text-sm">Agregar {tipo}</p>
    </button>
  )
}

export default ButtonAgregarVacio
