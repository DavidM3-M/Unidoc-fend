import { Outlet } from 'react-router-dom';
import HeaderTalentoHumano from '../componentes/headerTalentoHumano';

export default function TalentoHumanoLayouts() {
  return (
    <>
      <HeaderTalentoHumano />
      <main className="p-4">
        <Outlet />
      </main>
    </>
  );
}
