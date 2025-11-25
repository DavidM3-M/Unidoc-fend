import { Link } from 'react-router-dom';
import { Users, Download, BarChart3, Settings } from 'lucide-react';
import axiosInstance from "../../utils/axiosConfig";
import { toast } from 'react-toastify';
import { useState } from 'react';

//modifique todo el dashboard para que tenga mejor diseño y funcionalidad (Brayan Cuellar)
const Dashboard = () => {
  const [descargando, setDescargando] = useState(false);

  const fetchDatos = async () => {
    try {
      setDescargando(true);
      const response = await axiosInstance.get('/admin/usuarios-excel', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'usuarios.xlsx');
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
    <div className='flex flex-col bg-white min-h-screen w-full p-8'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-4xl font-bold text-gray-800 mb-2'>Panel de Administración</h1>
        <p className='text-gray-600'>Bienvenido al sistema de gestión UniDoc</p>
      </div>

      {/* Cards de acceso rápido */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Card Gestión de Usuarios */}
        <Link to="/usuarios" className='group'>
          <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'>
            <div className='flex items-center justify-between mb-4'>
              <Users className='text-white' size={40} />
              <div className='bg-white/20 rounded-full p-2'>
                <Settings className='text-white' size={20} />
              </div>
            </div>
            <h2 className='text-2xl font-bold text-white mb-2'>Gestión de Usuarios</h2>
            <p className='text-blue-100 text-sm'>
              Administra usuarios y asigna roles en el sistema
            </p>
            <div className='mt-4 text-white font-semibold flex items-center gap-2'>
              Ver usuarios →
            </div>
          </div>
        </Link>

        {/* Card Descargar Excel */}
        <button onClick={fetchDatos} disabled={descargando} className='text-left group'>
          <div className='bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 h-full'>
            <div className='flex items-center justify-between mb-4'>
              <Download className='text-white' size={40} />
              <div className='bg-white/20 rounded-full p-2'>
                <BarChart3 className='text-white' size={20} />
              </div>
            </div>
            <h2 className='text-2xl font-bold text-white mb-2'>
              {descargando ? 'Descargando...' : 'Exportar Usuarios'}
            </h2>
            <p className='text-green-100 text-sm'>
              Descarga la lista completa de usuarios en formato Excel
            </p>
            <div className='mt-4 text-white font-semibold flex items-center gap-2'>
              {descargando ? 'Procesando...' : 'Descargar Excel →'}
            </div>
          </div>
        </button>

        {/* Card Estadísticas (placeholder para futuro) */}
        <div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg opacity-50 cursor-not-allowed'>
          <div className='flex items-center justify-between mb-4'>
            <BarChart3 className='text-white' size={40} />
          </div>
          <h2 className='text-2xl font-bold text-white mb-2'>Estadísticas</h2>
          <p className='text-purple-100 text-sm'>
            Próximamente: Panel de estadísticas del sistema
          </p>
        </div>
      </div>

      {/* Acceso rápido a gestión de usuarios */}
      <div className='mt-8 bg-gray-50 rounded-xl p-6'>
        <h3 className='text-xl font-bold text-gray-800 mb-4'>Acciones Rápidas</h3>
        <div className='flex flex-wrap gap-4'>
          <Link 
            to="/usuarios" 
            className='bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2'
          >
            <Users size={20} />
            Ver todos los usuarios
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;