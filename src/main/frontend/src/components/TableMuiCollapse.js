import React, { useState } from "react";
import {
	Box,
	Collapse,
	IconButton,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Typography,
	Button,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { StyledTableCell, StyledTableRow, tableContainerSx } from "./tableMuiStyles";

/**
 * 접이식 상세 Row를 지원하는 공통 Table 컴포넌트
 *
 * MUI Table을 기반으로 만든 Collapse Table 컴포넌트입니다.
 * 기본 Row를 클릭해 선택할 수 있으며, 화살표 버튼을 통해 하위 상세 영역을 펼치거나 접을 수 있습니다.
 * hiddenColumns로 특정 컬럼을 숨길 수 있고, columns를 통해 헤더명을 별도로 지정할 수 있습니다.
 * renderCell, renderCollapse를 전달하면 셀 출력 방식과 상세 영역 렌더링 방식을 직접 커스터마이징할 수 있습니다.
 *
 * @param {Object} props
 * @param {Object[] | Object} [props.rowData=[]] 테이블에 표시할 데이터 배열 또는 단일 객체
 * @param {string[]} [props.hiddenColumns=[]] 테이블에서 숨길 컬럼 key 목록
 * @param {string[]} [props.columns=[]] 테이블 헤더에 표시할 이름 목록
 * @param {string|null} [props.collapseKey=null] 상세 영역에 표시할 하위 데이터 key
 * @param {string} [props.collapseTitle="상세 정보"] Collapse 영역 상단에 표시할 제목
 * @param {Function} [props.renderCell] 일반 셀 값을 커스텀 렌더링하는 함수
 * @param {Function} [props.renderCollapse] Collapse 상세 영역을 커스텀 렌더링하는 함수
 * @param {Object|null} [props.selectedRow] 현재 선택된 Row 데이터를 담는 state
 * @param {Function} [props.setSelectedRow] 선택된 Row 데이터를 변경하는 setState 함수
 * @param {Object[]} [props.buttonData=[]] 각 Row 오른쪽에 표시할 버튼 설정 목록
 * @param {string} props.buttonData[].key 버튼 컬럼 key
 * @param {string} props.buttonData[].title 버튼 컬럼 헤더 이름
 * @param {React.ReactNode} props.buttonData[].icon 버튼 내부에 표시할 아이콘 또는 내용
 * @param {Function} props.buttonData[].onClick 버튼 클릭 시 실행할 함수
 * @param {"text" | "outlined" | "contained"} [props.buttonData[].variant] 버튼 형태
 * @param {"primary" | "secondary" | "success" | "error" | "info" | "warning" | "inherit"} [props.buttonData[].color] 버튼 색상
 * @param {string[]} [props.collapseColumns] 기본 Collapse Table에 표시할 상세 데이터 key 목록
 * @param {string[]} [props.collapseColumnLabels=[]] 기본 Collapse Table의 상세 컬럼 헤더 이름 목록
 *
 * @returns {JSX.Element} Row 펼침/접힘, Row 선택, 상세 정보 표시를 지원하는 테이블 UI
 */
const TableMuiCollapse = ({
	rowData = [],
	hiddenColumns = [],
	columns = [],
	collapseKey = null,
	collapseTitle = "상세 정보",
	renderCell,
	renderCollapse,
	selectedRow,
	setSelectedRow,
	buttonData = [],
	collapseColumns,
	collapseColumnLabels = [],
}) => {
	const rows = Array.isArray(rowData) ? rowData : [rowData];

	const tableColumns =
		rows.length > 0
			? Object.keys(rows[0]).filter((column) => !hiddenColumns.includes(column))
			: [];

	return (
		<TableContainer component={Paper} sx={tableContainerSx}>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell />
						{tableColumns.map((column, index) => (
							<StyledTableCell key={column} align="right">
								{columns[index] || column}
							</StyledTableCell>
						))}
						{buttonData.map((data) => (
							<StyledTableCell key={data.key} align="right">
								{data.title}
							</StyledTableCell>
						))}
					</TableRow>
				</TableHead>

				<TableBody>
					{rows.map((row, index) => {
						const isSelected = selectedRow?.rowIndex === index;
						return (
							<CollapseRow
								key={index}
								row={row}
								tableColumns={tableColumns}
								collapseKey={collapseKey}
								collapseTitle={collapseTitle}
								renderCell={renderCell}
								renderCollapse={renderCollapse}
								collapseColumns={collapseColumns}
								collapseColumnLabels={collapseColumnLabels}
								onClickCollapseRow={() => {
									if (!setSelectedRow || setSelectedRow === null) return;
									setSelectedRow({ ...row, rowIndex: index });
								}}
								setSelectedRow={setSelectedRow}
								isSelected={isSelected}
								buttonData={buttonData}
							/>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

const DefaultCollapseTable = ({
	data,
	visibleColumns = [],
	columnLabels = [],
}) => {
	if (!data) return null;

	const rows = Array.isArray(data) ? data : [data];

	return (
		<Table size="small">
			<TableHead>
				<TableRow>
					{visibleColumns.map((column, index) => {
						return <TableCell key={column}>{columnLabels[index] || column}</TableCell>;
					})}
				</TableRow>
			</TableHead>

			<TableBody>
				{rows.map((row, index) => {
					return (
						<TableRow key={index} onClick={() => {}}>
							{visibleColumns.map((column) => (
								<StyledTableCell key={column}>{row[column]}</StyledTableCell>
							))}
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
};

const CollapseRow = ({
	row,
	tableColumns,
	collapseKey,
	collapseTitle,
	renderCell,
	renderCollapse,
	collapseColumns,
	collapseColumnLabels,
	onClickCollapseRow,
	isSelected,
	setSelectedRow,
	buttonData = [],
}) => {
	const [open, setOpen] = useState(false);

	const collapseData = collapseKey ? row[collapseKey] : null;
	const visibleCollapseColumns = collapseColumns || [
		"invoice_text",
		"invoice_qty",
		"invoice_price",
		"line_total",
	];

	const renderValue = (value) => {
		if (value == null) return "";

		if (Array.isArray(value)) {
			return value.join(", ");
		}

		if (typeof value === "object") {
			return JSON.stringify(value);
		}

		return value;
	};

	const colCount = tableColumns.length + 1 + buttonData.length

	return (
		<>
			<StyledTableRow>
				<StyledTableCell
					sx={{
						backgroundColor: isSelected ? "#b0d2ec !important" : undefined,
						cursor: setSelectedRow ? "pointer" : "default",
					}}>
					<IconButton size="small" onClick={() => setOpen(!open)}>
						{open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
					</IconButton>
				</StyledTableCell>

				{tableColumns.map((column) => {
					return (
						<StyledTableCell
							key={column}
							align="right"
							onClick={onClickCollapseRow}
							sx={{
								backgroundColor: isSelected ? "#b0d2ec !important" : undefined,
								cursor: setSelectedRow ? "pointer" : "default",
							}}>
							{renderCell ? renderCell(row, column) : renderValue(row[column])}
						</StyledTableCell>
					);
				})}

				{buttonData.map((data) => (
					<StyledTableCell
						key={`${data.key}__row_cell`}
						align="center"
						
						sx={{
							backgroundColor: isSelected ? "#b0d2ec !important" : undefined,
							cursor: setSelectedRow ? "pointer" : "default",
						}}>
						<Button color={data.color} variant={data.variant} onClick={() => data.onClick(row)}>
							{data.icon}
						</Button>
					</StyledTableCell>
				))}
			</StyledTableRow>

			<TableRow>
				<TableCell
					colSpan={colCount}
					sx={{ paddingBottom: 0, paddingTop: 0 }}>
					<Collapse in={open} timeout="auto" unmountOnExit>
						<Box sx={{ margin: 2 }}>
							<Typography variant="h6" gutterBottom>
								{collapseTitle}
							</Typography>

							{renderCollapse ? (
								renderCollapse(row)
							) : (
								<DefaultCollapseTable
									data={collapseData}
									visibleColumns={visibleCollapseColumns}
									columnLabels={collapseColumnLabels}
								/>
							)}
						</Box>
					</Collapse>
				</TableCell>
			</TableRow>
		</>
	);
};

export default TableMuiCollapse;
