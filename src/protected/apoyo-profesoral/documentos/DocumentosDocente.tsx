import { Link, useParams } from "react-router";
import { ButtonRegresar } from "../../../componentes/formularios/ButtonRegresar";

import VerEstudios from "../trayectoria-docente/VerEstudiosDocente";
import { useState } from "react";
import FiltroDesplegable from "../../../componentes/filtro";
import VerIdiomasDocente from "../trayectoria-docente/VerIdiomaDocente";
import VerExperiencia from "../trayectoria-docente/VerExperienciaDocente";

const DocumentosDocente = () => {
  const [filtroActivo, setFiltroActivo] = useState("estudios");
  
  const { id } = useParams();
  const renderizarComponente = () => {
    switch (filtroActivo) {
      case "estudios":
        return <VerEstudios idDocente={id!} />;
      case "idiomas":
        return <VerIdiomasDocente idDocente={id!} />;
      case "experiencias":
        return <VerExperiencia idDocente={id!} />;
      default:
        return <VerEstudios idDocente={id!} />;
    }
  };
  // funcion para ver documentos

  const opcionesFiltro = [
    { valor: "estudios", etiqueta: "Estudios" },
    { valor: "idiomas", etiqueta: "Idiomas" },
    { valor: "experiencias", etiqueta: "Experiencias" },
  ];

  return (
    <div className="flex flex-col gap-4 h-full min-w-5xl max-w-6xl bg-white rounded-3xl p-8 min-h-screen">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <Link to={"/apoyo-profesoral/docentes"}>
              <ButtonRegresar />
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Docentes documentos
          </h1>
        </div>
      </div>

      <div>
        <FiltroDesplegable
          opciones={opcionesFiltro}
          valorInicial="estudios"
          onChange={(valor) => setFiltroActivo(valor)}
          className="w-64 mb-6"
          estiloBoton="bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          estiloLista="bg-white border border-gray-300 rounded-lg shadow-lg"
          estiloItem="hover:bg-gray-100"
        />
        {renderizarComponente()}
      </div>

      {/* Componente que se renderiza según el filtro */}
    </div>
  );
};

export default DocumentosDocente;
