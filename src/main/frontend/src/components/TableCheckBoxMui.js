import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import { useState } from "react";

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

const StyledTableRow = styled(TableRow)(({ theme }) => ({
	"&:nth-of-type(odd)": {
		backgroundColor: "#fafafa",
	},

	"&:hover": {
		backgroundColor: "#f1f8ff",
		// cursor: "pointer",
	},

	"&:last-child td, &:last-child th": {
		border: 0,
	},
}));

const TableCheckBoxMui = (props) => {
	const { rowData = [], columns = [], col = [], checkedList, setCheckedList } = props;

	const tableColumns =
		col.length === 0 ? (rowData.length > 0 ? Object.keys(rowData[0]) : []) : col;

	const getRowKey = (row) => {
		return row.c_code;
	};

	const visibleKeys = rowData.map((row) => getRowKey(row));

	const visibleCheckedKeys = visibleKeys.filter((key) => checkedList.includes(key));

	const isAllChecked = rowData.length > 0 && visibleCheckedKeys.length === rowData.length;

	const isIndeterminate =
		visibleCheckedKeys.length > 0 && visibleCheckedKeys.length < rowData.length;

	const handleAllCheck = (event) => {
		if (event.target.checked) {
			setCheckedList((prev) => {
				const merged = [...prev, ...visibleKeys];
				return [...new Set(merged)];
			});
		} else {
			setCheckedList((prev) => prev.filter((key) => !visibleKeys.includes(key)));
		}
	};

	const handleRowCheck = (event, row, rowIndex) => {
		const rowKey = getRowKey(row);

		if (event.target.checked) {
			setCheckedList((prev) => [...new Set([...prev, rowKey])]);
		} else {
			setCheckedList((prev) => prev.filter((key) => key !== rowKey));
		}
	};

	return (
		<TableContainer
			component={Paper}
			sx={{
				boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
				overflow: "hidden",
			}}>
			<Table sx={{ minWidth: 650 }} aria-label="simple table">
				<TableHead>
					<TableRow>
						<StyledTableCell align="center" sx={{ width: 60 }}>
							<Checkbox
								checked={isAllChecked}
								indeterminate={isIndeterminate}
								onChange={handleAllCheck}
							/>
						</StyledTableCell>
						{tableColumns.map((column, index) => (
							<StyledTableCell key={column} align="right">
								{columns.length > 0 ? columns[index] : column}
							</StyledTableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{rowData.map((row, rowIndex) => {
						const rowKey = getRowKey(row, rowIndex);
						const isChecked = checkedList.includes(rowKey);
						return (
							<StyledTableRow key={row.id || rowIndex}>
								<StyledTableCell align="center">
									<Checkbox
										checked={isChecked}
										onChange={(event) => handleRowCheck(event, row, rowIndex)}
									/>
								</StyledTableCell>
								{tableColumns.map((column) => (
									<StyledTableCell key={column} align="right">
										{row[column]}
									</StyledTableCell>
								))}
							</StyledTableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default TableCheckBoxMui;
