import { PapelIcon } from "../../assets/icons/Iconos";
import LabelVer from "./LabelVer";

type Documento = {
  archivo_url: string;
  archivo: string;
  estado: string;
};

type Props = {
  documento: Documento | null;
};

const VerDocumento = ({ documento }: Props) => {
  const nombreArchivo = documento?.archivo.split("/").pop() || "";

  const [nombre, ext] = nombreArchivo.split(/\.(?=[^\.]+$)/); // separa nombre y extensión
  const nombreCorto =
    nombre.length > 20 ? nombre.substring(0, 10) + "..." : nombre;

  if (!documento) {
    return 
  }

  return (
    <div>
      <LabelVer text="Documento adjunto:" />
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex items-center gap-2 ">
          <PapelIcon />
          <a
            href={documento.archivo_url}
            target="_blank"
            className="text-blue-600 underline"
          >
            {nombreCorto}.{ext}
          </a>
        </div>
        <div className="">
          <a
            href={documento.archivo_url}
            target="_blank"
            className="mt-2 inline-block text-sm text-white bg-blue-500 px-3 py-1 rounded-lg hover:bg-blue-600 w-full text-center"
          >
            Ver documento
          </a>
        </div>
      </div>
    </div>
  );
};

export default VerDocumento;
