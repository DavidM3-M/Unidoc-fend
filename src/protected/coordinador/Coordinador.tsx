import { useState } from "react";
import { Link } from "react-router-dom";
import InputSearch from "../../componentes/formularios/InputSearch";
import { Users, Filter, Search, Calendar, Settings } from "lucide-react";

const Coordinador = () => {
  return (
    <div className="flex flex-col bg-[#f3ede1] min-h-screen w-full p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* Header (Igualado a Admin) */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1e3a5f] mb-2 tracking-tight">
          Panel de Coordinador
        </h1>
        <p className="text-sm sm:text-base text-[#6b7a8d] font-medium">
          Gestiona evaluaciones y aspirantes desde este panel
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-[#ffffff] border border-[rgba(30,58,95,0.09)] rounded-xl p-4 sm:p-6 shadow-md mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-[#e8740e]" />
          <h2 className="text-lg font-bold text-[#1e3a5f]">Filtros de Búsqueda</h2>
        </div>
        <FilterBarCoordinador />
      </div>

      {/* Tarjetas de navegación (Igualado a Admin) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Link to="/coordinador/aspirantes" className="group h-full">
          <div className="bg-[#ffffff] border border-[rgba(30,58,95,0.09)] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="bg-[#f3ede1] rounded-lg p-3">
                <Users className="text-[#1e3a5f]" size={28} />
              </div>
              <Settings className="text-[#6b7a8d] group-hover:animate-spin-slow" size={20} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-2">
              Aspirantes TH
            </h2>
            <p className="text-[#6b7a8d] text-xs sm:text-sm flex-grow leading-relaxed">
              Ver aspirantes aprobados por Talento Humano y su convocatoria.
            </p>
            <div className="mt-4 text-[#e8740e] font-bold flex items-center gap-2 text-sm group-hover:text-[#c2600b]">
              Ir a aspirantes →
            </div>
          </div>
        </Link>
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
        <label className="text-xs font-bold text-[#6b7a8d] uppercase tracking-wider mb-2 block">
          Convocatoria
        </label>
        <select
          value={selectedConvocatoriaId ?? ""}
          onChange={(e) => setSelectedConvocatoriaId(e.target.value ? Number(e.target.value) : null)}
          className="w-full p-2.5 border border-[rgba(30,58,95,0.2)] rounded-lg bg-white text-sm text-[#2c3e50] focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent outline-none transition"
        >
          <option value="">Todas las convocatorias</option>
          {convocatorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} {c.count ? `(${c.count})` : null}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-bold text-[#6b7a8d] uppercase tracking-wider mb-2 flex items-center">
          <Search className="h-3.5 w-3.5 mr-1" />
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
        <label className="text-xs font-bold text-[#6b7a8d] uppercase tracking-wider mb-2 flex items-center">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          Desde
        </label>
        <input
          type="date"
          className="w-full p-2.5 border border-[rgba(30,58,95,0.2)] rounded-lg bg-white text-sm text-[#2c3e50] focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent outline-none transition"
          value={dateFrom ?? ""}
          onChange={(e) => setDateFrom(e.target.value || null)}
        />
      </div>

      <div>
        <label className="text-xs font-bold text-[#6b7a8d] uppercase tracking-wider mb-2 flex items-center">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          Hasta
        </label>
        <input
          type="date"
          className="w-full p-2.5 border border-[rgba(30,58,95,0.2)] rounded-lg bg-white text-sm text-[#2c3e50] focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent outline-none transition"
          value={dateTo ?? ""}
          onChange={(e) => setDateTo(e.target.value || null)}
        />
      </div>

      <div className="sm:col-span-2 lg:col-span-4 flex gap-3 justify-end pt-2">
        <button
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc')}
          className="px-4 py-2 rounded-lg bg-[#f3ede1] hover:bg-[#e2dacb] text-sm text-[#1e3a5f] font-semibold transition-colors duration-200"
        >
          {sortOrder === 'asc' ? 'Fecha ↑' : sortOrder === 'desc' ? 'Fecha ↓' : 'Ordenar por fecha'}
        </button>
        <button
          onClick={() => { /* export functionality */ }}
          className="px-4 py-2 rounded-lg bg-[#1e3a5f] hover:bg-[#2c3e50] text-white text-sm font-semibold transition-colors duration-200 shadow-sm"
        >
          Exportar
        </button>
      </div>
    </div>
  );
};

export default Coordinador;