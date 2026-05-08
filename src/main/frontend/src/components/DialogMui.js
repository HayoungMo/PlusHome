import React from "react";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
} from "@mui/material";

const DialogMui = (props) => {
	const { open, onClose, title, text, buttons = [], maxWidth = "sm", fullWidth = false } = props;

	const handleClose = (event, reason) => {
		if (reason === "backdropClick") {
			return;
		}

		if (reason === "escapeKeyDown") {
			return;
		}

		onClose?.();
	};

	return (
		<Dialog onClose={handleClose} open={open} maxWidth={maxWidth} fullWidth={fullWidth}>
			{title && <DialogTitle>{title}</DialogTitle>}

			<DialogContent>
				<DialogContentText>{text}</DialogContentText>
			</DialogContent>

			<DialogActions>
				{buttons?.map((button) => (
					<Button
						key={button.title}
						onClick={button.onClick}
						color={button.color || "primary"}
						variant={button.variant || "text"}
						disabled={button.disabled}>
						{button.title}
					</Button>
				))}
			</DialogActions>
		</Dialog>
	);
};

export default DialogMui;
