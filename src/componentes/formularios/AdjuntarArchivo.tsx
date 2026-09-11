import type { ComponentPropsWithRef } from "react";
type Props = {
  register: ComponentPropsWithRef<"input">;
  id: string;
  nombre?: string;
}

export const AdjuntarArchivo = ({id, register, nombre}: Props) => {
  return (
    <div className="col-span-full border-2 border-dashed border-[#1e3a5f]/30 p-6 rounded-md w-full flex flex-col items-center hover:border-[#1e3a5f]/60 transition-colors">
      <label htmlFor={id} className="text-lg font-bold text-[#1e3a5f] mb-2">
        Cargar archivo {nombre}
      </label>

      <input
        id={id}
        type="file"
        accept=".pdf,application/pdf"
        {...register}
        className="file:bg-[#1e3a5f] file:text-white file:rounded-md file:px-4 file:py-2 file:border-none file:shadow-sm file:hover:bg-[#e8740e] transition text-sm flex file:items-center file:cursor-pointer w-full sm:w-fit h-10"
      />
    </div>
  )
}
