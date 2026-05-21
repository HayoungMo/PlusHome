import { Dialog, DialogContent } from "@mui/material";

const DialogInside = ({
  open,
  onClose,
  children,
  maxWidth,
  fullWidth,
  contentClassName,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      <DialogContent className={contentClassName}>{children}</DialogContent>
    </Dialog>
  );
};

export default DialogInside;
