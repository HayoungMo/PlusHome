import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import { useEffect, useState } from "react";
import { TablePagination } from "@mui/material";
import { StyledTableCell, StyledTableRow, tableContainerSx } from "./tableMuiStyles";

const TableCheckBoxMui = (props) => {
	const {
		rowData = [],
		columns = [],
		col = [],
		checkedList,
		setCheckedList,
		rowKey = null,
		defaultRowPerPage = 10,
		resetPageKey,
		onRowClick = null,
		pagination = false,
		selectedRow = null,
		setSelectedRow = null,
	} = props;

	const tableColumns =
		col.length === 0 ? (rowData.length > 0 ? Object.keys(rowData[0]) : []) : col;

	const getRowKey = (row) => {
		const checkBoxKey = rowKey === null ? row.c_code : row[rowKey];
		return checkBoxKey;
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

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(defaultRowPerPage);

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	useEffect(() => {
		setPage(0);
	}, [resetPageKey]);

	useEffect(() => {
		if (page > 0 && page * rowsPerPage >= rowData.length) {
			setPage(0);
		}
	}, [rowData.length, page, rowsPerPage]);

	const pagedRowData = rowData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

	const visibleRowData = pagination ? pagedRowData : rowData;

	return (
		<TableContainer
			component={Paper}
			sx={tableContainerSx}>
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
					{visibleRowData.map((row, rowIndex) => {
						const realRowIndex = page * rowsPerPage + rowIndex;
						const isSelected = selectedRow?.rowIndex === realRowIndex;
						const rowKey = getRowKey(row, rowIndex);
						const isChecked = checkedList.includes(rowKey);

						return (
							<StyledTableRow
								onClick={() => {
									const selectedRowData = { ...row, rowIndex: realRowIndex };
									if (setSelectedRow) {
										setSelectedRow(isSelected ? {} : selectedRowData);
									}
									if (onRowClick) onRowClick(isSelected ? {} : selectedRowData);
								}}
								// ------
								key={
									row.f_code
										? `${row.f_code}__${realRowIndex}`
										: `${row.id}__${realRowIndex}` || realRowIndex
								}
								sx={{
									backgroundColor: isSelected ? "#b0d2ec !important" : undefined,
									cursor: setSelectedRow ? "pointer" : "default",
								}}>
								<StyledTableCell align="center">
									<Checkbox
										checked={isChecked}
										onChange={(event) => handleRowCheck(event, row, rowIndex)}
									/>
								</StyledTableCell>
								{tableColumns.map((column) => {
									return (
										<StyledTableCell key={column} align="right">
											{row[column]}
										</StyledTableCell>
									);
								})}
							</StyledTableRow>
						);
					})}
				</TableBody>
			</Table>
			{pagination && (
				<TablePagination
					component="div"
					count={rowData.length}
					page={page}
					onPageChange={handleChangePage}
					rowsPerPage={rowsPerPage}
					onRowsPerPageChange={handleChangeRowsPerPage}
					rowsPerPageOptions={[5, 10, 25, 50]}
					labelRowsPerPage="페이지당 행 수"
					labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 총 ${count}개`}
				/>
			)}
		</TableContainer>
	);
};

export default TableCheckBoxMui;
