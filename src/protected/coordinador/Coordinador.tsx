import React, { useState } from "react";
import { Link } from "react-router-dom";
import InputSearch from "../../componentes/formularios/InputSearch";

const Coordinador = () => {
  return (
    <div className="flex flex-col gap-6 min-h-screen w-full max-w-5xl mx-auto bg-white rounded-3xl p-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Panel de Coordinador</h1>
        <p className="text-gray-500 mt-2">
          Gestiona evaluaciones y plantillas desde este panel.
        </p>
      </div>

      {/* Controles compactos (estilo Talento Humano) */}
      <FilterBarCoordinador />

      <div className="grid grid-cols-1 gap-4">
        <Link
          to="/coordinador/aspirantes"
          className="rounded-2xl border p-6 hover:shadow-md transition-shadow bg-indigo-50"
        >
          <h2 className="text-lg font-semibold text-indigo-700">Aspirantes TH</h2>
          <p className="text-sm text-gray-600 mt-2">
            Ver aspirantes aprobados por Talento Humano y su convocatoria.
          </p>
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
    <div className="w-full mb-3">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label className="text-sm font-semibold text-gray-700">Convocatoria</label>
          <select
            value={selectedConvocatoriaId ?? ""}
            onChange={(e) => setSelectedConvocatoriaId(e.target.value ? Number(e.target.value) : null)}
            className="w-full mt-1 p-2 border rounded-lg bg-white"
          >
            <option value="">Todas</option>
            {convocatorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre} {c.count ? `(${c.count})` : null}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="text-sm font-semibold text-gray-700">Buscar</label>
          <InputSearch
            type="text"
            placeholder="Nombre del postulante..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="w-full mt-1"
          />
        </div>

        <div className="flex items-end gap-3">
          <div>
            <label className="text-sm font-semibold text-gray-700">Desde</label>
            <input type="date" className="mt-1 p-2 border rounded-lg" value={dateFrom ?? ""} onChange={(e) => setDateFrom(e.target.value || null)} />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700">Hasta</label>
            <input type="date" className="mt-1 p-2 border rounded-lg" value={dateTo ?? ""} onChange={(e) => setDateTo(e.target.value || null)} />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => { /* export functionality can be wired later */ }}
              className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm"
              title="Exportar resultados filtrados"
            >
              Exportar
            </button>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc')}
              className="px-3 py-2 rounded-lg bg-gray-100 text-sm text-gray-800"
              title="Ordenar por fecha (clic alterna asc/desc/ninguno)"
            >
              {sortOrder === 'asc' ? 'Fecha ↑' : sortOrder === 'desc' ? 'Fecha ↓' : 'Ordenar Fecha'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coordinador;
