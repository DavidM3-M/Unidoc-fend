import React from "react";

type Props = {
  file: {
    url: string;
    name: string;
  } | null;
};

export const MostrarArchivo: React.FC<Props> = ({ file }) => {
  if (!file) return null;

  return (
    <div className="text-sm text-[#1e3a5f] mt-2">
      <p>
        Archivo cargado:&nbsp;
        <a 
          href={file.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-[#e8740e] underline hover:text-[#1e3a5f] transition-colors"
        >
          {file.name}
        </a>
      </p>
    </div>
  );
};