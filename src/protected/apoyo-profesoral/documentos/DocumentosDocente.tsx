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

  const opcionesFiltro = [
    { valor: "estudios", etiqueta: "Estudios" },
    { valor: "idiomas", etiqueta: "Idiomas" },
    { valor: "experiencias", etiqueta: "Experiencias" },
  ];

  return (
    // Fondo limpio y contenedor con espaciado institucional
    <div className="flex flex-col gap-6 h-full min-w-5xl max-w-6xl bg-[#ffffff] rounded-3xl p-8 min-h-screen border border-[rgba(30,58,95,0.09)]">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[rgba(30,58,95,0.09)] pb-6">
        <div className="flex items-center gap-4">
          <Link to={"/apoyo-profesoral/docentes"}>
            <ButtonRegresar />
          </Link>
          <h1 className="text-3xl font-bold text-[#1e3a5f] font-sans tracking-tight">
            Documentación del Docente
          </h1>
        </div>
      </div>

      {/* Área de Filtros y Contenido */}
      <div className="pt-2">
        <div className="mb-8">
          <label className="block text-sm font-semibold text-[#1e3a5f] mb-3">
            Seleccione la categoría de información:
          </label>
          <FiltroDesplegable
            opciones={opcionesFiltro}
            valorInicial="estudios"
            onChange={(valor) => setFiltroActivo(valor)}
            className="w-64"
            // Estilos ajustados a la paleta institucional (Azul y Borde Tenue)
            estiloBoton="bg-[#ffffff] border border-[rgba(30,58,95,0.15)] rounded-xl shadow-sm hover:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all text-[#2c3e50]"
            estiloLista="bg-[#ffffff] border border-[rgba(30,58,95,0.15)] rounded-xl shadow-xl mt-2"
            estiloItem="hover:bg-[rgba(30,58,95,0.03)] hover:text-[#1e3a5f] text-[#2c3e50]"
          />
        </div>
        
        {/* Renderizado dinámico */}
        <div className="animate-in fade-in duration-300">
          {renderizarComponente()}
        </div>
      </div>
    </div>
  );
};

export default DocumentosDocente;