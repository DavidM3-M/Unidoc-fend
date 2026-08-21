import { Outlet } from 'react-router-dom';
import HeaderAdmin from '../componentes/headerAdmin';

export default function AspiranteLayouts() {
  return (
    <div className="flex w-full min-w-0 min-h-screen">
      <HeaderAdmin />
      <main className="min-w-0 flex-1 p-4 pt-20 md:pt-4">
        <Outlet />
      </main>
    </div>
  );
}
