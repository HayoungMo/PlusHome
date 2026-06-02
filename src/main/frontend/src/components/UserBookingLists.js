import React, { useEffect, useState } from "react";
import InteriorUserService from "../service/interiorUserService";
import InteriorService from "../service/interiorService";
import TableMuiCollapse from "./TableMuiCollapse";
import InteriorMyInvoice from "./InteriorMyInvoice";
import { Button, Table, TableBody, TableCell, TableRow } from "@mui/material";
import DialogMui from "./DialogMui";
import "../css/UserBookingLists.css";
import {
  formatInteriorAnswerLabel,
  formatInteriorAnswerValue,
} from "../resources/function/interiorAnswerFormat";

const UserBookingLists = ({ id }) => {
  const [booking, setBooking] = useState();
  const [selectedRow, setSelectedRow] = useState();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [contentDialog, setContentDialog] = useState({
    open: false,
    value: "",
  });

  useEffect(() => {
    const fetchBooking = async () => {
      const data = await InteriorUserService.fetchBookingList(id);
      setBooking(data);
    };

    if (id) {
      fetchBooking();
    }
  }, [id]);

  const canCancelBooking = selectedRow?.b_status === "pending";

  const handleCancelBooking = async () => {
    if (!canCancelBooking) return;

    const cancelBooking = {
      ...selectedRow,
      b_status: "cancel",
    };

    const result = await InteriorService.UpdateBooking(cancelBooking);

    if (result.success) {
      setBooking((prev) =>
        (prev || []).map((item) =>
          item.id === selectedRow.id &&
          item.c_id === selectedRow.c_id &&
          item.c_kind === selectedRow.c_kind &&
          item.c_name === selectedRow.c_name &&
          item.b_createdDate === selectedRow.b_createdDate
            ? {
                ...item,
                b_status: "cancel",
              }
            : item,
        ),
      );
      setSelectedRow((prev) =>
        prev
          ? {
              ...prev,
              b_status: "cancel",
            }
          : prev,
      );
    }

    setCancelOpen(false);
  };

  const openContentDialog = (value) => {
    setContentDialog({
      open: true,
      value,
    });
  }; 

  const bookingValueLabels = {
    b_status: {
      pending: "예약 대기",
      quoting: "견적 진행중",
      confirmed: "예약 확정",
      working: "시공중",
      done: "시공 완료",
      cancel: "취소",
      canceled: "취소",
    },
    b_kind: {
      byTel: "전화 상담",
      byKakaoTalk: "카카오톡 상담",
      byemail: "이메일 상담",
      byEmail: "이메일 상담",
      byVisit: "방문 상담",
      consult: "상담",
      consultation: "상담",
      estimate: "견적 상담",
      remodel: "리모델링",
      interior: "인테리어",
      repair: "보수",
    },
    b_long: {
      "1m": "1개월 이내",
      "3m": "3개월 이내",
      "6m": "6개월 이내",
      flex: "일정 협의",
      flexible: "일정 협의",
    },
  };

  const formatBookingValue = (column, value) => {
    if (value == null || value === "") return "-";

    if (bookingValueLabels[column]?.[value]) {
      return bookingValueLabels[column][value];
    }

    return formatInteriorAnswerValue(value);
  };

  const renderBookingCell = (row, column) => {
    if (column === "b_status") {
      return (
        <span className={`user-booking-status user-booking-status-${row[column]}`}>
          {formatBookingValue(column, row[column])}
        </span>
      );
    }

    if (column === "b_kind") {
      return (
        <span className="user-booking-kind">
          {formatBookingValue(column, row[column])}
        </span>
      );
    }

    if (column !== "b_content") {
      return formatBookingValue(column, row[column]);
    }

    return (
      <button
        className="user-booking-content-preview"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          openContentDialog(row.b_content || "");
        }}
      >
        {row.b_content || "-"}
      </button>
    );
  };

  return (
    <div className="user-booking-layout">
      <div className="user-booking-card">
        <div className="user-booking-head">
          <div>
            <p className="user-booking-eyebrow">BOOKING</p>
            <h3>예약 내역</h3>
            <p>진행 중인 상담과 예약 상세 정보를 확인할 수 있습니다.</p>
          </div>
          <span className="user-booking-count">{booking?.length || 0}개</span>
        </div>
        {selectedRow && (
          <div className="user-booking-card user-booking-invoice">
            {canCancelBooking && (
              <div className="user-booking-actions">
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setCancelOpen(true)}
                >
                  상담 취소
                </Button>
              </div>
            )}
            <InteriorMyInvoice booking={selectedRow} />
          </div>
        )}
        <div className="user-booking-table">
          {booking?.length > 0 ? (
            <TableMuiCollapse
              rowData={booking}
              hiddenColumns={[
                "b_answer",
                "b_createdDate",
                "id",
                "c_id",
                "c_kind",
              ]}
              columns={[
                "업체명",
                "상담 종류",
                "희망 기간",
                "예약일",
                "진행 상태",
                "상담 내용",
              ]}
              collapseTitle="상담 상세 정보"
              selectedRow={selectedRow}
              setSelectedRow={setSelectedRow}
              renderCell={renderBookingCell}
              selectedColor="#dff5ff"
              renderCollapse={(row) => {
                let answer = {};

                try {
                  answer = row.b_answer ? JSON.parse(row.b_answer) : {};
                } catch (e) {
                  answer = {};
                }

                return (
                  <Table className="user-booking-detail-table" size="small">
                    <TableBody>
                      {Object.keys(answer).map((key) => (
                        <TableRow key={key}>
                          <TableCell>
                            {formatInteriorAnswerLabel(key)}
                          </TableCell>
                          <TableCell>
                            {formatInteriorAnswerValue(answer[key])}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                );
              }}
            />
          ) : (
            <div className="user-booking-empty">예약 내역이 없습니다.</div>
          )}
        </div>
      </div>
      <DialogMui
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="상담 취소 확인"
        text="정말 상담 신청을 취소하시겠습니까?"
        buttons={[
          {
            title: "닫기",
            color: "inherit",
            variant: "outlined",
            onClick: () => setCancelOpen(false),
          },
          {
            title: "상담 취소",
            color: "error",
            variant: "contained",
            onClick: handleCancelBooking,
          },
        ]}
      />
      <DialogMui
        className="user-booking-content-dialog"
        open={contentDialog.open}
        onClose={() =>
          setContentDialog({
            open: false,
            value: "",
          })
        }
        title="상담 내용"
        text={
          <span className="user-booking-content-dialog-text">
            {contentDialog.value || "-"}
          </span>
        }
        buttons={[
          {
            title: "닫기",
            color: "primary",
            variant: "contained",
            onClick: () =>
              setContentDialog({
                open: false,
                value: "",
              }),
          },
        ]}
        fullWidth
      />
    </div>
  );
};

export default UserBookingLists;
