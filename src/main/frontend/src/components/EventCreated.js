import React, { useEffect, useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
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

const EventCreated = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const [sendList, setSendList] = useState([]);
  const [form, setForm] = useState({ e_id: randomNum });
  const [preview, setPreview] = useState([]);
  const [couponList, setCouponList] = useState([]);
  const [selectedCouponCodes, setSelectedCouponCodes] = useState([]);
  const [imageTag, setImageTag] = useState("THUMBNAIL");
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
    { value: "OTHER", title: "본문 이미지" },
  ];

  const isAvailableCoupon = (coupon) => {
    if (!coupon?.coupon_end) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return new Date(coupon.coupon_end) >= today;
  };

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

  useEffect(() => {
    const fetchCoupon = async () => {
      const result = await CouponService.selectCouponDev();
      if (!result.success) return;

      setCouponList((result.data || []).filter(isAvailableCoupon));
    };

    fetchCoupon();
  }, []);

  const handleCouponCreated = (newCoupon) => {
    if (!isAvailableCoupon(newCoupon)) return;

    setCouponList((prev) => [newCoupon, ...prev]);
    setSelectedCouponCodes((prev) => [...prev, newCoupon.coupon_code]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      severity: "success",
      title: "등록 성공",
      text: "이벤트가 등록되었습니다.",
    });
  };

  return (
    <Box sx={{ maxWidth: 1080, mx: "auto", px: 3, py: 5, textAlign: "left" }}>
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              기본 정보
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "220px 1fr" },
                gap: 2,
              }}
            >
              <SelectMui
                name="e_type"
                label="이벤트/공지사항"
                option={option}
                value={form.e_type || ""}
                onChange={handleChange}
                width="100%"
              />
              <TextFieldMui
                name="e_title"
                label="제목"
                value={form.e_title || ""}
                onChange={handleChange}
                width="100%"
              />
            </Box>
            {form.e_type === "event" && (
              <Box sx={{ mt: 2 }}>
                <DatePickerMui
                  name="e_long"
                  label="이벤트 기간"
                  value={form.e_long}
                  onChange={(value) =>
                    handleChange(makeEvent("e_long", value.format("YYYY-MM-DD")))
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

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              이미지
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
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
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 2 }}>
                {preview.map((item, index) => (
                  <Box
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
                      sx={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
                    />
                    <Typography variant="caption" sx={{ display: "block", px: 1, py: 0.75 }}>
                      {sendList[index]?.img_tag === "THUMBNAIL" ? "썸네일" : "본문 이미지"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Divider />

          <Box>
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
              ]}
              checkedList={selectedCouponCodes}
              setCheckedList={setSelectedCouponCodes}
              rowKey="coupon_code"
            />
          </Box>
        </Box>

        <Box
          sx={{
            position: { md: "sticky" },
            top: { md: 24 },
            border: "1px solid #ddd",
            borderRadius: 1,
            p: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            쿠폰 생성
          </Typography>
          <CouponAdd onCreated={handleCouponCreated} />
          <Divider sx={{ my: 2 }} />
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            선택된 쿠폰 {selectedCouponCodes.length}개
          </Typography>
          <Button type="submit" variant="contained" fullWidth size="large">
            등록
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EventCreated;
