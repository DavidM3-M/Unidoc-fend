import { Outlet } from 'react-router-dom';
import HeaderAdmin from '../componentes/headerAdmin';

export default function AspiranteLayouts() {
  return (
    <>
      <HeaderAdmin />
      <main className="p-4">
        <Outlet />
      </main>
    </>
  );
}
