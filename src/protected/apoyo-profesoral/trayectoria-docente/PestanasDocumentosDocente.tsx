import { useState } from "react";
import VerEstudios from "./VerEstudiosDocente";
import VerIdiomaDocente from "./VerIdiomaDocente";
import VerExperiencia from "./VerExperienciaDocente";
import VerProduccionAcademica from "./VerProduccionAcademicaDocente";

type Vista = "estudios" | "idiomas" | "experiencias" | "produccion";

const PESTANAS: { valor: Vista; etiqueta: string }[] = [
  { valor: "estudios", etiqueta: "Estudios" },
  { valor: "idiomas", etiqueta: "Idiomas" },
  { valor: "experiencias", etiqueta: "Experiencias" },
  { valor: "produccion", etiqueta: "Producción Académica" },
];

/**
 * Los cuatro soportes documentales de un docente en una sola pieza.
 *
 * Vive aparte porque son dos las pantallas que necesitan enseñar lo mismo: el listado de docentes
 * y el expediente de escalafón. Quien evalúa un ascenso decide mirando estos documentos, así que
 * duplicar las pestañas sería duplicar también cualquier arreglo que se les haga después.
 */
const PestanasDocumentosDocente = ({
  idDocente,
  onEstadoDocumentoCambiado,
}: {
  idDocente: string;
  /** Se propaga tal cual a las pestañas que avalan documentos. */
  onEstadoDocumentoCambiado?: () => void;
}) => {
  const [vistaActiva, setVistaActiva] = useState<Vista>("estudios");

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-gray-200 bg-white px-4 sm:px-6">
        <nav className="flex gap-1 overflow-x-auto sm:gap-2">
          {PESTANAS.map((pestana) => (
            <button
              key={pestana.valor}
              type="button"
              onClick={() => setVistaActiva(pestana.valor)}
              className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4 sm:py-4 sm:text-base ${
                vistaActiva === pestana.valor
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {pestana.etiqueta}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {vistaActiva === "estudios" && (
          <VerEstudios
            idDocente={idDocente}
            onEstadoDocumentoCambiado={onEstadoDocumentoCambiado}
          />
        )}
        {vistaActiva === "idiomas" && (
          <VerIdiomaDocente
            idDocente={idDocente}
            onEstadoDocumentoCambiado={onEstadoDocumentoCambiado}
          />
        )}
        {vistaActiva === "experiencias" && (
          <VerExperiencia
            idDocente={idDocente}
            onEstadoDocumentoCambiado={onEstadoDocumentoCambiado}
          />
        )}
        {/* Producción no lleva el aviso: su aval pasó al rol Evaluador de Producción y aquí
            solo se consulta, así que nada de esta pestaña mueve la evaluación. */}
        {vistaActiva === "produccion" && <VerProduccionAcademica idDocente={idDocente} />}
      </div>
    </div>
  );
};

export default PestanasDocumentosDocente;
