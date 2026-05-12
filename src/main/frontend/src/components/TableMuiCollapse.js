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
  tableCellClasses,
  Paper,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SelectMui from "../components/SelectMui";
import { styled } from "@mui/material/styles";

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

const TableMuiCollapse = ({
  rowData = [],
  hiddenColumns = [],
  collapseKey = null,
  collapseTitle = "상세 정보",
  renderCell,
  renderCollapse,
}) => {
  const rows = Array.isArray(rowData) ? rowData : [rowData];

  const tableColumns =
    rows.length > 0
      ? Object.keys(rows[0]).filter((column) => !hiddenColumns.includes(column))
        
      : [];

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            {tableColumns.map((column) => (
              <StyledTableCell key={column} align="right">
                {column}
              </StyledTableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, index) => (
            <CollapseRow
              key={index}
              row={row}
              tableColumns={tableColumns}
              collapseKey={collapseKey}
              collapseTitle={collapseTitle}
              renderCell={renderCell}
              renderCollapse={renderCollapse}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const DefaultCollapseTable = ({ data, visibleColumns = [] }) => {
  if (!data) return null;

  const rows = Array.isArray(data) ? data : [data];

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          {visibleColumns.map((column) => (
            <TableCell key={column}>{column}</TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index}>
            {visibleColumns.map((column) => (
              <TableCell key={column}>{row[column]}</TableCell>
            ))}
          </TableRow>
        ))}
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
}) => {
  const [open, setOpen] = useState(false);

  const collapseData = collapseKey ? row[collapseKey] : null;

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

  return (
    <>
      <StyledTableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        {tableColumns.map((column) => (
          <StyledTableCell key={column} align="right">
            {renderCell ? renderCell(row, column) : renderValue(row[column])}
          </StyledTableCell>
        ))}
      </StyledTableRow>

      <TableRow>
        <TableCell
          colSpan={tableColumns.length + 1}
          sx={{ paddingBottom: 0, paddingTop: 0 }}
        >
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
                  visibleColumns={[
                    "invoice_text",
                    "invoice_qty",
                    "invoice_price",
                    "line_total",
                  ]}
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