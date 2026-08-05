interface Documento {
  estado?: "pendiente" | "aprobado" | "rechazado";
}

interface Props {
  documentos: Documento[]; 
}

const capitalizar = (texto: string) =>
  texto.charAt(0).toUpperCase() + texto.slice(1);

const EstadoDocumento = ({ documentos }: Props) => {
  // Asegúrate de que el array no esté vacío
  if (!documentos || documentos.length === 0) return null;

  const estado = documentos[0].estado;
  return (
    estado && (
      <p
      >
        Estado: <span>{capitalizar(estado)}</span>
      </p>
    )
  );
};

export default EstadoDocumento;
