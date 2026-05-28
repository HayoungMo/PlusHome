import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button, TablePagination } from "@mui/material";
import { useEffect, useState } from "react";
import { StyledTableCell, StyledTableRow, tableContainerSx } from "./tableMuiStyles";

/**
 * 테이블 컴포넌트
 * 
 * @param {Object} props
 * @param {Array} props.rowData 테이블 데이터
 * @param {string[]} props.col 실제 데이터 key 목록
 * @param {string[]} props.columns 헤더 이름
 * @param {state} props.selectedRow Row Select 활성화 및 선택할 Row Data를 담을 State
 * @param {state} props.setSelectedRow Row Select 활성화 및 선택할 Row Data를 Set 할 State
 * @param {object[]} props.buttonData 버튼을 Row에 넣을 경우 버튼 Data
 * @param {string[]} props.buttonCol 버튼 헤더 ( 반드시 버튼과 length 맞출것 )
 * @param {string[]} props.buttonColumns 버튼 헤더 이름 ( 반드시 버튼과 length 맞출것 )
 */
const TableMui = (props) => {
	const {
		rowData = [],
		columns = [],
		col = [],
		selectedRow = null,
		setSelectedRow = null,
		onRowClick = null,
		buttonData = [],
		buttonCol = [],
		buttonColumns = [],
		defaultRowPerPage = 10,
		resetPageKey,
		pagination = false,
	} = props;

	const tableColumns =
		col.length === 0 ? (rowData.length > 0 ? Object.keys(rowData[0]) : []) : col;

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
						{tableColumns.map((column, index) => (
							<StyledTableCell key={column} align="right">
								{columns.length > 0 ? columns[index] : column}
							</StyledTableCell>
						))}
						{buttonCol.map((column, index) => (
							<StyledTableCell key={column} align="center">
								{buttonColumns.length > 0 ? buttonColumns[index] : column}
							</StyledTableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{visibleRowData.map((row, rowIndex) => {
						const realRowIndex = page * rowsPerPage + rowIndex;
						const isSelected = selectedRow?.rowIndex === realRowIndex;

						return (
							<StyledTableRow
								onClick={() => {
									const selectedRowData = { ...row, rowIndex: realRowIndex };
									if (setSelectedRow) setSelectedRow(selectedRowData);
									if (onRowClick) onRowClick(selectedRowData);
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
								{tableColumns.map((column) => {
									return (
										<StyledTableCell key={column} align="right">
											{row[column]}
										</StyledTableCell>
									);
								})}
								{buttonData?.map((column) => {
									return (
										<StyledTableCell key={column} align="center">
											<Button
												variant={column.variant}
												color={column.color}
												onClick={() => column.onClick(row)}>
												{column.title}
											</Button>
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

export default TableMui;
