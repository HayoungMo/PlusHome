import { Dialog, DialogContent } from "@mui/material";

const DialogInside = ({
  open,
  onClose,
  children,
  maxWidth,
  fullWidth,
  contentClassName,
  disableBackdropClose = false,
}) => {
  const handleClose = (event, reason) => {
    if (disableBackdropClose && reason === "backdropClick") return;
    onClose?.(event, reason);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
    >
      <DialogContent className={contentClassName}>{children}</DialogContent>
    </Dialog>
  );
};

export default DialogInside;
