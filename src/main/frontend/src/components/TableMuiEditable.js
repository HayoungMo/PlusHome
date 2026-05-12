import { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import { Checkbox } from "@mui/material";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: "#1e89be",
		color: "#fff",
		fontSize: 15,
		fontWeight: 700,
		padding: "14px 16px",
		borderBottom: "2px solid #1b5069",
	},

	[`&.${tableCellClasses.body}`]: {
		fontSize: 14,
		padding: "12px 16px",
		color: "#333",
		borderBottom: "1px solid #e0e0e0",
	},
}));

const StyledTableRow = styled(TableRow)(() => ({
	"&:nth-of-type(odd)": {
		backgroundColor: "#fafafa",
	},

	"&:hover": {
		backgroundColor: "#f1f8ff",
	},

	"&:last-child td, &:last-child th": {
		border: 0,
	},
}));

const TableMuiEditable = ({
	rowData = [],
	columns = [],
	onChange,
	updateAvailable = true,
	readOnlyColumns = [],
	// -- CheckBox
	selectable = false,
	selectedRows = [],
	onSelectionChange,
	getRowKey = (row, index) => row.id || index,
}) => {
	const [rows, setRows] = useState(rowData);
	const [editingCell, setEditingCell] = useState(null);
	const [editValue, setEditValue] = useState("");

	const tableColumns = rows.length > 0 ? Object.keys(rows[0]) : [];

	const handleDoubleClick = (rowIndex, column, value) => {
		if (!updateAvailable) return;

		if (editingCell) return;

		setEditingCell({ rowIndex, column });
		setEditValue(value ?? "");
	};

	const handleSave = () => {
		if (!editingCell) return;

		const { rowIndex, column } = editingCell;

		const updatedRows = rows.map((row, index) => {
			if (index !== rowIndex) return row;

			return {
				...row,
				[column]: editValue,
			};
		});

		setRows(updatedRows);
		setEditingCell(null);

		if (onChange) {
			onChange(updatedRows);
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			handleSave();
		}

		if (e.key === "Escape") {
			setEditingCell(null);
		}
	};

	const handleSelectRow = (row, rowIndex) => {
		const rowKey = getRowKey(row, rowIndex);

		const newSelectedRows = selectedRows.includes(rowKey)
			? selectedRows.filter((key) => key !== rowKey)
			: [...selectedRows, rowKey];

		onSelectionChange?.(newSelectedRows);
	};

	const handleSelectAll = () => {
		const allRowKeys = rows.map((row, index) => getRowKey(row, index));

		const isAllSelected =
			allRowKeys.length > 0 && allRowKeys.every((key) => selectedRows.includes(key));

		const newSelectedRows = isAllSelected ? [] : allRowKeys;

		onSelectionChange?.(newSelectedRows);
	};

	useEffect(() => {
		if (Array.isArray(rowData)) {
			setRows(rowData);
		}
	}, [rowData]);

	return (
		<TableContainer
			component={Paper}
			sx={{
				boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
				overflow: "hidden",
			}}>
			<Table sx={{ minWidth: 650 }} aria-label="editable table">
				<TableHead>
					<TableRow>
						{selectable && (
							<StyledTableCell padding="checkbox" align="center">
								<Checkbox
									checked={
										rows.length > 0 &&
										rows.every((row, index) =>
											selectedRows.includes(getRowKey(row, index)),
										)
									}
									indeterminate={
										selectedRows.length > 0 &&
										!rows.every((row, index) =>
											selectedRows.includes(getRowKey(row, index)),
										)
									}
									onChange={handleSelectAll}
								/>
							</StyledTableCell>
						)}
						{tableColumns.map((column, index) => (
							<StyledTableCell key={column} align="right">
								{columns.length > 0 ? columns[index] : column}
							</StyledTableCell>
						))}
					</TableRow>
				</TableHead>

				<TableBody>
					{rows.map((row, rowIndex) => {
						const rowKey = getRowKey(row, rowIndex);
						const isSelected = selectedRows.includes(rowKey);

						return (
							<StyledTableRow key={row.id || rowIndex}>
								{selectable && (
									<StyledTableCell padding="checkbox" align="center">
										<Checkbox
											checked={isSelected}
											onChange={() => handleSelectRow(row, rowIndex)}
											onDoubleClick={(e) => e.stopPropagation()}
										/>
									</StyledTableCell>
								)}
								{tableColumns.map((column) => {
									const isReadOnly = readOnlyColumns.includes(column);

									const isEditing =
										editingCell?.rowIndex === rowIndex &&
										editingCell?.column === column;

									return (
										<StyledTableCell
											key={column}
											align="right"
											onDoubleClick={() => {
												if (isReadOnly) return;
												handleDoubleClick(rowIndex, column, row[column]);
											}}
											sx={{
												cursor: isReadOnly
													? "default"
													: updateAvailable
														? "pointer"
														: "default",
											}}>
											{isEditing && updateAvailable ? (
												<TextField
													value={editValue}
													onChange={(e) => setEditValue(e.target.value)}
													onBlur={handleSave}
													onKeyDown={handleKeyDown}
													onDoubleClick={(e) => e.stopPropagation()}
													size="small"
													autoFocus
													variant="standard"
												/>
											) : (
												row[column]
											)}
										</StyledTableCell>
									);
								})}
							</StyledTableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default TableMuiEditable;
