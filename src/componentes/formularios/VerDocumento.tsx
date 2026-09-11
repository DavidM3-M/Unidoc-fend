import { PapelIcon } from "../../assets/icons/Iconos";
import LabelVer from "./LabelVer";

type Documento = {
  archivo_url?: string;
  archivo: string;
  estado: string;
};

type Props = {
  documento: Documento | null | undefined;
};

const VerDocumento = ({ documento }: Props) => {
  const nombreArchivo = documento?.archivo.split("/").pop() || "";

  const [nombre, ext] = nombreArchivo.split(/\.(?=[^.]+$)/); // separa nombre y extensión
  const nombreCorto =
    nombre.length > 20 ? nombre.substring(0, 10) + "..." : nombre;

  if (!documento?.archivo_url) {
    return null;
  }

  return (
    <div>
      <LabelVer text="Documento adjunto:" />
      <div className="bg-[#f3ede1]/30 rounded-lg p-4 border border-[#1e3a5f]/10">
        <div className="flex items-center gap-2 ">
          <PapelIcon />
          <a
            href={documento.archivo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1e3a5f] underline hover:text-[#e8740e] transition-colors"
          >
            {nombreCorto}.{ext}
          </a>
        </div>
        <div className="">
          <a
            href={documento.archivo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-white bg-[#1e3a5f] px-3 py-1 rounded-lg hover:bg-[#e8740e] transition-colors w-full text-center"
          >
            Ver documento
          </a>
        </div>
      </div>
    </div>
  );
};

export default VerDocumento;