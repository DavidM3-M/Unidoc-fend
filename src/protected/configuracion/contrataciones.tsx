import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { ButtonRegresar } from "../../componentes/formularios/ButtonRegresar";

const Contrataciones = () => {
  const [datosContrato, setDatosContrato] = useState<{
    tipo_contrato: string;
    area: string;
    fecha_inicio: string;
    fecha_fin: string;
    valor_contrato: string;
    observaciones: string | null;
  } | null>(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDatosContrato = async () => {
    try {
      setCargando(true);
      setError(null);

      const token = Cookies.get("token");
      const url = `${import.meta.env.VITE_API_URL}/docente/ver-contratacion`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Respuesta completa de la API:", response.data);

      // Verifica si la respuesta contiene el array 'contrataciones'
      if (!response.data || !response.data.contrataciones || response.data.contrataciones.length === 0) {
        throw new Error("La respuesta no contiene los datos esperados.");
      }

      // Accede al primer elemento del array 'contrataciones'
      const contratoData = response.data.contrataciones[0];

      const contrato = {
        tipo_contrato: contratoData.tipo_contrato || "No especificado",
        area: contratoData.area || "No especificado",
        fecha_inicio: contratoData.fecha_inicio || "No especificada",
        fecha_fin: contratoData.fecha_fin || "No especificada",
        valor_contrato: contratoData.valor_contrato?.toString() || "No especificado",
        observaciones: contratoData.observaciones || "Sin observaciones",
      };

      setDatosContrato(contrato);
      console.log("Estado actualizado:", contrato);
      toast.success("Datos cargados correctamente");
    } catch (err) {
      console.error("Error al obtener los datos del contrato:", err);
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Error al obtener los datos del contrato"
          : "Error desconocido"
      );
      toast.error("Error al cargar los datos del contrato");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchDatosContrato();
  }, []);

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e3a5f] mb-4"></div>
        <p className="text-gray-600">Cargando datos del contrato...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <p className="text-red-500 text-center mb-4">{error}</p>
        <button
          onClick={fetchDatosContrato}
          className="flex items-center gap-2 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152943] transition-colors shadow-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-[600px] p-4">
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8">
        <div className="flex items-center mb-8">
          <Link to="/index" className="mr-4">
            <ButtonRegresar />
          </Link>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Mi Contrato</h1>
        </div>

        {datosContrato ? (
          <table className="w-full border-collapse">
            <tbody>
              <tr className="h-16">
                <td className="text-base font-semibold text-gray-700 py-2">
                  Tipo de Contrato:
                </td>
                <td>
                  <div className="bg-gray-50 border border-gray-200 text-[#1e3a5f] px-4 py-2 rounded-lg text-center font-medium shadow-sm">
                    {datosContrato?.tipo_contrato || "No especificado"}
                  </div>
                </td>
              </tr>
              <tr className="h-16">
                <td className="text-base font-semibold text-gray-700 py-2">
                  Área:
                </td>
                <td>
                  <div className="bg-gray-50 border border-gray-200 text-[#1e3a5f] px-4 py-2 rounded-lg text-center font-medium shadow-sm">
                    {datosContrato.area}
                  </div>
                </td>
              </tr>
              <tr className="h-16">
                <td className="text-base font-semibold text-gray-700 py-2">
                  Fecha de Inicio:
                </td>
                <td>
                  <div className="bg-gray-50 border border-gray-200 text-[#1e3a5f] px-4 py-2 rounded-lg text-center font-medium shadow-sm">
                    {datosContrato.fecha_inicio}
                  </div>
                </td>
              </tr>
              <tr className="h-16">
                <td className="text-base font-semibold text-gray-700 py-2">
                  Fecha de Fin:
                </td>
                <td>
                  <div className="bg-gray-50 border border-gray-200 text-[#1e3a5f] px-4 py-2 rounded-lg text-center font-medium shadow-sm">
                    {datosContrato.fecha_fin}
                  </div>
                </td>
              </tr>
              <tr className="h-16">
                <td className="text-base font-semibold text-gray-700 py-2">
                  Valor del Contrato:
                </td>
                <td>
                  <div className="bg-gray-50 border border-gray-200 text-[#1e3a5f] px-4 py-2 rounded-lg text-center font-medium shadow-sm">
                    {datosContrato.valor_contrato}
                  </div>
                </td>
              </tr>
              <tr className="h-16">
                <td className="text-base font-semibold text-gray-700 py-2 align-top pt-4">
                  Observaciones:
                </td>
                <td className="pt-2">
                  <div className="bg-gray-50 border border-gray-200 text-[#1e3a5f] px-4 py-2 rounded-lg text-center font-medium shadow-sm min-h-[40px]">
                    {datosContrato.observaciones}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className="text-center text-red-500">
            No se encontraron datos del contrato
          </div>
        )}
      </div>
    </div>
  );
};

export default Contrataciones;