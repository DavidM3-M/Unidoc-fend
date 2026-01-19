import { Link } from "react-router";
import { useLanguage } from "../../context/LanguageContext";

const TalentoHumano = () => {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-8  w-[1000px] m-auto h-screen bg-white p-8">
      <Link className="col-span-full" to="convocatorias">
        <div className="relative flex flex-col gap-4  text-white rounded-lg bg-red-500 items-end justify-end fondo-image2 w-full h-full bg-cover bg-center hover:scale-105 transition-transform duration-300">
          <div className="backdrop-brightness-20 p-4 rounded bottom-0 w-full">
            <h3 className="text-2xl font-bold">{t("convocations.title")}</h3>
            <p>
              {t("desc.convocationManagement")}
            </p>
          </div>
        </div>
      </Link>
      <Link to="postulaciones">
        <div className=" relative flex flex-col gap-4 text-white rounded-lg bg-red-500 items-end justify-end fondo-image h-full bg-cover bg-center hover:scale-105 transition-transform duration-300">
          <div className="backdrop-brightness-20 p-4 rounded bottom-0 w-full">
            <h3 className="text-2xl font-bold">{t("Postulaciones")}</h3>
            <p>{t("desc.applications")}</p>
          </div>
        </div>
      </Link>
      <Link to="contrataciones">
      <div className=" relative flex flex-col gap-4  text-white rounded-lg bg-red-500 items-end justify-end fondo-image  h-full bg-cover bg-center hover:scale-105 transition-transform duration-300">
        <div className="backdrop-brightness-20 p-4 rounded bottom-0 w-full">
          <h3 className="text-2xl font-bold">Contrataciones</h3>
          <p>{t("desc.hrHire")}</p>
        </div>
      </div>
      </Link >
    </div>
  );
};
export default TalentoHumano;
