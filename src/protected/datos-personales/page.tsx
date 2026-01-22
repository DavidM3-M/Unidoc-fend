"use client";

import { useState } from "react";
import { Acordeon } from "../../componentes/Acordeon";
import { DatosPersonales } from "../../datosPersona/DatosPersonales";
import { EpsFormulario } from "../../datosPersona/Eps";
import { InformacionContacto } from "../../datosPersona/InformacionContacto";
import { Rut } from "../../datosPersona/Rut";
import { CertificacionBancaria } from "../../datosPersona/CertificacionBancaria";
import Pension from "../../datosPersona/Pension";

const InformacionPersona = () => {
  const [acordeonActivo, setAcordeonActivo] = useState("Datos Personales");

  const toggle = (titulo: string) => {
    setAcordeonActivo(acordeonActivo === titulo ? "" : titulo);
  };

  return (
    <div className="flex w-full flex-col gap-y-8 lg:w-[800px] xl:w-[1000px] 2xl:w-[1200px] m-auto relative">
      <Acordeon
        titulo="Datos Personales"
        isOpen={acordeonActivo === "Datos Personales"}
        onToggle={() => toggle("Datos Personales")}
        description="Se solicita información relacionada con el lugar de origen, datos de identificación personal, nombres y apellidos completos, información demográfica básica y la carga del documento de identificación, con el fin de verificar la identidad de la persona y garantizar una adecuada gestión académica y administrativa conforme a las políticas institucionales."
      >
        <DatosPersonales />
      </Acordeon>

      <Acordeon
        titulo="Información de Contacto"
        isOpen={acordeonActivo === "Información de Contacto"}
        onToggle={() => toggle("Información de Contacto")}
        description="Se solicita información sobre la ubicación de residencia actual, datos de la libreta militar cuando aplique, dirección de residencia, y medios de contacto (teléfonos y correo alternativo), así como la carga del documento soporte correspondiente, con el fin de mantener información actualizada y facilitar la gestión institucional y administrativa."
      >
        <InformacionContacto />
      </Acordeon>

      <Acordeon
        titulo="EPS"
        isOpen={acordeonActivo === "EPS"}
        onToggle={() => toggle("EPS")}
        description="Se solicita información relacionada con la afiliación al sistema de salud (EPS), incluyendo el tipo y nombre de la afiliación, estado y fechas de vigencia, tipo y número de afiliado, así como la carga del documento soporte, con el fin de mantener actualizados los datos institucionales y cumplir con los requisitos administrativos."
      >
        <EpsFormulario />
      </Acordeon>

      <Acordeon
        titulo="RUT"
        isOpen={acordeonActivo === "RUT"}
        onToggle={() => toggle("RUT")}
        description="Se solicita información relacionada con el Registro Único Tributario (RUT), incluyendo datos identificatorios generales, naturaleza jurídica, actividad económica (código CIIU) y responsabilidades tributarias, así como la carga del documento soporte, con el fin de cumplir con los requisitos fiscales y administrativos institucionales."
      >
        <Rut />
      </Acordeon>
      <Acordeon
        titulo="Certificación Bancaria"
        isOpen={acordeonActivo === "Certificación Bancaria"}
        onToggle={() => toggle("Certificación Bancaria")}
        description="Se solicita información relacionada con la cuenta bancaria del aspirante, incluyendo el nombre del banco, tipo y número de cuenta, fecha de emisión y la carga del documento soporte, con el fin de facilitar la gestión de pagos y transacciones financieras conforme a las políticas institucionales."
      >
        <CertificacionBancaria />
      </Acordeon>
      <Acordeon
        titulo="Pensión"
        isOpen={acordeonActivo === "Pensión"}
        onToggle={() => toggle("Pensión")}
        description="Se solicita información relacionada con la afiliación al sistema de pensiones, incluyendo el régimen pensional, entidad y NIT de la entidad, con el fin de mantener actualizados los datos institucionales y cumplir con los requisitos administrativos."
      >
        <Pension />
      </Acordeon>
    </div>
  );
};

export default InformacionPersona;
