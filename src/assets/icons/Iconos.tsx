import {
  AcademicCapIcon,
  BeakerIcon,
  BriefcaseIcon,
  GlobeAmericasIcon,
  PencilSquareIcon,
  XMarkIcon,
  PlusIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  NewspaperIcon,
  LanguageIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { Clock } from "lucide-react";

export const AcademicIcono = () => {
  return (
    <AcademicCapIcon className="size-10 p-2 rounded-lg bg-[#266AAE] text-white" />
  );
};
export const BriefIcon = () => {
  return (
    <BriefcaseIcon className="size-10 p-2 rounded-lg bg-[#266AAE] text-white" />
  );
};
export const GlobeIcon = () => {
  return (
    <GlobeAmericasIcon className="size-10 p-2 rounded-lg bg-[#266AAE] text-white" />
  );
};
export const BeakerIcons = () => {
  return (
    <BeakerIcon className="size-10 p-2 rounded-lg bg-[#266AAE] text-white" />
  );
};

export const PencilIcon = () => {
  return (
    <PencilSquareIcon className="size-10 p-2 rounded-lg bg-orange-400 text-white" />
  );
};
//Cerrar Icon
export const CloseIcon = () => {
  return (
    <XMarkIcon className="size-8 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 cursor-pointer " />
  );
};
// Agregar Icon
export const AddIcon = () => {
  return (
    <PlusIcon className="size-10 p-2 stroke-2 cursor-pointer hover:bg-gray-200 hover:rounded-xl" />
  );
};
// Editar Icon Index
export const EditIcon = () => {
  return (
    <PencilSquareIcon className="size-10 p-2 stroke-2 cursor-pointer hover:bg-gray-200 hover:rounded-xl" />
  );
};

export const EdificioIcon = () => {
  return (
    <BuildingOfficeIcon className="size-10 p-2 rounded-lg text-[#266AAE] min-w-10 min-h-10" />
  );
};
export const CalendarIcono = () => {
  return (
    <CalendarIcon className="size-10 p-2 rounded-lg text-[#266AAE] min-w-10 min-h-10" />
  );
};
export const IdiomaIcon = () => {
  return (
    <GlobeAmericasIcon className="size-10 p-2 rounded-lg text-[#266AAE] min-w-10 min-h-10" />
  );
}
export const NivelIcon = () => {
  return (
    <ChatBubbleOvalLeftEllipsisIcon className="size-10 p-2 rounded-lg text-[#266AAE] min-w-10 min-h-10" />
  );
}
export const PapelIcon = () => {
  return (
    <NewspaperIcon className="size-10 p-2 rounded-lg  text-[#266AAE] min-w-10 min-h-10" />
  );
}

export const RelojIcon = () => {
  return (
    <Clock className="size-10 p-2 rounded-lg  text-[#266AAE] min-w-10 min-h-10" />
  );
}

interface VerDocumentosProps {
  texto: string;
}
export const VerDocumentos = ({ texto }: VerDocumentosProps) => {
  return <p className=" p-2 rounded-lg bg-blue-500 text-white">{texto}</p>;
};
