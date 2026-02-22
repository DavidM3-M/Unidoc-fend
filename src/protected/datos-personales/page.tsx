"use client";

import { useEffect, useState } from "react";
import {
  User,
  Phone,
  Heart,
  FileText,
  Landmark,
  PiggyBank,
} from "lucide-react";

import CardInfo from "../../componentes/datos-personales/CardInfo";
import CustomDialog from "../../componentes/CustomDialogForm";

import { DatosPersonales } from "../../datosPersona/DatosPersonales";
import { InformacionContacto } from "../../datosPersona/InformacionContacto";
import { EpsFormulario } from "../../datosPersona/Eps";
import { Rut } from "../../datosPersona/Rut";
import { CertificacionBancaria } from "../../datosPersona/CertificacionBancaria";
import Pension from "../../datosPersona/Pension";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { RolesValidos } from "../../types/roles";
import axiosInstance from "../../utils/axiosConfig";

interface CardInfoType {
  id: string;
  titulo: string;
  descripcion: string;
  icono: React.ElementType;
  colorIcono: string;
  colorTexto: string;
}

type EstadoSeccion = "completado" | "pendiente" | "falta-documento";

const InformacionPersona = () => {
  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found");

  const decoded = jwtDecode<{ rol: RolesValidos }>(token);
  const rol = decoded.rol;
  const [modalAbierto, setModalAbierto] = useState<string | null>(null);

  const [estadoSecciones, setEstadoSecciones] = useState<
    Record<string, EstadoSeccion>
  >({});

  const cerrarModal = () => {
    setModalAbierto(null);
  };

  const cards: CardInfoType[] = [
    {
      id: "datos-personales",
      titulo: "Datos Personales",
      descripcion: "Identificación, nombres y datos demográficos básicos",
      icono: User,
      colorIcono: "bg-blue-100",
      colorTexto: "text-blue-600",
    },
    {
      id: "informacion-contacto",
      titulo: "Información de Contacto",
      descripcion: "Dirección, teléfonos y correo electrónico",
      icono: Phone,
      colorIcono: "bg-green-100",
      colorTexto: "text-green-600",
    },
    {
      id: "eps",
      titulo: "EPS",
      descripcion: "Afiliación al sistema de salud",
      icono: Heart,
      colorIcono: "bg-red-100",
      colorTexto: "text-red-600",
    },
    {
      id: "rut",
      titulo: "RUT",
      descripcion: "Registro Único Tributario",
      icono: FileText,
      colorIcono: "bg-purple-100",
      colorTexto: "text-purple-600",
    },
    {
      id: "certificacion-bancaria",
      titulo: "Certificación Bancaria",
      descripcion: "Información de cuenta bancaria",
      icono: Landmark,
      colorIcono: "bg-yellow-100",
      colorTexto: "text-yellow-600",
    },
    {
      id: "pension",
      titulo: "Pensión",
      descripcion: "Afiliación al sistema pensional",
      icono: PiggyBank,
      colorIcono: "bg-indigo-100",
      colorTexto: "text-indigo-600",
    },
  ];

  const cardSeleccionada = cards.find((card) => card.id === modalAbierto);

  const fetchEstadoSecciones = async () => {
    const API = import.meta.env.VITE_API_URL;

    const ENDPOINTS = {
      Aspirante: {
        informacionContacto: import.meta.env
          .VITE_ENDPOINT_OBTENER_INFORMACION_CONTACTO_ASPIRANTE,
        eps: import.meta.env.VITE_ENDPOINT_OBTENER_EPS_ASPIRANTE,
        rut: import.meta.env.VITE_ENDPOINT_OBTENER_RUT_ASPIRANTE,
        certificacionBancaria: import.meta.env
          .VITE_ENDPOINT_OBTENER_CERTIFICACION_BANCARIA_ASPIRANTE,
        pension: import.meta.env.VITE_ENDPOINT_OBTENER_PENSION_ASPIRANTE,
      },
      Docente: {
        informacionContacto: import.meta.env
          .VITE_ENDPOINT_OBTENER_INFORMACION_CONTACTO_DOCENTE,
        eps: import.meta.env.VITE_ENDPOINT_OBTENER_EPS_DOCENTE,
        rut: import.meta.env.VITE_ENDPOINT_OBTENER_RUT_DOCENTE,
        certificacionBancaria: import.meta.env
          .VITE_ENDPOINT_OBTENER_CERTIFICACION_BANCARIA_DOCENTE,
        pension: import.meta.env.VITE_ENDPOINT_OBTENER_PENSION_DOCENTE,
      },
    };

    const endpoints = ENDPOINTS[rol];

    try {
      const [
        datosPersonales,
        informacionContacto,
        eps,
        rut,
        certificacionBancaria,
        pension,
      ] = await Promise.all([
        axiosInstance.get(`${API}/auth/obtener-usuario-autenticado`),
        axiosInstance.get(`${API}${endpoints.informacionContacto}`),
        axiosInstance.get(`${API}${endpoints.eps}`),
        axiosInstance.get(`${API}${endpoints.rut}`),
        axiosInstance.get(`${API}${endpoints.certificacionBancaria}`),
        axiosInstance.get(`${API}${endpoints.pension}`),
      ]);

      const nuevoEstado: Record<string, EstadoSeccion> = {
        "datos-personales":
          datosPersonales.data?.user?.documentos_user?.length > 0
            ? "completado"
            : "falta-documento",

        "informacion-contacto": informacionContacto.data?.informacion_contacto
          ? "completado"
          : "pendiente",

        eps: eps.data?.eps ? "completado" : "pendiente",

        rut: rut.data?.rut ? "completado" : "pendiente",

        "certificacion-bancaria": certificacionBancaria.data
          ?.certificacion_bancaria
          ? "completado"
          : "pendiente",

        pension: pension.data?.pension ? "completado" : "pendiente",
      };

      setEstadoSecciones(nuevoEstado);
      console.log("datosPersonales:", datosPersonales.data);
      console.log("informacionContacto:", informacionContacto.data);
      console.log("eps:", eps.data);
      console.log("rut:", rut.data);
      console.log("certificacionBancaria:", certificacionBancaria.data);
      console.log("pension:", pension.data);
    } catch (error) {
      console.error("Error verificando secciones:", error);
    }
  };

  useEffect(() => {
    fetchEstadoSecciones();
  }, []);

  const renderFormulario = () => {
    switch (modalAbierto) {
      case "datos-personales":
        return (
          <DatosPersonales
            onClose={cerrarModal}
            onSuccess={() =>
              setEstadoSecciones((prev) => ({
                ...prev,
                "datos-personales": "completado",
              }))
            }
          />
        );

      case "informacion-contacto":
        return (
          <InformacionContacto
            onClose={cerrarModal}
            onSuccess={() =>
              setEstadoSecciones((prev) => ({
                ...prev,
                "informacion-contacto": "completado",
              }))
            }
          />
        );

      case "eps":
        return (
          <EpsFormulario
            onClose={cerrarModal}
            onSuccess={() =>
              setEstadoSecciones((prev) => ({
                ...prev,
                eps: "completado",
              }))
            }
          />
        );

      case "rut":
        return (
          <Rut
            onClose={cerrarModal}
            onSuccess={() =>
              setEstadoSecciones((prev) => ({
                ...prev,
                rut: "completado",
              }))
            }
          />
        );

      case "certificacion-bancaria":
        return (
          <CertificacionBancaria
            onClose={cerrarModal}
            onSuccess={() =>
              setEstadoSecciones((prev) => ({
                ...prev,
                "certificacion-bancaria": "completado",
              }))
            }
          />
        );

      case "pension":
        return (
          <Pension
            onClose={cerrarModal}
            onSuccess={() =>
              setEstadoSecciones((prev) => ({
                ...prev,
                pension: "completado",
              }))
            }
          />
        );

      default:
        return null;
    }
  };

  const totalSecciones = cards.length;

  const seccionesCompletadas = Object.values(estadoSecciones).filter(
    (estado) => estado === "completado",
  ).length;

  const porcentajeProgreso =
    totalSecciones > 0
      ? Math.round((seccionesCompletadas / totalSecciones) * 100)
      : 0;

  return (
    <div className="bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Título y descripción */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="bg-blue-600 w-1.5 h-8 rounded-full"></span>
              Información Personal
            </h1>
            <p className="text-gray-600">
              Completa tu información personal para avanzar en el proceso de
              admisión.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 gap-4 flex flex-col">
        {/* Barra de progreso */}
        <div className="bg-white p-5  rounded-xl  shadow-md">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">
              Progreso del perfil
            </span>
            <span className="text-sm font-bold text-blue-600">
              {porcentajeProgreso}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-700"
              style={{ width: `${porcentajeProgreso}%` }}
            />
          </div>

          <p className="text-xs text-gray-500 mt-2">
            {seccionesCompletadas} de {totalSecciones} secciones completadas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <CardInfo
              key={card.id}
              estado={estadoSecciones[card.id] || "pendiente"}
              titulo={card.titulo}
              descripcion={card.descripcion}
              icono={card.icono}
              colorIcono={card.colorIcono}
              colorTexto={card.colorTexto}
              onClick={() => setModalAbierto(card.id)}
            />
          ))}
        </div>
      </div>

      {modalAbierto && cardSeleccionada && (
        <CustomDialog
          title={cardSeleccionada.titulo}
          open={!!modalAbierto}
          onClose={cerrarModal}
        >
          <div className="p-6">{renderFormulario()}</div>
        </CustomDialog>
      )}
    </div>
  );
};

export default InformacionPersona;
