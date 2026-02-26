/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getTiposRequisitosAdicionales, TipoRequisitoAdicional } from "../../../services/talentoHumano/constantesService";
import { InputLabel } from "../../formularios/InputLabel";
import InputErrors from "../../formularios/InputErrors";
import TextInput from "../../formularios/TextInput";

interface RequisitosAdicionalesProps {
  value?: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  error?: any;
}

const RequisitosAdicionales = ({ value = {}, onChange, error }: RequisitosAdicionalesProps) => {
  const [tiposRequisitos, setTiposRequisitos] = useState<TipoRequisitoAdicional[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<string>("");
  const [valor, setValor] = useState<string>("");

  useEffect(() => {
    const fetchTiposRequisitos = async () => {
      try {
        const tipos = await getTiposRequisitosAdicionales();
        setTiposRequisitos(Array.isArray(tipos) ? tipos : []);
      } catch (err) {
        console.error('Error al obtener tipos de requisitos adicionales:', err);
        setTiposRequisitos([]);
      }
    };
    fetchTiposRequisitos();
  }, []);

  const handleAddRequisito = () => {
    if (!selectedTipo || !valor) return;

    let parsedValue: any = valor;

    // Intentar parsear como número o JSON
    if (!isNaN(Number(valor))) {
      parsedValue = Number(valor);
    } else {
      try {
        parsedValue = JSON.parse(valor);
      } catch {
        // Mantener como string si no es JSON válido
      }
    }

    const newValue = { ...value, [selectedTipo]: parsedValue };
    onChange(newValue);
    setSelectedTipo("");
    setValor("");
  };

  const handleRemoveRequisito = (tipo: string) => {
    const newValue = { ...value };
    delete newValue[tipo];
    onChange(newValue);
  };

  const formatValue = (val: any): string => {
    if (typeof val === 'object') {
      return JSON.stringify(val);
    }
    return String(val);
  };

  return (
    <div>
      <InputLabel htmlFor="requisitos_adicionales" value="Requisitos adicionales" />

      {/* Lista de requisitos actuales */}
      {Object.entries(value).length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <h5 className="font-medium text-gray-700 mb-2">Requisitos configurados:</h5>
          <ul className="space-y-1">
            {Object.entries(value).map(([tipo, val]) => (
              <li key={tipo} className="flex justify-between items-center text-sm">
                <span>{tipo}: {formatValue(val)}</span>
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
            {tiposRequisitos.map((tipo) => (
              <option key={tipo.id} value={tipo.nombre}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <TextInput
            placeholder="Valor (número, texto o JSON)"
            value={valor}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValor(e.target.value)}
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

      <p className="text-sm text-gray-600 mb-2">
        Para valores complejos, use formato JSON. Ejemplos: 10, "requerido", ["PhD", "Maestría"], {`{"mínimo": 5}`}
      </p>

      <InputErrors errors={{}} name="requisitos_adicionales" />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default RequisitosAdicionales;