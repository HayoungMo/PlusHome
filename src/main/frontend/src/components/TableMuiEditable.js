import { useEffect, useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import { StyledTableCell, StyledTableRow, tableContainerSx } from "./tableMuiStyles";

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
