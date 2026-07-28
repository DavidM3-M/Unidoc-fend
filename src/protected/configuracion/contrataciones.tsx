import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { ButtonRegresar } from "../../componentes/formularios/ButtonRegresar";
import {
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  MapPin,
  Clock,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Contrato {
  id_contratacion: number;
  tipo_proceso?: string;
  tipo_contrato: string;
  area: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number | string;
  observaciones?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatearFecha = (fecha: string): string => {
  if (!fecha) return "No especificada";
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
};

const formatearValor = (valor: number | string): string => {
  const num = typeof valor === "string" ? parseFloat(valor) : valor;
  if (isNaN(num)) return "No especificado";
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(num);
};

// Determina si un contrato sigue vigente según su fecha_fin
const estaVigente = (fechaFin: string): boolean => {
  if (!fechaFin) return false;
  const fin = new Date(fechaFin);
  if (isNaN(fin.getTime())) return false;
  return fin.getTime() >= new Date().setHours(0, 0, 0, 0);
};

const labelProceso = (tipoProceso?: string): string => {
  const map: Record<string, string> = {
    Contratacion: "Contratación",
    Ascenso: "Ascenso",
    CambioCargo: "Cambio de cargo",
  };
  return tipoProceso ? (map[tipoProceso] ?? tipoProceso) : "Contratación";
};

// ─── Tarjeta individual de contrato ──────────────────────────────────────────

const TarjetaContrato = ({ contrato }: { contrato: Contrato }) => {
  const vigente = estaVigente(contrato.fecha_fin);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Encabezado de la tarjeta */}
      <div
        className={`px-5 py-4 flex items-center justify-between ${
          vigente ? "bg-gradient-to-r from-blue-600 to-blue-700" : "bg-gradient-to-r from-gray-500 to-gray-600"
        } text-white`}
      >
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          <span className="font-semibold">{labelProceso(contrato.tipo_proceso)}</span>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20 text-white">
          {vigente ? "Vigente" : "Finalizado"}
        </span>
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <FileText className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Tipo de contrato</p>
            <p className="text-sm font-medium text-gray-900">{contrato.tipo_contrato || "No especificado"}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <MapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Área</p>
            <p className="text-sm font-medium text-gray-900">{contrato.area || "No especificada"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Inicio</p>
              <p className="text-sm font-medium text-gray-900">{formatearFecha(contrato.fecha_inicio)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Fin</p>
              <p className="text-sm font-medium text-gray-900">{formatearFecha(contrato.fecha_fin)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <DollarSign className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Valor del contrato</p>
            <p className="text-sm font-semibold text-green-700">{formatearValor(contrato.valor_contrato)}</p>
          </div>
        </div>

        {contrato.observaciones && (
          <div className="bg-gray-50 rounded-lg p-3 mt-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Observaciones</p>
            <p className="text-sm text-gray-700">{contrato.observaciones}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────

const Contrataciones = () => {
  const [contratos, setContratos] = useState<Contrato[]>([]);
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

      const lista: Contrato[] = response.data?.contrataciones ?? [];

      if (lista.length === 0) {
        throw new Error("No se encontraron contrataciones registradas.");
      }

      // El backend ya las ordena por fecha_inicio descendente (más reciente primero),
      // pero lo reforzamos aquí por si el orden cambia en el futuro.
      const ordenados = [...lista].sort(
        (a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime()
      );

      setContratos(ordenados);
      toast.success("Datos cargados correctamente");
    } catch (err) {
      console.error("Error al obtener los datos del contrato:", err);
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Error al obtener los datos del contrato"
          : err instanceof Error
          ? err.message
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
<<<<<<< HEAD
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      <div className="w-full mb-6 flex items-center">
        <Link to="/index" className="mr-4">
          <ButtonRegresar />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis Contrataciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            {contratos.length} {contratos.length === 1 ? "contrato registrado" : "contratos registrados"}
          </p>
=======
    <div className="flex flex-col items-center justify-center w-[600px] p-4">
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8">
        <div className="flex items-center mb-8">
          <Link to="/index" className="mr-4">
            <ButtonRegresar />
          </Link>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Mi Contrato</h1>
>>>>>>> ea778b08eafd2c0726d139a931c9a359fd85fb3a
        </div>
      </div>

<<<<<<< HEAD
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
        {contratos.map((contrato) => (
          <TarjetaContrato key={contrato.id_contratacion} contrato={contrato} />
        ))}
=======
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
>>>>>>> ea778b08eafd2c0726d139a931c9a359fd85fb3a
      </div>
    </div>
  );
};

export default Contrataciones;