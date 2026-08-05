import { Outlet } from 'react-router-dom';
import HeaderApoyoProfesoral from '../componentes/headerApoyoProfesoral';

export default function ApoyoProfesoralLayouts() {
  return (
    <>
      <HeaderApoyoProfesoral />
      <main className="p-4 w-full min-h-screen">
        <Outlet />
      </main>
    </>
  );
}
