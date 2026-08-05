import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import Header from '../componentes/header';
import axiosInstance from '../utils/axiosConfig';
import { RolesValidos } from '../types/roles';
import { Star } from 'lucide-react'; 

interface Puntaje {
  total: number;
  estudios: number;
  idiomas: number;
  experiencia: number;
}

function PuntajeWidget() {
  const [puntaje, setPuntaje] = useState<Puntaje | null>(null);
  const [expandido, setExpandido] = useState(false);

  useEffect(() => {
    axiosInstance.get('/aspirante/mi-puntaje')
      .then(r => setPuntaje(r.data))
      .catch(() => {/* silencioso */});
  }, []);

  if (!puntaje) return null;

  return (
    // Ajustado a right-24 para despejar el control de accesibilidad
    <div className="fixed bottom-6 right-24 z-50">
      <button
        onClick={() => setExpandido(v => !v)}
        className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#2a4d7d] text-white font-medium px-5 py-3 rounded-xl shadow-lg transition-all"
        title="Mi puntaje de aptitud"
      >
        <Star size={16} className="fill-yellow-400 text-yellow-400" />
        <span className="text-sm">{puntaje.total} pts</span>
      </button>

      {expandido && (
        <div className="absolute bottom-16 right-0 bg-white rounded-xl shadow-xl border border-[rgba(30,58,95,0.1)] p-5 w-60 text-sm animate-in fade-in zoom-in duration-200">
          <p className="font-semibold text-[#1e3a5f] mb-3 border-b border-[rgba(30,58,95,0.05)] pb-2 text-center">
            Mi Puntaje de Aptitud
          </p>
          <div className="space-y-2 text-[#4a5568]">
            <div className="flex justify-between">
              <span>Estudios</span>
              <span className="font-medium text-[#1e3a5f]">{puntaje.estudios}</span>
            </div>
            <div className="flex justify-between">
              <span>Idiomas</span>
              <span className="font-medium text-[#1e3a5f]">{puntaje.idiomas}</span>
            </div>
            <div className="flex justify-between">
              <span>Experiencia</span>
              <span className="font-medium text-[#1e3a5f]">{puntaje.experiencia}</span>
            </div>
            <div className="flex justify-between border-t border-[rgba(30,58,95,0.1)] pt-2 mt-2 font-bold text-[#1e3a5f]">
              <span>Total</span>
              <span>{puntaje.total}</span>
            </div>
          </div>
          <p className="text-[10px] text-[#a0aec0] text-center mt-4">
            Máximo posible: 490 pts
          </p>
        </div>
      )}
    </div>
  );
}

export default function AspiranteLayouts() {
  const token = Cookies.get('token');
  const rol: RolesValidos | null = token
    ? (jwtDecode<{ rol: RolesValidos }>(token)?.rol ?? null)
    : null;

  const mostrarPuntaje = rol === 'Aspirante' || rol === 'Docente';

  return (
    <>
      <Header />
      <main className="p-4">
        <Outlet />
      </main>
      {mostrarPuntaje && <PuntajeWidget />}
    </>
  );
}