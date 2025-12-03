import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { CloseIcon } from "../assets/icons/Iconos";

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
};

const CustomDialog = ({ open, onClose, children, title }: Props) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableRestoreFocus
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            width: "900px",
            borderRadius: "20px",
            p: 2,
            boxShadow: 50,
            backgroundColor: "white",
          },
        },
      }}
    >
      <DialogTitle className="flex justify-between items-center">
        <span className="text-xl font-semibold">{title}</span>
        <button onClick={onClose}>
          <CloseIcon />
        </button>
      </DialogTitle>

      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};

export default CustomDialog;