import { Link } from 'react-router-dom';
import { Users, Download, BarChart3, Settings, ChevronDown, ChevronUp, FileText, Library, Briefcase } from 'lucide-react';
import axiosInstance from "../../utils/axiosConfig";
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

interface Usuario {
  id: number;
  rol: string;
}

const Dashboard = () => {
  const [descargando, setDescargando] = useState(false);
  const [estadisticasAbiertas, setEstadisticasAbiertas] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtener usuarios para las estadísticas
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axiosInstance.get('/admin/listar-usuarios');
        setUsuarios(response.data.usuarios);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsuarios();
  }, []);

  // Calcular estadísticas por rol
  const estadisticasPorRol = usuarios.reduce((acc, user) => {
    acc[user.rol] = (acc[user.rol] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const fetchDatos = async () => {
    // blobUrl se declara fuera del try para poder liberarse en finally aunque falle el click/append
    let blobUrl: string | null = null;
    try {
      setDescargando(true);
      const response = await axiosInstance.get('/admin/usuarios/exportar-excel', {
        responseType: 'blob'
      });

      blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Usuarios descargados correctamente');
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      toast.error('Error al descargar usuarios');
    } finally {
      // Liberar el object URL siempre, incluso si ocurre un error durante la descarga
      if (blobUrl) window.URL.revokeObjectURL(blobUrl);
      setDescargando(false);
    }
  };
  
  return (
    <div className='flex flex-col bg-[#f3ede1] min-h-screen w-full p-4 sm:p-6 lg:p-8 font-sans'>
      {/* Header */}
      <div className='mb-6 sm:mb-8'>
        <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1e3a5f] mb-2 tracking-tight'>
          Panel de Administración
        </h1>
        <p className='text-sm sm:text-base text-[#6b7a8d] font-medium'>
          Bienvenido al sistema de gestión UniDoc
        </p>
      </div>

      {/* Cards de acceso rápido */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
        {/* Card Gestión de Usuarios */}
        <Link to="/usuarios" className='group h-full'>
          <div className='bg-[#ffffff] border border-[rgba(30,58,95,0.09)] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col'>
            <div className='flex items-center justify-between mb-3 sm:mb-4'>
              <div className='bg-[#f3ede1] rounded-lg p-3'>
                <Users className='text-[#1e3a5f]' size={28} />
              </div>
              <Settings className='text-[#6b7a8d] group-hover:animate-spin-slow' size={20} />
            </div>
            <h2 className='text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-2'>
              Gestión de Usuarios
            </h2>
            <p className='text-[#6b7a8d] text-xs sm:text-sm flex-grow leading-relaxed'>
              Administra usuarios y asigna roles en el sistema
            </p>
            <div className='mt-4 text-[#e8740e] font-bold flex items-center gap-2 text-sm group-hover:text-[#c2600b]'>
              Ver usuarios →
            </div>
          </div>
        </Link>

        {/* Card Normativas */}
        <Link to="/admin/normativas" className='group h-full'>
          <div className='bg-[#ffffff] border border-[rgba(30,58,95,0.09)] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col'>
            <div className='flex items-center justify-between mb-3 sm:mb-4'>
              <div className='bg-[#f3ede1] rounded-lg p-3'>
                <FileText className='text-[#1e3a5f]' size={28} />
              </div>
              <Settings className='text-[#6b7a8d] group-hover:animate-spin-slow' size={20} />
            </div>
            <h2 className='text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-2'>
              Normativas
            </h2>
            <p className='text-[#6b7a8d] text-xs sm:text-sm flex-grow leading-relaxed'>
              Crear y gestionar normativas públicas del sistema
            </p>
            <div className='mt-4 text-[#e8740e] font-bold flex items-center gap-2 text-sm group-hover:text-[#c2600b]'>
              Gestionar normativas →
            </div>
          </div>
        </Link>

        {/* Card Catálogo de producción académica */}
        <Link to="/admin/catalogos/produccion-academica" className='group h-full'>
          <div className='bg-[#ffffff] border border-[rgba(30,58,95,0.09)] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col'>
            <div className='flex items-center justify-between mb-3 sm:mb-4'>
              <div className='bg-[#f3ede1] rounded-lg p-3'>
                <Library className='text-[#1e3a5f]' size={28} />
              </div>
              <Settings className='text-[#6b7a8d] group-hover:animate-spin-slow' size={20} />
            </div>
            <h2 className='text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-2'>
              Producción académica
            </h2>
            <p className='text-[#6b7a8d] text-xs sm:text-sm flex-grow leading-relaxed'>
              Tipos de producto académico y sus ámbitos de divulgación
            </p>
            <div className='mt-4 text-[#e8740e] font-bold flex items-center gap-2 text-sm group-hover:text-[#c2600b]'>
              Gestionar catálogo →
            </div>
          </div>
        </Link>

        {/* Card Tipos de experiencia */}
        <Link to="/admin/catalogos/tipos-experiencia" className='group h-full'>
          <div className='bg-[#ffffff] border border-[rgba(30,58,95,0.09)] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col'>
            <div className='flex items-center justify-between mb-3 sm:mb-4'>
              <div className='bg-[#f3ede1] rounded-lg p-3'>
                <Briefcase className='text-[#1e3a5f]' size={28} />
              </div>
              <Settings className='text-[#6b7a8d] group-hover:animate-spin-slow' size={20} />
            </div>
            <h2 className='text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-2'>
              Tipos de experiencia
            </h2>
            <p className='text-[#6b7a8d] text-xs sm:text-sm flex-grow leading-relaxed'>
              Opciones del formulario de experiencia laboral y de las convocatorias
            </p>
            <div className='mt-4 text-[#e8740e] font-bold flex items-center gap-2 text-sm group-hover:text-[#c2600b]'>
              Gestionar catálogo →
            </div>
          </div>
        </Link>

        {/* Card Descargar Excel */}
        <button 
          onClick={fetchDatos} 
          disabled={descargando} 
          className='text-left group h-full'
        >
          <div className='bg-[#ffffff] border border-[rgba(30,58,95,0.09)] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col'>
            <div className='flex items-center justify-between mb-3 sm:mb-4'>
              <div className='bg-[#f3ede1] rounded-lg p-3'>
                <Download className='text-[#1e3a5f]' size={28} />
              </div>
              <BarChart3 className='text-[#6b7a8d]' size={20} />
            </div>
            <h2 className='text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-2'>
              {descargando ? 'Descargando...' : 'Exportar Usuarios'}
            </h2>
            <p className='text-[#6b7a8d] text-xs sm:text-sm flex-grow leading-relaxed'>
              Descarga la lista completa de usuarios en formato Excel
            </p>
            <div className='mt-4 text-[#e8740e] font-bold flex items-center gap-2 text-sm group-hover:text-[#c2600b]'>
              {descargando ? 'Procesando...' : 'Descargar Excel →'}
            </div>
          </div>
        </button>

        {/* Card Estadísticas */}
        <button
          onClick={() => setEstadisticasAbiertas(!estadisticasAbiertas)}
          className='text-left group h-full'
        >
          <div className='bg-[#ffffff] border border-[rgba(30,58,95,0.09)] rounded-xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col'>
            <div className='flex items-center justify-between mb-3 sm:mb-4'>
              <div className='bg-[#f3ede1] rounded-lg p-3'>
                <BarChart3 className='text-[#1e3a5f]' size={28} />
              </div>
              <div className='text-[#6b7a8d] p-1'>
                {estadisticasAbiertas ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </div>
            </div>
            <h2 className='text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-2'>
              Estadísticas
            </h2>
            <p className='text-[#6b7a8d] text-xs sm:text-sm flex-grow leading-relaxed'>
              {estadisticasAbiertas ? 'Ver menos detalles' : 'Ver estadísticas del sistema'}
            </p>
            <div className='mt-4 text-[#e8740e] font-bold flex items-center gap-2 text-sm group-hover:text-[#c2600b]'>
              {estadisticasAbiertas ? 'Ocultar' : 'Mostrar'} estadísticas
            </div>
          </div>
        </button>
      </div>

      {/* Panel de Estadísticas Desplegable */}
      {estadisticasAbiertas && (
        <div className='mt-6 bg-[#ffffff] rounded-xl p-4 sm:p-6 shadow-md animate-fadeIn border border-[rgba(30,58,95,0.09)]'>
          <h3 className='text-xl sm:text-2xl font-bold text-[#1e3a5f] mb-4 flex items-center gap-2'>
            <BarChart3 size={24} className="text-[#e8740e]"/>
            Resumen del Sistema
          </h3>
          
          {loading ? (
            <div className="flex items-center gap-2 text-[#1e3a5f] font-semibold">
               <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#e8740e]"></div>
               Cargando estadísticas...
            </div>
          ) : (
            <>
              {/* Total de usuarios */}
              <div className='bg-[#f3ede1] border border-[rgba(30,58,95,0.09)] rounded-lg p-5 mb-5 shadow-sm'>
                <p className='text-sm text-[#6b7a8d] font-bold uppercase tracking-wider mb-1'>Total de Usuarios</p>
                <p className='text-3xl sm:text-4xl font-black text-[#1e3a5f]'>
                  {usuarios.length}
                </p>
              </div>

              {/* Distribución por roles */}
              <div className='bg-[#ffffff]'>
                <h4 className='font-bold text-[#2c3e50] mb-4 text-base sm:text-lg border-b border-[rgba(30,58,95,0.09)] pb-2'>
                  Distribución por Roles
                </h4>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                  {Object.entries(estadisticasPorRol).map(([rol, cantidad], index) => {
                    // Mapeo utilizando los colores de la paleta para que no queden grises aburridos
                    const paleta = [
                      'border-[#1e3a5f]', 
                      'border-[#e8740e]', 
                      'border-[#c89b14]', 
                      'border-[#2c3e50]', 
                      'border-[#6b7a8d]'
                    ];
                    const colorBorde = paleta[index % paleta.length];

                    return (
                      <div
                        key={rol}
                        className={`bg-[#ffffff] border-l-4 ${colorBorde} border-y border-r border-[rgba(30,58,95,0.09)] p-4 rounded-r-lg shadow-sm hover:shadow-md transition-shadow`}
                      >
                        <p className='text-xs sm:text-sm font-bold text-[#6b7a8d] truncate'>
                          {rol}
                        </p>
                        <p className='text-2xl sm:text-3xl font-black text-[#1e3a5f] mt-1'>
                          {cantidad}
                        </p>
                        <p className='text-xs font-semibold text-[#e8740e] mt-1'>
                          {((cantidad / usuarios.length) * 100).toFixed(1)}% del total
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;