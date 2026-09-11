import { useEffect, useRef } from "react";

/**
 * Aviso de que la trayectoria del docente cambió: estudios, producción académica, experiencia o
 * idiomas.
 *
 * Las tarjetas de Formación y la tarjeta de Hoja de vida (barra de puntaje, antigüedad) son
 * hermanas en la misma página, y cada una trae sus datos por su cuenta en su propio `useEffect`
 * de montaje. Sin este aviso, agregar una experiencia refrescaba la lista de experiencias pero
 * dejaba la barra de antigüedad congelada hasta recargar la página, que era exactamente lo que
 * reportaban los docentes.
 *
 * Es un bus mínimo a propósito: el proyecto no tiene store global ni react-query, y montar uno
 * para un solo evento costaría más de lo que arregla. Los listeners viven en un `Set` a nivel de
 * módulo, así que emisor y suscriptor no necesitan compartir árbol de React.
 */
type Escucha = () => void;

const escuchas = new Set<Escucha>();

/**
 * Anuncia que la trayectoria cambió. La llaman los componentes de Formación después de crear,
 * editar o eliminar un registro; nunca al cargar por primera vez, porque en el montaje cada
 * tarjeta ya trae sus propios datos y el aviso solo generaría peticiones repetidas.
 */
export const notificarTrayectoriaActualizada = () => {
  escuchas.forEach((escucha) => escucha());
};

/**
 * Vuelve a ejecutar `alCambiar` cada vez que la trayectoria cambia.
 *
 * El callback se guarda en una ref porque en la práctica se define en línea y cambia de identidad
 * en cada render: suscribirse a él directamente daría de baja y de alta el listener en cada
 * pintada, con la ventana de carrera que eso abre.
 */
export const useTrayectoriaActualizada = (alCambiar: () => void) => {
  const callback = useRef(alCambiar);
  callback.current = alCambiar;

  useEffect(() => {
    const escucha = () => callback.current();
    escuchas.add(escucha);
    return () => {
      escuchas.delete(escucha);
    };
  }, []);
};
