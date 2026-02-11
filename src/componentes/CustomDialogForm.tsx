import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { CloseIcon } from "../assets/icons/Iconos";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  width?: string; // Nueva prop opcional
};

const CustomDialog = ({ open, onClose, children, title, width = "900px" }: Props) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableRestoreFocus
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            width: width, // Usamos la prop width aquí
            maxWidth: "95vw", // Añadimos un máximo
            borderRadius: "5px",
            p: 0,
            overflow: "hidden",
            backgroundColor: "white",
            boxShadow: "0px 8px 40px rgba(0,0,0,0.1)",
            animation: "fadeIn 0.25s ease-out",
            "@keyframes fadeIn": {
              from: { opacity: 0, transform: "scale(0.97)" },
              to: { opacity: 1, transform: "scale(1)" },
            },
          },
        },
      }}
    >
      {/* HEADER */}
      <DialogTitle
        className="
          flex justify-between items-center 
          px-6 py-4 
          bg-gradient-to-r from-blue-600 to-blue-500 
          text-white
          shadow-sm
        "
      >
        <span className="text-xl font-semibold tracking-wide">
          {title}
        </span>

        <button
          onClick={onClose}
          className="
            p-1 rounded-full 
            hover:bg-white/20 transition-colors duration-200
          "
        >
          <CloseIcon />
        </button>
      </DialogTitle>

      {/* CONTENIDO */}
      <DialogContent
        sx={{
          maxHeight: "80vh",
          overflowY: "auto",
          padding: 2, 
        }}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default CustomDialog;