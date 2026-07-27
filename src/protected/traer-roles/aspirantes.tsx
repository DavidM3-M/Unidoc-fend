import { useState } from 'react';
import { ArrowLeft, Search, Eye, FileText, Download } from 'lucide-react';
//cree este diseño para la pagina de aspirantes a convocatorias (Brayan Cuellar)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1e3a5f]">UniDoc</h1>
          <div className="flex gap-4">
            <a href="#" className="text-gray-600 hover:text-[#1e3a5f] font-medium transition-colors">Inicio</a>
            <a href="#" className="text-red-600 hover:text-red-700 font-medium transition-colors">Cerrar sesión</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {/* Title with back button */}
          <div className="flex items-center gap-4 mb-8">
            <button className="bg-[#1e3a5f] text-white p-2.5 rounded-xl hover:bg-[#1e3a5f]/90 transition-colors shadow-sm">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-3xl font-bold text-[#1e3a5f]">Aspirantes a Convocatorias</h2>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
              />
            </div>
          </div>

          {/* Filters Table Header */}
          <div className="bg-[#1e3a5f] rounded-t-2xl overflow-hidden">
            <div className="grid grid-cols-6 gap-4 p-5 text-white font-semibold">
              <div>
                <label className="block mb-2 text-xs tracking-wider text-blue-100">CONVOCATORIA</label>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.convocatoria}
                  onChange={(e) => handleFilterChange('convocatoria', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-none text-gray-800 text-sm focus:ring-2 focus:ring-white/50"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs tracking-wider text-blue-100">IDENTIFICACIÓN</label>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.identificacion}
                  onChange={(e) => handleFilterChange('identificacion', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-none text-gray-800 text-sm focus:ring-2 focus:ring-white/50"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs tracking-wider text-blue-100">NOMBRE</label>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.nombre}
                  onChange={(e) => handleFilterChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-none text-gray-800 text-sm focus:ring-2 focus:ring-white/50"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs tracking-wider text-blue-100">ESTADO</label>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.estado}
                  onChange={(e) => handleFilterChange('estado', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-none text-gray-800 text-sm focus:ring-2 focus:ring-white/50"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs tracking-wider text-blue-100">ROL</label>
                <input
                  type="text"
                  placeholder="Filtrar..."
                  value={filters.rol}
                  onChange={(e) => handleFilterChange('rol', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-none text-gray-800 text-sm focus:ring-2 focus:ring-white/50"
                />
              </div>
              <div>
                <label className="block mb-2 text-xs tracking-wider text-blue-100">ACCIONES</label>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="border-x border-b border-gray-200 rounded-b-2xl overflow-hidden">
            {filteredAspirantes.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-medium">
                No se encontraron aspirantes
              </div>
            ) : (
              filteredAspirantes.map((aspirante, index) => (
                <div
                  key={aspirante.id}
                  className={`grid grid-cols-6 gap-4 p-5 items-center ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  } hover:bg-[#1e3a5f]/5 transition-colors border-b border-gray-100 last:border-0`}
                >
                  <div className="text-sm font-medium text-gray-700">{aspirante.convocatoria}</div>
                  <div className="text-sm text-gray-600">{aspirante.identificacion}</div>
                  <div className="text-sm font-medium text-gray-800">{aspirante.nombre}</div>
                  <div>
                    <span className="inline-block px-3 py-1 text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg">
                      {aspirante.estado}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{aspirante.rol}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedAspirante(aspirante)}
                      className="bg-[#1e3a5f] text-white px-4 py-2 rounded-xl hover:bg-[#1e3a5f]/90 transition-colors shadow-sm text-sm font-medium flex items-center gap-2"
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
          <div className="mt-6 text-sm font-medium text-gray-500">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1e3a5f]">UniDoc</h1>
          <div className="flex gap-4">
            <a href="#" className="text-gray-600 hover:text-[#1e3a5f] font-medium transition-colors">Inicio</a>
            <a href="#" className="text-red-600 hover:text-red-700 font-medium transition-colors">Cerrar sesión</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {/* Title with back button */}
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={onBack}
              className="bg-[#1e3a5f] text-white p-2.5 rounded-xl hover:bg-[#1e3a5f]/90 transition-colors shadow-sm"
            >
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-3xl font-bold text-[#1e3a5f]">Detalle del Aspirante</h2>
          </div>

          {/* Status Badge */}
          <div className="mb-8">
            <span className="inline-block px-4 py-2 text-sm font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg">
              Estado: {aspirante.estado}
            </span>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('informacion')}
                className={`pb-4 px-2 font-semibold text-sm border-b-2 transition-all ${
                  activeTab === 'informacion'
                    ? 'border-[#1e3a5f] text-[#1e3a5f]'
                    : 'border-transparent text-gray-500 hover:text-[#1e3a5f]/70'
                }`}
              >
                Información Personal
              </button>
              <button
                onClick={() => setActiveTab('documentos')}
                className={`pb-4 px-2 font-semibold text-sm border-b-2 transition-all ${
                  activeTab === 'documentos'
                    ? 'border-[#1e3a5f] text-[#1e3a5f]'
                    : 'border-transparent text-gray-500 hover:text-[#1e3a5f]/70'
                }`}
              >
                Documentos
              </button>
              <button
                onClick={() => setActiveTab('historial')}
                className={`pb-4 px-2 font-semibold text-sm border-b-2 transition-all ${
                  activeTab === 'historial'
                    ? 'border-[#1e3a5f] text-[#1e3a5f]'
                    : 'border-transparent text-gray-500 hover:text-[#1e3a5f]/70'
                }`}
              >
                Historial
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'informacion' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                    Nombre Completo
                  </label>
                  <p className="text-gray-900 bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-medium">{aspirante.nombre}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                    Identificación
                  </label>
                  <p className="text-gray-900 bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-medium">{aspirante.identificacion}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                    Email
                  </label>
                  <p className="text-gray-900 bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-medium">{aspirante.email}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                    Teléfono
                  </label>
                  <p className="text-gray-900 bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-medium">{aspirante.telefono}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                    Convocatoria
                  </label>
                  <p className="text-gray-900 bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-medium">{aspirante.convocatoria}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                    Fecha de Postulación
                  </label>
                  <p className="text-gray-900 bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-medium">{aspirante.fechaPostulacion}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                    Rol Asignado
                  </label>
                  <p className="text-gray-900 bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-medium">{aspirante.rol}</p>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">
                    Estado Actual
                  </label>
                  <p className="text-gray-900 bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-medium">{aspirante.estado}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documentos' && (
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-xl p-5 hover:border-[#1e3a5f]/30 hover:bg-[#1e3a5f]/5 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-white transition-colors border border-gray-100">
                      <FileText className="text-[#1e3a5f]" size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base">Hoja de Vida</p>
                      <p className="text-sm text-gray-500 mt-0.5">Subido el 15/11/2024</p>
                    </div>
                  </div>
                  <button className="bg-[#1e3a5f] text-white px-5 py-2.5 rounded-xl hover:bg-[#1e3a5f]/90 transition-colors shadow-sm flex items-center gap-2 font-medium">
                    <Download size={18} />
                    Descargar
                  </button>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-5 hover:border-[#1e3a5f]/30 hover:bg-[#1e3a5f]/5 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-white transition-colors border border-gray-100">
                      <FileText className="text-[#1e3a5f]" size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base">Cédula de Ciudadanía</p>
                      <p className="text-sm text-gray-500 mt-0.5">Subido el 15/11/2024</p>
                    </div>
                  </div>
                  <button className="bg-[#1e3a5f] text-white px-5 py-2.5 rounded-xl hover:bg-[#1e3a5f]/90 transition-colors shadow-sm flex items-center gap-2 font-medium">
                    <Download size={18} />
                    Descargar
                  </button>
                </div>
              </div>
              <div className="border border-gray-200 rounded-xl p-5 hover:border-[#1e3a5f]/30 hover:bg-[#1e3a5f]/5 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-50 rounded-xl group-hover:bg-white transition-colors border border-gray-100">
                      <FileText className="text-[#1e3a5f]" size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base">Títulos Académicos</p>
                      <p className="text-sm text-gray-500 mt-0.5">Subido el 15/11/2024</p>
                    </div>
                  </div>
                  <button className="bg-[#1e3a5f] text-white px-5 py-2.5 rounded-xl hover:bg-[#1e3a5f]/90 transition-colors shadow-sm flex items-center gap-2 font-medium">
                    <Download size={18} />
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'historial' && (
            <div className="space-y-6">
              <div className="border-l-4 border-[#1e3a5f] pl-5 py-2 relative">
                <div className="absolute w-3 h-3 bg-[#1e3a5f] rounded-full -left-[7.5px] top-4 shadow-sm border-2 border-white"></div>
                <p className="font-bold text-gray-900 text-base">Postulación recibida</p>
                <p className="text-sm font-medium text-[#1e3a5f]/70 mt-1">15/11/2024 - 10:30 AM</p>
                <p className="text-sm text-gray-600 mt-2">El aspirante completó su postulación a la convocatoria</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-5 py-2 relative">
                <div className="absolute w-3 h-3 bg-orange-500 rounded-full -left-[7.5px] top-4 shadow-sm border-2 border-white"></div>
                <p className="font-bold text-gray-900 text-base">En revisión - {aspirante.rol}</p>
                <p className="text-sm font-medium text-orange-600/70 mt-1">16/11/2024 - 09:15 AM</p>
                <p className="text-sm text-gray-600 mt-2">El caso fue asignado para revisión</p>
              </div>
              <div className="border-l-4 border-gray-200 pl-5 py-2 relative">
                <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7.5px] top-4 shadow-sm border-2 border-white"></div>
                <p className="font-bold text-gray-900 text-base">Pendiente para revisar</p>
                <p className="text-sm font-medium text-gray-500 mt-1">Estado actual</p>
                <p className="text-sm text-gray-600 mt-2">Esperando revisión y aprobación</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-10 flex gap-4 justify-end pt-6 border-t border-gray-100">
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-bold transition-colors shadow-sm">
              Rechazar
            </button>
            <button className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold transition-colors shadow-sm">
              Aprobar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AspirantesList;