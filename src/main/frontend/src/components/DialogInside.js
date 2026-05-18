import { Dialog, DialogContent } from "@mui/material";

const DialogInside = ({ open, onClose, children }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
};

export default DialogInside;
