/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getTiposExperiencia, TipoExperiencia } from "../../../services/talentoHumano/constantesService";
import { InputLabel } from "../../formularios/InputLabel";
import InputErrors from "../../formularios/InputErrors";
import TextInput from "../../formularios/TextInput";

interface RequisitosExperienciaProps {
  value?: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
  error?: any;
}

const RequisitosExperiencia = ({ value = {}, onChange, error }: RequisitosExperienciaProps) => {
  const [tiposExperiencia, setTiposExperiencia] = useState<TipoExperiencia[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<string>("");
  const [anos, setAnos] = useState<string>("");

  useEffect(() => {
    const fetchTiposExperiencia = async () => {
      const tipos = await getTiposExperiencia();
      setTiposExperiencia(tipos);
    };
    fetchTiposExperiencia();
  }, []);

  const handleAddRequisito = () => {
    if (!selectedTipo || !anos) return;

    const anosNum = parseInt(anos);
    if (isNaN(anosNum) || anosNum < 0 || anosNum > 50) return;

    const newValue = { ...value, [selectedTipo]: anosNum };
    onChange(newValue);
    setSelectedTipo("");
    setAnos("");
  };

  const handleRemoveRequisito = (tipo: string) => {
    const newValue = { ...value };
    delete newValue[tipo];
    onChange(newValue);
  };

  return (
    <div>
      <InputLabel htmlFor="requisitos_experiencia" value="Requisitos de experiencia" />

      {/* Lista de requisitos actuales */}
      {Object.entries(value).length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <h5 className="font-medium text-gray-700 mb-2">Requisitos configurados:</h5>
          <ul className="space-y-1">
            {Object.entries(value).map(([tipo, anosReq]) => (
              <li key={tipo} className="flex justify-between items-center text-sm">
                <span>{tipo}: {anosReq} años</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRequisito(tipo)}
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
          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar tipo</option>
            {tiposExperiencia.map((tipo) => (
              <option key={tipo.id} value={tipo.nombre}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <TextInput
            type="number"
            placeholder="Años requeridos"
            value={anos}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnos(e.target.value)}
            min="0"
            max="50"
          />
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

      <InputErrors errors={{}} name="requisitos_experiencia" />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default RequisitosExperiencia;