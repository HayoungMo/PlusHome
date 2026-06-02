import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import { StyledTableCell, StyledTableRow, tableContainerSx } from "./tableMuiStyles";
import { useEffect, useState } from "react";
import { TablePagination } from "@mui/material";

/**
 * 체크박스 선택 기능이 포함된 공통 Table 컴포넌트
 *
 * MUI Table을 기반으로 만든 체크박스 테이블 컴포넌트입니다.
 * 전체 선택, 개별 Row 선택, Row 클릭 선택, 일부 컬럼 인라인 수정, 페이지네이션 기능을 지원합니다.
 *
 * pagination이 true일 경우 현재 페이지에 해당하는 데이터만 렌더링하며,
 * page와 rowsPerPage를 기준으로 visibleRowData를 계산합니다.
 * Row 선택 시에는 페이지네이션 중에도 전체 데이터 기준 위치를 유지하기 위해 realRowIndex를 함께 저장합니다.
 *
 * selectedKeys는 체크박스로 선택된 Row의 key 목록을 관리하며,
 * selectedRow는 클릭으로 선택된 단일 Row 데이터를 관리합니다.
 *
 * @param {Object} props
 * @param {Object[]} [props.rowData=[]] 테이블에 표시할 전체 데이터 배열
 * @param {string[]} [props.columns=[]] 테이블에 표시할 컬럼 key 목록. 값이 없으면 rowData 첫 번째 객체의 key를 사용
 * @param {Array<string | number>} [props.selectedKeys=[]] 체크박스로 선택된 Row key 목록
 * @param {Function} [props.setSelectedKeys] 체크박스로 선택된 Row key 목록을 변경하는 setState 함수
 * @param {Object|null} [props.selectedRow=null] 클릭으로 선택된 Row 데이터를 담는 state
 * @param {Function|null} [props.setSelectedRow=null] 클릭으로 선택된 Row 데이터를 변경하는 setState 함수
 * @param {Function} [props.editableOnChange] 셀 수정 후 변경된 전체 rowData 배열을 전달받는 함수
 * @param {boolean} [props.editable=false] 셀 수정 가능 여부
 * @param {Function} [props.onRowClick] Row 클릭 시 실행할 함수
 * @param {any} [props.resetPageKey] 값이 변경될 때 페이지를 0번으로 초기화하는 기준 값
 * @param {number} [props.defaultRowPerPage=10] 페이지네이션 사용 시 기본 페이지당 행 수
 * @param {boolean} [props.pagination=false] 페이지네이션 사용 여부
 *
 * @returns {JSX.Element} 체크박스 선택, Row 선택, 셀 수정, 페이지네이션을 지원하는 테이블 UI
 */
const TableChkMui = (props) => {
	const {
		rowData = [],
		columns = [],
		col=[],
		selectedKeys = [],
		setSelectedKeys,
		selectedRow = null,
		setSelectedRow = null,
		editableOnChange,
		editable = false,
		onRowClick,
		resetPageKey,
		defaultRowPerPage = 10,
		pagination = false,
	} = props;

	const tableColumns =
		columns.length > 0 ? columns : rowData.length > 0 ? Object.keys(rowData[0]) : [];

	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(defaultRowPerPage);

	const getRowKey = (row, index) => {
		return row.id ?? row.coupon_code ?? row.f_code ?? row.c_code ?? index;
	};

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

	const visibleRowKeys = visibleRowData.map((row, rowIndex) => {
		const realRowIndex = pagination ? page * rowsPerPage + rowIndex : rowIndex;
		return getRowKey(row, realRowIndex);
	});

	const isAllSelected =
		visibleRowKeys.length > 0 &&
		visibleRowKeys.every((rowKey) => selectedKeys.includes(rowKey));

	const isIndeterminate =
		visibleRowKeys.some((rowKey) => selectedKeys.includes(rowKey)) && !isAllSelected;

	// 현재 페이지 전체 선택
	const handleSelectAll = (event) => {
		if (!setSelectedKeys) return;

		if (event.target.checked) {
			setSelectedKeys((prev) => Array.from(new Set([...prev, ...visibleRowKeys])));
		} else {
			setSelectedKeys((prev) =>
				prev.filter((selectedKey) => !visibleRowKeys.includes(selectedKey)),
			);
		}
	};

	// 개별 선택
	const handleSelectRow = (rowKey) => {
		if (!setSelectedKeys) return;

		setSelectedKeys((prev) =>
			prev.includes(rowKey) ? prev.filter((item) => item !== rowKey) : [...prev, rowKey],
		);
	};

	// 셀 수정 함수
	const handleCellEdit = (rowKey, column, value) => {
		const updateData = rowData.map((row, rowIndex) => {
			const targetRowKey = getRowKey(row, rowIndex);

			if (targetRowKey === rowKey) {
				return {
					...row,
					[column]: value,
				};
			}

			return row;
		});

		editableOnChange?.(updateData);
	};

	const editableColumns = [
		"name",
		"tel",
		"addr",
		"email",
		"gender",
		"c_name",
		"c_kind",
		"c_info",
		"c_boss",
	];

	return (
		<TableContainer component={Paper} sx={tableContainerSx}>
			<Table sx={{ minWidth: 1200 }} aria-label="checkbox table">
				<TableHead>
					<TableRow>
						<StyledTableCell padding="checkbox">
							<Checkbox
								checked={isAllSelected}
								indeterminate={isIndeterminate}
								onChange={handleSelectAll}
								disabled={visibleRowData.length === 0 || !setSelectedKeys}
							/>
						</StyledTableCell>

						{tableColumns.map((column,index) => (
							<StyledTableCell key={column} align="right">
								{col[index]}
							</StyledTableCell>
						))}
					</TableRow>
				</TableHead>

				<TableBody>
					{visibleRowData.map((row, rowIndex) => {
						const realRowIndex = pagination ? page * rowsPerPage + rowIndex : rowIndex;

						const rowKey = getRowKey(row, realRowIndex);
						const isChecked = selectedKeys.includes(rowKey);
						const isRowSelected = selectedRow?.rowIndex === realRowIndex;

						return (
							<StyledTableRow
								key={`${rowKey}-${realRowIndex}`}
								onClick={() => {
									const selectedRowData = {
										...row,
										rowIndex: realRowIndex,
										rowKey,
									};

									if (setSelectedRow) {
										setSelectedRow(isRowSelected ? {} : selectedRowData);
									}

									if (onRowClick) {
										onRowClick(isRowSelected ? {} : selectedRowData);
									}
								}}
								sx={{
									backgroundColor: isRowSelected
										? "#b0d2ec !important"
										: undefined,
									cursor: setSelectedRow || onRowClick ? "pointer" : "default",
								}}>
								<StyledTableCell padding="checkbox">
									<Checkbox
										checked={isChecked}
										onClick={(event) => event.stopPropagation()}
										onChange={() => handleSelectRow(rowKey)}
										disabled={!setSelectedKeys}
									/>
								</StyledTableCell>

								{tableColumns.map((column) => (
									<StyledTableCell key={column} align="right">
										{editableColumns.includes(column) ? (
											<div
												contentEditable={editable}
												suppressContentEditableWarning={true}
												onBlur={(event) =>
													handleCellEdit(
														rowKey,
														column,
														event.target.innerText,
													)
												}
												style={{
													outline: editable
														? "1px solid #90caf9"
														: "none",
													padding: "4px",
													borderRadius: "4px",
													minWidth: "80px",
												}}>
												{row[column]}
											</div>
										) : (
											row[column]
										)}
									</StyledTableCell>
								))}
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

export default TableChkMui;
