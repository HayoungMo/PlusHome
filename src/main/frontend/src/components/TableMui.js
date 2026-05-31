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
 * 공통 Table 컴포넌트
 *
 * MUI Table을 기반으로 만든 공통 테이블 컴포넌트입니다.
 * rowData와 col을 기준으로 데이터를 출력하며,
 * columns를 전달하면 실제 데이터 key 대신 사용자 지정 헤더명을 표시할 수 있습니다.
 * Row 선택, Row 클릭 이벤트, Row별 버튼 출력, 페이지네이션 기능을 지원합니다.
 *
 * @param {Object} props
 * @param {Object[]} [props.rowData=[]] 테이블에 표시할 데이터 배열
 * @param {string[]} [props.col=[]] 테이블에 출력할 실제 데이터 key 목록
 * @param {string[]} [props.columns=[]] 테이블 헤더에 표시할 이름 목록
 * @param {Object|null} [props.selectedRow=null] 현재 선택된 Row 데이터를 담는 state
 * @param {Function|null} [props.setSelectedRow=null] 선택된 Row 데이터를 변경하는 setState 함수
 * @param {Function|null} [props.onRowClick=null] Row 클릭 시 실행할 함수
 * @param {Object[]} [props.buttonData=[]] 각 Row 오른쪽에 표시할 버튼 설정 목록
 * @param {string} props.buttonData[].title 버튼에 표시할 텍스트
 * @param {Function} props.buttonData[].onClick 버튼 클릭 시 실행할 함수
 * @param {"text" | "outlined" | "contained"} [props.buttonData[].variant] 버튼 형태
 * @param {"primary" | "secondary" | "success" | "error" | "info" | "warning" | "inherit"} [props.buttonData[].color] 버튼 색상
 * @param {boolean} [props.buttonData[].disabled] 버튼 비활성화 여부
 * @param {string[]} [props.buttonCol=[]] 버튼 컬럼 key 목록
 * @param {string[]} [props.buttonColumns=[]] 버튼 컬럼 헤더 이름 목록
 * @param {number} [props.defaultRowPerPage=10] 페이지네이션 사용 시 기본 페이지당 행 수
 * @param {any} [props.resetPageKey] 값이 변경될 때 페이지를 0번으로 초기화하는 기준 값
 * @param {boolean} [props.pagination=false] 페이지네이션 사용 여부
 *
 * @returns {JSX.Element} 데이터 출력, Row 선택, 버튼, 페이지네이션을 지원하는 테이블 UI
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
												disabled={column.disabled}
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
