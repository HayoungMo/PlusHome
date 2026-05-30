import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import { StyledTableCell, StyledTableRow, tableContainerSx } from "./tableMuiStyles";

/**
 * 인라인 셀 수정이 가능한 공통 Table 컴포넌트
 *
 * MUI Table을 기반으로 만든 수정 가능한 테이블 컴포넌트입니다.
 * Row 클릭 시 선택 상태를 저장할 수 있으며,
 * 셀을 더블클릭하면 TextField로 전환되어 값을 수정할 수 있습니다.
 *
 * updateAvailable이 false이면 셀 수정이 비활성화되며,
 * readOnlyColumns에 포함된 컬럼은 수정 대상에서 제외됩니다.
 * 수정된 데이터는 내부 rows state에 반영되고, onChange를 통해 부모 컴포넌트로 전달됩니다.
 *
 * @param {Object} props
 * @param {Object[]} [props.rowData=[]] 테이블에 표시할 데이터 배열
 * @param {string[]} [props.columns=[]] 테이블 헤더에 표시할 이름 목록
 * @param {Object|null} [props.selectedRow=null] 현재 선택된 Row 데이터를 담는 state
 * @param {Function|null} [props.setSelectedRow=null] 선택된 Row 데이터를 변경하는 setState 함수
 * @param {Function} [props.onChange] 셀 수정 후 변경된 전체 rows 배열을 전달받는 함수
 * @param {boolean} [props.updateAvailable=true] 셀 수정 가능 여부
 * @param {string[]} [props.readOnlyColumns=[]] 수정할 수 없는 컬럼 key 목록
 *
 * @returns {JSX.Element} Row 선택과 인라인 셀 수정을 지원하는 테이블 UI
 */
const TableMuiEditable = ({
  rowData = [],
  columns = [],
  selectedRow = null,
  setSelectedRow = null,
  onChange,
  updateAvailable = true,
  readOnlyColumns = [],
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

  useEffect(() => {
    if (Array.isArray(rowData)) {
      setRows(rowData);
    }
  }, [rowData]);

  return (
    <TableContainer
      component={Paper}
      sx={tableContainerSx}
    >
      <Table sx={{ minWidth: 650 }} aria-label="editable table">
        <TableHead>
          <TableRow>
            {tableColumns.map((column, index) => (
              <StyledTableCell key={column} align="right">
                {columns.length > 0 ? columns[index] : column}
              </StyledTableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, rowIndex) => {
            const realRowIndex = rowIndex;
            const isSelected = selectedRow?.rowIndex === realRowIndex;

            return (
              <StyledTableRow
                onClick={() => {
                  const selectedRowData = { ...row, rowIndex: realRowIndex };
                  if (setSelectedRow) setSelectedRow(selectedRowData);
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
								}}
              >
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
                      }}
                    >
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
