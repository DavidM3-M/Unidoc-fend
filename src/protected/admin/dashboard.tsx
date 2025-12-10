import { Link } from 'react-router-dom';
import { Users, Download, BarChart3, Settings, ChevronDown, ChevronUp, FileText } from 'lucide-react';
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
        const response = await axiosInstance.get('/admin/usuarios');
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
    try {
      setDescargando(true);
      const response = await axiosInstance.get('/admin/usuarios/exportar-excel', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Usuarios descargados correctamente');
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      toast.error('Error al descargar usuarios');
    } finally {
      setDescargando(false);
    }
  };
  
  return (
    <div className='flex flex-col bg-white min-h-screen w-full p-4 sm:p-6 lg:p-8'>
      {/* Header */}
      <div className='mb-6 sm:mb-8'>
        <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2'>
          Panel de Administración
        </h1>
        <p className='text-sm sm:text-base text-gray-600'>
          Bienvenido al sistema de gestión UniDoc
        </p>
      </div>

      {/* Cards de acceso rápido */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
        {/* Card Gestión de Usuarios */}
        <Link to="/usuarios" className='group'>
          <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'>
            <div className='flex items-center justify-between mb-3 sm:mb-4'>
              <Users className='text-white' size={32} />
              <div className='bg-white/20 rounded-full p-2'>
                <Settings className='text-white' size={16} />
              </div>
            </div>
            <h2 className='text-xl sm:text-2xl font-bold text-white mb-2'>
              Gestión de Usuarios
            </h2>
            <p className='text-blue-100 text-xs sm:text-sm'>
              Administra usuarios y asigna roles en el sistema
            </p>
            <div className='mt-3 sm:mt-4 text-white font-semibold flex items-center gap-2 text-sm'>
              Ver usuarios →
            </div>
          </div>
        </Link>

          {/* Card Normativas */}
    <Link to="/admin/normativas" className='group'>
            <div className='bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'>
              <div className='flex items-center justify-between mb-3 sm:mb-4'>
                <FileText className='text-white' size={32} />
                <div className='bg-white/20 rounded-full p-2'>
                  <Settings className='text-white' size={16} />
                </div>
              </div>
              <h2 className='text-xl sm:text-2xl font-bold text-white mb-2'>
                Normativas
              </h2>
              <p className='text-orange-100 text-xs sm:text-sm'>
                Crear y gestionar normativas públicas del sistema
              </p>
              <div className='mt-3 sm:mt-4 text-white font-semibold flex items-center gap-2 text-sm'>
                Gestionar normativas →
              </div>
            </div>
          </Link>

        {/* Card Descargar Excel */}
        <button 
          onClick={fetchDatos} 
          disabled={descargando} 
          className='text-left group'
        >
          <div className='bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full'>
            <div className='flex items-center justify-between mb-3 sm:mb-4'>
              <Download className='text-white' size={32} />
              <div className='bg-white/20 rounded-full p-2'>
                <BarChart3 className='text-white' size={16} />
              </div>
            </div>
            <h2 className='text-xl sm:text-2xl font-bold text-white mb-2'>
              {descargando ? 'Descargando...' : 'Exportar Usuarios'}
            </h2>
            <p className='text-green-100 text-xs sm:text-sm'>
              Descarga la lista completa de usuarios en formato Excel
            </p>
            <div className='mt-3 sm:mt-4 text-white font-semibold flex items-center gap-2 text-sm'>
              {descargando ? 'Procesando...' : 'Descargar Excel →'}
            </div>
          </div>
        </button>

        {/* Card Estadísticas */}
        <button
          onClick={() => setEstadisticasAbiertas(!estadisticasAbiertas)}
          className='text-left group'
        >
          <div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'>
            <div className='flex items-center justify-between mb-3 sm:mb-4'>
              <BarChart3 className='text-white' size={32} />
              <div className='bg-white/20 rounded-full p-2'>
                {estadisticasAbiertas ? (
                  <ChevronUp className='text-white' size={16} />
                ) : (
                  <ChevronDown className='text-white' size={16} />
                )}
              </div>
            </div>
            <h2 className='text-xl sm:text-2xl font-bold text-white mb-2'>
              Estadísticas
            </h2>
            <p className='text-purple-100 text-xs sm:text-sm'>
              {estadisticasAbiertas ? 'Ver menos detalles' : 'Ver estadísticas del sistema'}
            </p>
            <div className='mt-3 sm:mt-4 text-white font-semibold flex items-center gap-2 text-sm'>
              {estadisticasAbiertas ? 'Ocultar' : 'Mostrar'} estadísticas
            </div>
          </div>
        </button>
      </div>

      {/* Panel de Estadísticas Desplegable */}
      {estadisticasAbiertas && (
        <div className='mt-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 sm:p-6 shadow-lg animate-fadeIn border-2 border-purple-200'>
          <h3 className='text-xl sm:text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2'>
            <BarChart3 size={24} />
            Estadísticas del Sistema
          </h3>
          
          {loading ? (
            <p className='text-purple-700'>Cargando estadísticas...</p>
          ) : (
            <>
              {/* Total de usuarios */}
              <div className='bg-white rounded-lg p-4 mb-4 shadow'>
                <p className='text-sm text-gray-600'>Total de Usuarios</p>
                <p className='text-3xl sm:text-4xl font-bold text-purple-800'>
                  {usuarios.length}
                </p>
              </div>

              {/* Distribución por roles */}
              <div className='bg-white rounded-lg p-4 shadow'>
                <h4 className='font-bold text-gray-800 mb-3 text-sm sm:text-base'>
                  Distribución por Roles
                </h4>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                  {Object.entries(estadisticasPorRol).map(([rol, cantidad]) => {
                    const colorMap: Record<string, string> = {
                      'Administrador': 'from-purple-400 to-purple-500',
                      'Talento Humano': 'from-blue-400 to-blue-500',
                      'Apoyo Profesoral': 'from-green-400 to-green-500',
                      'Aspirante': 'from-gray-400 to-gray-500',
                      'Docente': 'from-yellow-400 to-yellow-500',
                      'Vicerrectoría': 'from-indigo-400 to-indigo-500',
                      'Coordinación': 'from-pink-400 to-pink-500',
                      'Sin rol': 'from-red-400 to-red-500',
                    };

                    return (
                      <div
                        key={rol}
                        className={`bg-gradient-to-br ${colorMap[rol] || 'from-gray-400 to-gray-500'} p-3 sm:p-4 rounded-lg text-white shadow-md`}
                      >
                        <p className='text-xs sm:text-sm font-medium opacity-90'>
                          {rol}
                        </p>
                        <p className='text-2xl sm:text-3xl font-bold mt-1'>
                          {cantidad}
                        </p>
                        <p className='text-xs opacity-75 mt-1'>
                          {((cantidad / usuarios.length) * 100).toFixed(1)}%
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