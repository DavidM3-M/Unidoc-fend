import { Outlet } from "react-router-dom";
import HeaderRectoria from "../componentes/headerRectoria";

export default function AspiranteLayouts() {
  return (
     <>
      <HeaderRectoria />
      <main className="p-4">
        <Outlet />
      </main>
    </>
  );
}
