import React, { useState } from 'react';
import { ArrowLeft, Search, Eye, FileText, Download } from 'lucide-react';

// Datos de ejemplo
const aspirantesData = [
  {
    id: 1,
    convocatoria: 'Docente Tiempo Completo - Ingeniería',
    identificacion: '1120066350',
    nombre: 'Juan Carlos Melo García',
    email: 'juan.melo@example.com',
    telefono: '3101234567',
    fechaPostulacion: '2024-11-15',
    estado: 'Pendiente para revisar',
    rol: 'Vicerrectoría'
  },
  {
    id: 2,
    convocatoria: 'Docente Cátedra - Matemáticas',
    identificacion: '52345678',
    nombre: 'María Fernanda López',
    email: 'maria.lopez@example.com',
    telefono: '3209876543',
    fechaPostulacion: '2024-11-18',
    estado: 'Pendiente para revisar',
    rol: 'Coordinación'
  },
  {
    id: 3,
    convocatoria: 'Docente Medio Tiempo - Física',
    identificacion: '80123456',
    nombre: 'Pedro Alejandro Rojas',
    email: 'pedro.rojas@example.com',
    telefono: '3156789012',
    fechaPostulacion: '2024-11-20',
    estado: 'Pendiente para revisar',
    rol: 'Vicerrectoría'
  },
  {
    id: 4,
    convocatoria: 'Docente Tiempo Completo - Sistemas',
    identificacion: '1098765432',
    nombre: 'Ana Sofía Ramírez Torres',
    email: 'ana.ramirez@example.com',
    telefono: '3187654321',
    fechaPostulacion: '2024-11-21',
    estado: 'Pendiente para revisar',
    rol: 'Coordinación'
  }
];

const AspirantesList = () => {
  const [selectedAspirante, setSelectedAspirante] = useState<typeof aspirantesData[number] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    convocatoria: '',
    identificacion: '',
    nombre: '',
    estado: '',
    rol: ''
  });

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const filteredAspirantes = aspirantesData.filter(asp => {
    const matchesSearch = 
      asp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asp.identificacion.includes(searchTerm) ||
      asp.convocatoria.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilters = 
      (filters.convocatoria === '' || asp.convocatoria.toLowerCase().includes(filters.convocatoria.toLowerCase())) &&
      (filters.identificacion === '' || asp.identificacion.includes(filters.identificacion)) &&
      (filters.nombre === '' || asp.nombre.toLowerCase().includes(filters.nombre.toLowerCase())) &&
      (filters.estado === '' || asp.estado.toLowerCase().includes(filters.estado.toLowerCase())) &&
      (filters.rol === '' || asp.rol.toLowerCase().includes(filters.rol.toLowerCase()));

    return matchesSearch && matchesFilters;
  });

  if (selectedAspirante) {
    return <DetalleAspirante aspirante={selectedAspirante} onBack={() => setSelectedAspirante(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">UniDoc</h1>
          <div className="flex gap-4">
            <a href="#" className="text-gray-600 hover:text-gray-800">Inicio</a>
            <a href="#" className="text-red-600 hover:text-red-700">Cerrar sesión</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Title with back button */}
          <div className="flex items-center gap-3 mb-6">
            <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-3xl font-bold text-gray-800">Aspirantes a Convocatorias</h2>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filters Table Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-lg overflow-hidden">
            <div className="grid grid-cols-6 gap-4 p-4 text-white font-semibold">
              <div>
                <label className="block mb-2 text-sm">CONVOCATORIA</label>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={filters.convocatoria}
                  onChange={(e) => handleFilterChange('convocatoria', e.target.value)}
                  className="w-full px-3 py-2 rounded border-none text-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm">IDENTIFICACIÓN</label>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={filters.identificacion}
                  onChange={(e) => handleFilterChange('identificacion', e.target.value)}
                  className="w-full px-3 py-2 rounded border-none text-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm">NOMBRE</label>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={filters.nombre}
                  onChange={(e) => handleFilterChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 rounded border-none text-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm">ESTADO</label>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={filters.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  className="w-full px-3 py-2 rounded border-none text-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm">ROL</label>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={filters.rol}
                  onChange={(e) => handleFilterChange('rol', e.target.value)}
                  className="w-full px-3 py-2 rounded border-none text-gray-800 text-sm"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm">ACCIONES</label>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="border border-gray-200 rounded-b-lg">
            {filteredAspirantes.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No se encontraron aspirantes
              </div>
            ) : (
              filteredAspirantes.map((aspirante, index) => (
                <div
                  key={aspirante.id}
                  className={`grid grid-cols-6 gap-4 p-4 items-center ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50 transition-colors`}
                >
                  <div className="text-sm text-gray-700">{aspirante.convocatoria}</div>
                  <div className="text-sm text-gray-700">{aspirante.identificacion}</div>
                  <div className="text-sm text-gray-700">{aspirante.nombre}</div>
                  <div>
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-orange-700 bg-orange-100 rounded-full">
                      {aspirante.estado}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">{aspirante.rol}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedAspirante(aspirante)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm flex items-center gap-1"
                    >
                      <Eye size={16} />
                      Ver Detalle
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredAspirantes.length} de {aspirantesData.length} aspirantes
          </div>
        </div>
      </div>
    </div>
  );
};

const DetalleAspirante = ({ aspirante, onBack }: { aspirante: typeof aspirantesData[number]; onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState('informacion');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">UniDoc</h1>
          <div className="flex gap-4">
            <a href="#" className="text-gray-600 hover:text-gray-800">Inicio</a>
            <a href="#" className="text-red-600 hover:text-red-700">Cerrar sesión</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Title with back button */}
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={onBack}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-3xl font-bold text-gray-800">Detalle del Aspirante</h2>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 text-sm font-semibold text-orange-700 bg-orange-100 rounded-full">
              Estado: {aspirante.estado}
            </span>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-6">
              <button
                onClick={() => setActiveTab('informacion')}
                className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'informacion'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Información Personal
              </button>
              <button
                onClick={() => setActiveTab('documentos')}
                className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'documentos'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Documentos
              </button>
              <button
                onClick={() => setActiveTab('historial')}
                className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'historial'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Historial
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'informacion' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nombre Completo
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{aspirante.nombre}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Identificación
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{aspirante.identificacion}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{aspirante.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{aspirante.telefono}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Convocatoria
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{aspirante.convocatoria}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Fecha de Postulación
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{aspirante.fechaPostulacion}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Rol Asignado
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{aspirante.rol}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Estado Actual
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded">{aspirante.estado}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documentos' && (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-600" size={24} />
                    <div>
                      <p className="font-semibold text-gray-900">Hoja de Vida</p>
                      <p className="text-sm text-gray-500">Subido el 15/11/2024</p>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                    <Download size={16} />
                    Descargar
                  </button>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-600" size={24} />
                    <div>
                      <p className="font-semibold text-gray-900">Cédula de Ciudadanía</p>
                      <p className="text-sm text-gray-500">Subido el 15/11/2024</p>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                    <Download size={16} />
                    Descargar
                  </button>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-600" size={24} />
                    <div>
                      <p className="font-semibold text-gray-900">Títulos Académicos</p>
                      <p className="text-sm text-gray-500">Subido el 15/11/2024</p>
                    </div>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                    <Download size={16} />
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'historial' && (
            <div className="space-y-4">
              <div className="border-l-4 border-blue-600 pl-4 py-2">
                <p className="font-semibold text-gray-900">Postulación recibida</p>
                <p className="text-sm text-gray-500">15/11/2024 - 10:30 AM</p>
                <p className="text-sm text-gray-600 mt-1">El aspirante completó su postulación a la convocatoria</p>
              </div>
              <div className="border-l-4 border-orange-600 pl-4 py-2">
                <p className="font-semibold text-gray-900">En revisión - {aspirante.rol}</p>
                <p className="text-sm text-gray-500">16/11/2024 - 09:15 AM</p>
                <p className="text-sm text-gray-600 mt-1">El caso fue asignado para revisión</p>
              </div>
              <div className="border-l-4 border-gray-300 pl-4 py-2">
                <p className="font-semibold text-gray-900">Pendiente para revisar</p>
                <p className="text-sm text-gray-500">Estado actual</p>
                <p className="text-sm text-gray-600 mt-1">Esperando revisión y aprobación</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-end">
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Rechazar
            </button>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
              Aprobar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AspirantesList;