import { useState } from "react";
import { Link } from "react-router-dom";
import InputSearch from "../../componentes/formularios/InputSearch";
import { ClipboardCheck, Users, ArrowRight, Filter, Search, Calendar } from "lucide-react";

const Coordinador = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/30 via-white to-indigo-50/10 p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl shadow-lg">
                <ClipboardCheck className="h-7 w-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-indigo-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-900 bg-clip-text text-transparent">
                Panel de Coordinador
              </h1>
              <p className="text-gray-500 mt-1">Gestiona evaluaciones y aspirantes desde este panel</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-indigo-500" />
            <h2 className="text-base font-semibold text-gray-700">Filtros</h2>
          </div>
          <FilterBarCoordinador />
        </div>

        {/* Tarjetas de navegación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/coordinador/aspirantes">
            <div className="group bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:shadow-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:-translate-y-1 p-6 flex flex-col gap-5 h-full cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="p-4 rounded-xl shadow-md bg-gradient-to-br from-indigo-500 to-indigo-700">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                  Gestión
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">Aspirantes TH</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Ver aspirantes aprobados por Talento Humano y su convocatoria.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 group-hover:gap-3 transition-all">
                <span>Ir a aspirantes</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
};

const FilterBarCoordinador = () => {
  const [selectedConvocatoriaId, setSelectedConvocatoriaId] = useState<number | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  const convocatorias: { id: number; nombre: string; count?: number }[] = [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
          Convocatoria
        </label>
        <select
          value={selectedConvocatoriaId ?? ""}
          onChange={(e) => setSelectedConvocatoriaId(e.target.value ? Number(e.target.value) : null)}
          className="w-full p-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition"
        >
          <option value="">Todas las convocatorias</option>
          {convocatorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre} {c.count ? `(${c.count})` : null}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
          <Search className="inline h-3.5 w-3.5 mr-1" />
          Buscar postulante
        </label>
        <InputSearch
          type="text"
          placeholder="Nombre del postulante..."
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="w-full"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
          <Calendar className="inline h-3.5 w-3.5 mr-1" />
          Desde
        </label>
        <input
          type="date"
          className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition"
          value={dateFrom ?? ""}
          onChange={(e) => setDateFrom(e.target.value || null)}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
          <Calendar className="inline h-3.5 w-3.5 mr-1" />
          Hasta
        </label>
        <input
          type="date"
          className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition"
          value={dateTo ?? ""}
          onChange={(e) => setDateTo(e.target.value || null)}
        />
      </div>

      <div className="sm:col-span-2 lg:col-span-4 flex gap-2 justify-end pt-1">
        <button
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc')}
          className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 font-medium transition"
        >
          {sortOrder === 'asc' ? 'Fecha ↑' : sortOrder === 'desc' ? 'Fecha ↓' : 'Ordenar por fecha'}
        </button>
        <button
          onClick={() => { /* export functionality can be wired later */ }}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
        >
          Exportar
        </button>
      </div>
    </div>
  );
};

export default Coordinador;
