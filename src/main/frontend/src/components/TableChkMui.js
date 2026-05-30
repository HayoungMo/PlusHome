import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import { StyledTableCell, StyledTableRow, tableContainerSx } from "./tableMuiStyles";
const TableChkMui = (props) => {

	console.log("테이블췤 렌더링")
    const {
		rowData = [],
		columns = [],
		selectedKeys = [],
		setSelectedKeys,
		editableOnChange,
		editable = false,
		onRowClick,
	} = props;
	

	const tableColumns = 
		columns.length>0
		? columns	
		:rowData.length > 0 ? Object.keys(rowData[0]) : [];

	// 전체 선택
	const handleSelectAll = (event) => {
		if (event.target.checked) {
			const allIds = rowData.map((row, index) => row.id || row.coupon_code|| index);

			setSelectedKeys(allIds);
		} else {
			setSelectedKeys([]);
		}
	};

	// 개별 선택
	const handleSelectRow = (id) => {
		setSelectedKeys((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
		);
	};

	// 전체 선택 여부
	const isAllSelected = rowData.length > 0 && selectedKeys.length === rowData.length;

	//수정함수 추가
	const handleCellEdit = (
		rowId,
		column,
		value
	) =>{
		const updateData = rowData.map((row)=>{
			if(row.id===rowId){
				return{
					...row,
					[column]: value,
				}
			}
			return row
		})
		editableOnChange?.(updateData)
	}

	const editableColumns = [
		"name",
		"tel",
		"addr",
		'email',
		"gender",
		"c_name",
		'c_kind',
		'c_info',
		'c_boss',

	]

	return (
		<TableContainer
			component={Paper}
			sx={tableContainerSx}>
			<Table sx={{ minWidth: 650 }} aria-label="simple table">
				<TableHead>
					<TableRow>
						{/* 체크박스 헤더 */}
						<StyledTableCell padding="checkbox">
							<Checkbox
								checked={isAllSelected}
								onChange={handleSelectAll}
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
						const rowId = row.id

						console.log("rowId",rowId)
						console.log("row 전체",row)

						const isSelected = selectedKeys.includes(rowId);

						return (
							<StyledTableRow key={`${rowId}-${rowIndex}`}
								onClick={()=>{
									if(onRowClick){
										onRowClick(row)
									}
								}}
							>
								{/* row 체크박스 */}
								<StyledTableCell padding="checkbox">
									<Checkbox
										checked={isSelected}
										onChange={() => handleSelectRow(rowId)}
									/>
								</StyledTableCell>

								{tableColumns.map((column) => (

									<StyledTableCell
										key={column}
										align="right">

											  {editableColumns.includes(column) ? (

                                            <div
                                                contentEditable={editable}
                                                suppressContentEditableWarning={true}
                                                onBlur={(e) =>
                                                    handleCellEdit(
                                                        row.id,
                                                        column,
                                                        e.target.innerText
                                                    )
                                                }
                                                style={{
                                                    outline: editable
                                                        ? "1px solid #90caf9"
                                                        : "none",
                                                    padding: "4px",
                                                    borderRadius: "4px",
                                                    minWidth: "80px",
                                                }}
                                            >
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
		</TableContainer>
	);
};

export default TableChkMui;
