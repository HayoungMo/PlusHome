import { styled } from "@mui/material/styles";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

export const StyledTableCell = styled(TableCell)(() => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: "#f8fafc",
		color: "#334155",
		fontSize: 13,
		fontWeight: 800,
		lineHeight: 1.4,
		padding: "14px 18px",
		borderBottom: "1px solid #d8dee8",
		whiteSpace: "nowrap",
	},

	[`&.${tableCellClasses.body}`]: {
		fontSize: 14,
		fontWeight: 600,
		lineHeight: 1.45,
		padding: "14px 18px",
		color: "#475569",
		borderBottom: "1px solid #e5eaf2",
		verticalAlign: "middle",
	},
}));

export const StyledTableRow = styled(TableRow)(() => ({
	"&:nth-of-type(odd)": {
		backgroundColor: "#ffffff",
	},

	"&:nth-of-type(even)": {
		backgroundColor: "#fbfdff",
	},

	"&:hover": {
		backgroundColor: "#eff6ff",
	},

	"&:last-child td, &:last-child th": {
		border: 0,
	},
}));

export const tableContainerSx = {
	borderRadius: "8px",
	border: "1px solid #d8dee8",
	boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
	overflow: "auto",
	backgroundColor: "#ffffff",
	"& .MuiCheckbox-root": {
		color: "#94a3b8",
	},
	"& .MuiCheckbox-root.Mui-checked, & .MuiCheckbox-root.MuiCheckbox-indeterminate": {
		color: "#1d4ed8",
	},
	"& .MuiTablePagination-root": {
		borderTop: "1px solid #e5eaf2",
		color: "#475569",
	},
	"& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
		fontSize: 13,
		fontWeight: 700,
	},
	"& .MuiButton-root": {
		borderRadius: "6px",
		fontWeight: 700,
		boxShadow: "none",
	},
};
