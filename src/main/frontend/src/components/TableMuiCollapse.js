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

const TableMuiCollapse = ({ rowData, updateBookingRow }) => {
  const rows = Array.isArray(rowData) ? rowData : [rowData];
  const tableColumns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            {tableColumns.map((column) => (
              <StyledTableCell key={column} align="right">
                {column === "b_answer" ? null : column}
              </StyledTableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, index) => (
            <BookingRow
              row={row}
              tableColumns={tableColumns}
              updateBookingRow
            ={updateBookingRow}/>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const BookingRow = ({ row, tableColumns, updateBookingRow }) => {
  const [open, setOpen] = useState(false);

  const statusOption = [
    { value: "confirmed", title: "확정" },
    { value: "working", title: "시공 중" },
    { value: "done", title: "시공 완료" },
    { value: "cancel", title: "상담 중단" },
  ];

    const kindOption = [
      {
        value: "byTel",
        title: "전화상담",
      },
      {
        value: "byKakaoTalk",
        title: "카톡",
      },
      {
        value: "byemail",
        title: "이메일",
      },
      {
        value: "byVisit",
        title: "직접방문",
      },
    ];

  let answer = {};
  try {
    answer = row.b_answer ? JSON.parse(row.b_answer) : {};
  } catch (e) {
    answer = {};
  }

  const answerColumns = Object.keys(answer);

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
            {(() => {
              if (column === "b_answer") {
                return null;
              }

              if (column === "b_status") {
                if (row[column] === "pending" || row[column] === "quoting") {
                  return <p>견적서 작성 중</p>;
                }

                if (updateBookingRow) {
                  return (
                    <SelectMui
                      label="상태"
                      name="b_status"
                      value={row[column]}
                      option={statusOption}
                      onChange={(e) => updateBookingRow(row, e.target.value)}
                    />
                  );
                }

                return statusOption.find((item) => item.value === row[column])
                  ?.title;
              }

              if (column === "b_kind") {
                return kindOption.find((item) => item.value === row[column])
                  ?.title;
              }

              return row[column];
            })()}
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
                상담 상세 정보
              </Typography>

              <Table size="small">
                {answerColumns.map((column) => (
                  <TableRow>
                    <TableCell>{column}</TableCell>
                    <TableCell>
                      {Array.isArray(answer[column])
                        ? answer[column].join(", ")
                        : answer[column]}
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default TableMuiCollapse;
