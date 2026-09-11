import { Outlet } from "react-router-dom";
import HeaderEvaluadorProduccion from "../componentes/headerEvaluadorProduccion";

/**
 * Contenedor del rol Evaluador de Producción.
 *
 * Mismo esqueleto que `ApoyoProfesoral.tsx`: cabecera fija arriba y el contenido de la ruta
 * debajo. No hay barra lateral porque el rol solo tiene dos pantallas de primer nivel.
 */
export default function EvaluadorProduccionLayout() {
  return (
    <>
      <HeaderEvaluadorProduccion />
      <main className="p-4 w-full min-h-screen">
        <Outlet />
      </main>
    </>
  );
}
