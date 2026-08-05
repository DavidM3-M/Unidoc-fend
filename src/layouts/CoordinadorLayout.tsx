import { Outlet } from "react-router-dom";
import HeaderCoordinador from "../componentes/headerCoordinador";

export default function CoordinadorLayout() {
  return (
    <>
      <HeaderCoordinador />
      <main className="p-4">
        <Outlet />
      </main>
    </>
  );
}
