import { styled } from "@mui/material/styles";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";

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
    },

    "&:last-child td, &:last-child th": {
        border: 0,
    },
}));
const TableChkMui = (props) => {
    const {
		rowData = [],
		columns = [],
		selectedKeys = [],
		setSelectedKeys,
		editableOnChange,
		editable = false
	} = props;

	const tableColumns = rowData.length > 0
		? Object.keys(rowData[0])
		: [];

	// 전체 선택
	const handleSelectAll = (event) => {

		if (event.target.checked) {

			const allIds = rowData.map(
				(row, index) => row.id || index
			);

			setSelectedKeys(allIds);

		} else {

			setSelectedKeys([]);

		}
	};

	// 개별 선택
	const handleSelectRow = (id) => {

		setSelectedKeys((prev) =>

			prev.includes(id)
				? prev.filter((item) => item !== id)
				: [...prev, id]
		);
	};

	// 전체 선택 여부
	const isAllSelected =
		rowData.length > 0 &&
		selectedKeys.length === rowData.length;

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

	]

	return (
		<TableContainer
			component={Paper}
			sx={{
				boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
				overflow: "hidden",
			}}>

			<Table
				sx={{ minWidth: 650 }}
				aria-label="simple table">

				<TableHead>

					<TableRow>

						{/* 체크박스 헤더 */}
						<StyledTableCell padding="checkbox">

							<Checkbox
								checked={isAllSelected}
								onChange={handleSelectAll}
								sx={{
									color: "#fff",
									"&.Mui-checked": {
										color: "#fff",
									},
								}}
							/>

						</StyledTableCell>

						{tableColumns.map((column, index) => (

							<StyledTableCell
								key={column}
								align="right">

								{
									columns.length > 0
										? columns[index]
										: column
								}

							</StyledTableCell>
						))}
					</TableRow>

				</TableHead>

				<TableBody>

					{rowData.map((row, rowIndex) => {

						const rowId = row.id || rowIndex;

						const isSelected =
							selectedKeys.includes(rowId);

						return (

							<StyledTableRow key={rowId}>

								{/* row 체크박스 */}
								<StyledTableCell padding="checkbox">

									<Checkbox
										checked={isSelected}
										onChange={() =>
											handleSelectRow(rowId)
										}
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

export default TableChkMui
