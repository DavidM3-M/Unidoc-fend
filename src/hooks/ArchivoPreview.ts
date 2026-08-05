import { useState, useEffect } from "react";

export function useArchivoPreview(fileList: FileList | undefined) {
  const [existingFile, setExistingFile] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      const previewUrl = URL.createObjectURL(file);
      setExistingFile({ url: previewUrl, name: file.name });

      return () => {
        URL.revokeObjectURL(previewUrl);
      };
    }
  }, [fileList]);

  return { existingFile, setExistingFile };
}
