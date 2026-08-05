import { Outlet } from "react-router-dom";
import HeaderVicerrectoria from "../componentes/headerVicerrectoria";

export default function VicerrectoriaLayout() {
  return (
    <>
      <HeaderVicerrectoria />
      <main className="p-4">
        <Outlet />
      </main>
    </>
  );
}