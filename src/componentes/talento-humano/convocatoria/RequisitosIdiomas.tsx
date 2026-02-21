/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { NivelIdioma } from "../../../services/talentoHumano/constantesService";
import { InputLabel } from "../../formularios/InputLabel";
import InputErrors from "../../formularios/InputErrors";

interface RequisitosIdiomasProps {
  value?: Record<string, "A1" | "A2" | "B1" | "B2" | "C1" | "C2">;
  onChange: (value: Record<string, "A1" | "A2" | "B1" | "B2" | "C1" | "C2">) => void;
  error?: any;
}

const RequisitosIdiomas = ({ value = {}, onChange, error }: RequisitosIdiomasProps) => {
  const [nivelesIdioma] = useState<NivelIdioma[]>([
    { id: "A1", nombre: "A1 - Principiante" },
    { id: "A2", nombre: "A2 - Elemental" },
    { id: "B1", nombre: "B1 - Intermedio" },
    { id: "B2", nombre: "B2 - Intermedio alto" },
    { id: "C1", nombre: "C1 - Avanzado" },
    { id: "C2", nombre: "C2 - Maestría" },
  ]);
  const [selectedIdioma, setSelectedIdioma] = useState<string>("");
  const [selectedNivel, setSelectedNivel] = useState<string>("");

  const handleAddRequisito = () => {
    if (!selectedIdioma || !selectedNivel) return;

    const newValue = { ...value, [selectedIdioma]: selectedNivel as "A1" | "A2" | "B1" | "B2" | "C1" | "C2" };
    onChange(newValue);
    setSelectedIdioma("");
    setSelectedNivel("");
  };

  const handleRemoveRequisito = (idioma: string) => {
    const newValue = { ...value };
    delete newValue[idioma];
    onChange(newValue);
  };

  return (
    <div>
      <InputLabel htmlFor="requisitos_idiomas" value="Requisitos de idiomas" />

      {/* Lista de requisitos actuales */}
      {Object.entries(value).length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <h5 className="font-medium text-gray-700 mb-2">Requisitos configurados:</h5>
          <ul className="space-y-1">
            {Object.entries(value).map(([idioma, nivel]) => (
              <li key={idioma} className="flex justify-between items-center text-sm">
                <span>{idioma}: Nivel {nivel}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRequisito(idioma)}
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Formulario para agregar nuevo requisito */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div>
          <input
            type="text"
            placeholder="Idioma (ej: Inglés, Francés)"
            value={selectedIdioma}
            onChange={(e) => setSelectedIdioma(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={selectedNivel}
            onChange={(e) => setSelectedNivel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar nivel</option>
            {nivelesIdioma.map((nivel) => (
              <option key={nivel.id} value={nivel.id}>
                {nivel.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <button
            type="button"
            onClick={handleAddRequisito}
            className="w-full font-semibold py-3 px-6 md:px-16 rounded-xl transition-all duration-200 text-base shadow-lg hover:shadow-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
          >
            Agregar
          </button>
        </div>
      </div>

      <InputErrors errors={{}} name="requisitos_idiomas" />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default RequisitosIdiomas;