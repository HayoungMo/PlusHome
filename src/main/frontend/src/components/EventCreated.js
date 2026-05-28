import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import EventService from "../service/eventService";
import DatePickerMui from "./DatePickerMui";
import TextFieldMui from "./TextFieldMui";
import ImageService from "../service/imageService";
import SelectMui from "./SelectMui";
import CouponAdd from "./CouponAdd";
import CouponService from "../service/couponService";
import TableCheckBoxMui from "./TableCheckBoxMui";
import { useNavigate } from "react-router-dom";
import "../css/EventForm.css";
import FloatingActionButtonMui from "./FloatingActionButtonMui";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckboxMui from "./CheckboxMui";

const EventCreated = () => {
  const navigate = useNavigate();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const user = JSON.parse(localStorage.getItem("user"));
  const [sendList, setSendList] = useState([]);
  const [form, setForm] = useState({ e_id: randomNum });
  const [preview, setPreview] = useState([]);
  const [couponList, setCouponList] = useState([]);
  const [selectedCouponCodes, setSelectedCouponCodes] = useState([]);
  const [imageTag, setImageTag] = useState("THUMBNAIL");
  const [couponDialogOpen, setCouponDialogOpen] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });

  const option = [
    { value: "notice", title: "공지사항" },
    { value: "event", title: "이벤트" },
  ];

  const imageTagOptions = [
    { value: "THUMBNAIL", title: "썸네일" },
    { value: "BANNER", title: "배너용 이미지" },
    { value: "OTHER", title: "본문 이미지" },
  ];

  const requiredImageTags = [
    { value: "BANNER", title: "배너 이미지" },
    { value: "THUMBNAIL", title: "썸네일" },
    { value: "OTHER", title: "본문 이미지" },
  ];

  const isAvailableCoupon = useCallback((coupon) => {
    if (!coupon?.coupon_end) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return new Date(coupon.coupon_end) >= today;
  }, []);

  const getUsageKey = useCallback(
    (coupon) => `${coupon.coupon_code}_${coupon.id}`,
    [],
  );

  useEffect(() => {
    user?.type !== "admin" && navigate(-1);
  }, [user]);

  const getCouponListWithUsage = useCallback(
    (coupons, usages) => {
      const usageMap = (usages || []).reduce((acc, usage) => {
        const key = `${usage.coupon_code}_${usage.id}`;
        acc[key] = acc[key] || [];
        acc[key].push(usage);
        return acc;
      }, {});

      return (coupons || []).map((coupon) => {
        const couponUsage = usageMap[getUsageKey(coupon)] || [];
        const usageText = couponUsage.length
          ? couponUsage
              .map((usage) => usage.e_title || `event ${usage.e_id}`)
              .join(", ")
          : "미사용";

        return {
          ...coupon,
          event_usage_status: couponUsage.length ? "사용중" : "미사용",
          event_usage: usageText,
          event_usage_count: couponUsage.length,
        };
      });
    },
    [getUsageKey],
  );

  const makeEvent = (name, value) => ({
    target: {
      name,
      value,
    },
  });

  const showAlert = ({ severity, title, text }) => {
    setAlert({
      open: true,
      severity,
      title,
      text,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
      ...(name === "e_type" &&
        value !== "event" && {
          e_long: null,
        }),
    });
  };

  const imageDelete = async (index) => {
    setPreview((prev) => {
      if (prev[index]) {
        URL.revokeObjectURL(prev[index]);
      }

      return prev.filter((_, i) => i !== index);
    });

    setSendList((prev) => prev.filter((_, i) => i !== index));

    showAlert({
      severity: "success",
      title: "이미지 삭제 완료",
      text: "이미지가 삭제되었습니다.",
    });
  };

  useEffect(() => {
    const fetchCoupon = async () => {
      const [result, usageList] = await Promise.all([
        CouponService.selectCouponDev(),
        EventService.selectCouponEventUsage(),
      ]);
      if (!result.success) return;

      const availableCoupons = (result.data || []).filter(isAvailableCoupon);
      const couponsWithUsage = getCouponListWithUsage(
        availableCoupons,
        usageList,
      );
      setCouponList(
        couponsWithUsage.sort(
          (a, b) =>
            Number(a.event_usage_count || 0) - Number(b.event_usage_count || 0),
        ),
      );
    };

    fetchCoupon();
  }, [getCouponListWithUsage, isAvailableCoupon]);

  const handleCouponCreated = (newCoupon) => {
    if (!isAvailableCoupon(newCoupon)) return;

    setCouponList((prev) => [
      {
        ...newCoupon,
        event_usage_status: "미사용",
        event_usage: "미사용",
        event_usage_count: 0,
      },
      ...prev,
    ]);
    setSelectedCouponCodes((prev) => [...prev, newCoupon.coupon_code]);
    setCouponDialogOpen(false);
  };

  const onClickAdd = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const hasThumbnail = sendList.some((item) => item.img_tag === "THUMBNAIL");

    if (imageTag === "THUMBNAIL" && hasThumbnail) {
      showAlert({
        severity: "warning",
        title: "썸네일 중복",
        text: "썸네일은 하나만 등록할 수 있습니다.",
      });
      e.target.value = "";
      return;
    }

    setSendList((prev) => [
      ...prev,
      {
        img_kind: "DEV",
        img_tag: imageTag,
        dir_a: form.e_id,
        dir_b: form.e_title,
        img_idx: prev.length,
        file,
      },
    ]);
    setPreview((prev) => [...prev, URL.createObjectURL(file)]);
    e.target.value = "";
  };

  const onClickInsert = async () => {
    if (!sendList || sendList.length === 0) {
      return { success: true };
    }

    try {
      await ImageService.insertImage(sendList);
      setSendList([]);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  };

  const getMissingImageTags = () => {
    return requiredImageTags.filter(
      (tag) => !sendList.some((item) => item.img_tag === tag.value),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingImageTags = getMissingImageTags();
    if (missingImageTags.length > 0) {
      showAlert({
        severity: "warning",
        title: "이미지 등록 필요",
        text: `${missingImageTags
          .map((tag) => tag.title)
          .join(", ")}를 각각 1개 이상 등록해주세요.`,
      });
      return;
    }

    const result = await EventService.insertEvent(form);

    if (!result.success) {
      showAlert({
        severity: "error",
        title: `에러${result.status || ""}`,
        text: result.message || "등록 실패",
      });
      return;
    }

    const selectedCouponObjects = couponList.filter((coupon) =>
      selectedCouponCodes.includes(coupon.coupon_code),
    );
    const usedCouponCount = selectedCouponObjects.filter(
      (coupon) => Number(coupon.event_usage_count || 0) > 0,
    ).length;

    await Promise.all(
      selectedCouponObjects.map((coupon) =>
        EventService.insertEventCoupon({
          e_id: form.e_id,
          coupon_code: coupon.coupon_code,
          id: coupon.id,
        }),
      ),
    );

    const imageResult = await onClickInsert();
    if (!imageResult.success) {
      showAlert({
        severity: "warning",
        title: "이미지 업로드 실패",
        text: "이벤트는 등록되었지만 이미지 업로드에 실패했습니다.",
      });
      return;
    }

    showAlert({
      severity: usedCouponCount > 0 ? "warning" : "success",
      title: "등록 성공",
      text:
        usedCouponCount > 0
          ? `이벤트가 등록되었습니다. 선택한 쿠폰 중 ${usedCouponCount}개는 다른 이벤트에서도 사용중입니다.`
          : "이벤트가 등록되었습니다.",
    });

    setTimeout(() => {
      navigate("../event");
    }, 1000);
  };

  return (
    <Box className="event-form-page">
      <Snackbar
        open={alert.open}
        autoHideDuration={3000}
        onClose={() =>
          setAlert((prev) => ({
            ...prev,
            open: false,
          }))
        }
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={alert.severity}
          onClose={() =>
            setAlert((prev) => ({
              ...prev,
              open: false,
            }))
          }
          sx={{
            width: "400px",
            fontSize: "1rem",
            padding: "16px 20px",
            alignItems: "center",
          }}
        >
          <AlertTitle>{alert.title}</AlertTitle>
          {alert.text}
        </Alert>
      </Snackbar>

      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        이벤트 등록
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        이벤트 정보와 이미지, 쿠폰을 함께 설정합니다.
      </Typography>

      <Box
        className="event-form-layout"
        component="form"
        name="event"
        onSubmit={handleSubmit}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 360px" },
          gap: 4,
          alignItems: "start",
        }}
      >
        <Box
          className="event-form-main"
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Box className="event-form-section">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              기본 정보
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 2,
              }}
            >
              <TextFieldMui
                name="e_title"
                label="제목"
                value={form.e_title || ""}
                onChange={handleChange}
                width="100%"
              />
            </Box>
            {form.e_type === "event" && (
              <Box
                sx={{
                  mt: 2,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <DatePickerMui
                  name="e_startDate"
                  label="시작일"
                  value={form.e_startDate}
                  onChange={(value) =>
                    handleChange(
                      makeEvent(
                        "e_startDate",
                        value?.format("YYYY-MM-DD") || null,
                      ),
                    )
                  }
                />
                <DatePickerMui
                  name="e_endDate"
                  label="종료일"
                  value={form.e_endDate}
                  onChange={(value) =>
                    handleChange(
                      makeEvent(
                        "e_endDate",
                        value?.format("YYYY-MM-DD") || null,
                      ),
                    )
                  }
                />
              </Box>
            )}
            <Box sx={{ mt: 2 }}>
              <TextFieldMui
                name="e_content"
                label="내용"
                value={form.e_content || ""}
                onChange={handleChange}
                multiline
                minRows={5}
                width="100%"
              />
            </Box>
          </Box>

          <Divider />

          <Box className="event-form-section">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              이미지
            </Typography>
            <Box
              className="event-form-upload-row"
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <SelectMui
                name="image_tag_select"
                label="이미지 구분"
                option={imageTagOptions}
                value={imageTag}
                onChange={(e) => setImageTag(e.target.value)}
              />
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                disabled={!form.e_title}
              >
                이미지 추가
                <input type="file" hidden name="file" onChange={onClickAdd} />
              </Button>
            </Box>
            {preview.length > 0 && (
              <Box
                className="event-form-preview-grid"
                sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 2 }}
              >
                {preview.map((item, index) => (
                  <Box
                    className="event-form-preview-card"
                    key={item}
                    sx={{
                      width: 150,
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      component="img"
                      src={item}
                      alt=""
                      sx={{
                        width: "100%",
                        height: 120,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ display: "block", px: 1, py: 0.75 }}
                    >
                      {sendList[index]?.img_tag === "THUMBNAIL"
                        ? "썸네일"
                        : sendList[index]?.img_tag === "BANNER"
                          ? "배너 이미지 "
                          : "본문 이미지"}{" "}
                    </Typography>

                    <FloatingActionButtonMui
                      icon={<DeleteIcon />}
                      color="error"
                      onClick={() => imageDelete(index)}
                    />
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Divider />

          <Box className="event-form-section">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              쿠폰 선택
            </Typography>
            <TableCheckBoxMui
              rowData={couponList}
              col={[
                "coupon_code",
                "discount",
                "coupon_end",
                "coupon_max",
                "coupon_info",
                "event_usage_status",
                "event_usage",
              ]}
              columns={[
                "쿠폰 코드",
                "할인",
                "만료일",
                "최대 할인",
                "쿠폰 정보",
                "이벤트 사용",
                "사용중 이벤트",
              ]}
              checkedList={selectedCouponCodes}
              setCheckedList={setSelectedCouponCodes}
              rowKey="coupon_code"
              pagination
              defaultRowPerPage={5}
            />
          </Box>
        </Box>

        <Box
          className="event-form-side-panel"
          sx={{
            position: { md: "sticky" },
            top: { md: 24 },
            border: "1px solid #ddd",
            borderRadius: 1,
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            노출 설정
          </Typography>
          <Box className="event-form-side-controls">
            <SelectMui
              name="e_type"
              label="이벤트/공지사항"
              option={option}
              value={form.e_type || ""}
              onChange={handleChange}
              width="100%"
            />
            <CheckboxMui
              label="팝업 여부"
              checked={form.e_popup === "Y"}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  e_popup: e.target.checked ? "Y" : "N",
                }))
              }
              width="200px"
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            선택된 쿠폰 {selectedCouponCodes.length}개
          </Typography>
          <Button
            type="button"
            variant="outlined"
            fullWidth
            sx={{ mb: 1.5 }}
            onClick={() => setCouponDialogOpen(true)}
          >
            쿠폰 등록
          </Button>
          <Button type="submit" variant="contained" fullWidth size="large">
            등록
          </Button>
        </Box>
      </Box>

      <Dialog
        open={couponDialogOpen}
        onClose={() => setCouponDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>쿠폰 등록</DialogTitle>
        <DialogContent dividers className="event-form-coupon-dialog">
          <CouponAdd onCreated={handleCouponCreated} />
        </DialogContent>
        <DialogActions>
          <Button type="button" variant="outlined" color="error" onClick={() => setCouponDialogOpen(false)}>
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventCreated;
