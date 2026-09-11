import { useEffect, type ReactNode } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import type { RolesValidos } from "../types/roles";

type Props = { children: (rol: RolesValidos) => ReactNode; onInvalid?: () => void };

export default function SesionValida({ children, onInvalid }: Props) {
  let rol: RolesValidos | null = null;
  try {
    const token = Cookies.get("token");
    const payload = token ? jwtDecode<{ rol?: string; exp?: number }>(token) : null;
    if (payload && (!payload.exp || payload.exp * 1000 > Date.now()) &&
        ["Aspirante", "Docente", "Administrativo"].includes(payload.rol ?? "")) {
      rol = payload.rol as RolesValidos;
    }
  } catch {
    // Un token ilegible se trata como una sesión ausente.
  }
  useEffect(() => {
    if (!rol) {
      if (onInvalid) onInvalid();
      else window.location.replace("/");
    }
  }, [rol, onInvalid]);
  return rol ? children(rol) : null;
}
