import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../componentes/header';
import axiosInstance from '../utils/axiosConfig';

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
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setExpandido(v => !v)}
        className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-amber-900 font-bold px-4 py-2.5 rounded-full shadow-lg transition-all"
        title="Mi puntaje de aptitud"
      >
        <span className="text-lg leading-none">★</span>
        <span className="text-base">{puntaje.total} pts</span>
      </button>

      {expandido && (
        <div className="absolute bottom-14 right-0 bg-white rounded-2xl shadow-2xl border border-amber-200 p-4 w-52 text-sm">
          <p className="font-bold text-amber-800 mb-2 text-center">Mi Puntaje</p>
          <div className="space-y-1.5 text-gray-700">
            <div className="flex justify-between">
              <span>Estudios</span>
              <span className="font-semibold">{puntaje.estudios} pts</span>
            </div>
            <div className="flex justify-between">
              <span>Idiomas</span>
              <span className="font-semibold">{puntaje.idiomas} pts</span>
            </div>
            <div className="flex justify-between">
              <span>Experiencia</span>
              <span className="font-semibold">{puntaje.experiencia} pts</span>
            </div>
            <div className="flex justify-between border-t border-amber-200 pt-1.5 mt-1.5 font-bold text-amber-800">
              <span>Total</span>
              <span>{puntaje.total} pts</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">Máximo posible: 490 pts</p>
        </div>
      )}
    </div>
  );
}

export default function AspiranteLayouts() {
  return (
    <>
      <Header />
      <main className="p-4">
        <Outlet />
      </main>
      <PuntajeWidget />
    </>
  );
}
