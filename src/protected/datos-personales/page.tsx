"use client";

import { useState } from "react";
import { Acordeon } from "../../componentes/Acordeon";
import { DatosPersonales } from "../../datosPersona/DatosPersonales";
import { EpsFormulario } from "../../datosPersona/Eps";
import { InformacionContacto } from "../../datosPersona/InformacionContacto";
import { Rut } from "../../datosPersona/Rut";

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
      >
        <DatosPersonales />
      </Acordeon>

      <Acordeon
        titulo="Información de Contacto"
        isOpen={acordeonActivo === "Información de Contacto"}
        onToggle={() => toggle("Información de Contacto")}
      >
        <InformacionContacto />
      </Acordeon>

      <Acordeon
        titulo="EPS"
        isOpen={acordeonActivo === "EPS"}
        onToggle={() => toggle("EPS")}
      >
        <EpsFormulario />
      </Acordeon>

      <Acordeon
        titulo="RUT"
        isOpen={acordeonActivo === "RUT"}
        onToggle={() => toggle("RUT")}
      >
        <Rut />
      </Acordeon>

    </div>
  );
};

export default InformacionPersona;
