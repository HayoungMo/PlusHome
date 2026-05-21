import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Typography,
} from "@mui/material";
import EventService from "../service/eventService";
import GetImgDir from "../resources/function/GetImgDir";
import CouponDownload from "./CouponDownload";

const EventArticle = () => {
  const navigate = useNavigate();
  const { e_id } = useParams();
  const [canUpdate, setUpdate] = useState(true);
  const [event, setEvent] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [couponList, setCouponList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (!e_id) {
        setLoading(false);
        setError("이벤트 정보를 찾을 수 없습니다.");
        return;
      }

      try {
        setLoading(true);
        const data = await EventService.selectEvent(e_id);
        if (!data || data.success === false) {
          setError("이벤트 정보를 불러오지 못했습니다.");
          return;
        }

        const images = await GetImgDir({
          kind: "DEV",
          returnType: "list",
          a: data.e_id,
          b: data.e_title,
          view: false,
        });

        const coupons = await EventService.selectCouponsByEvent(data.e_id);

        setEvent(data);
        setImageList(images?.result || []);
        setCouponList(Array.isArray(coupons) ? coupons : []);
        setError("");
      } catch (err) {
        console.error(err);
        setError("이벤트 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [e_id]);

  const handleUpdate = (data) => {
    navigate(`/event/update/${data}`);
  };

  const handleDelete = async (e_id) => {
    const result = await EventService.deleteEvent(e_id);

    if (result.success) {
      setAlert({
        open: true,
        severity: "success",
        title: "삭제 성공",
        text: "이벤트가 삭제되었습니다.",
      });
      setTimeout(() => navigate("/event"), 1200);
    } else {
      setAlert({
        open: true,
        severity: "error",
        title: `에러`,
        text: result.message || "오류가 발생했습니다.",
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto", px: 3, py: 6 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/event")}>
          목록으로
        </Button>
      </Box>
    );
  }

  return (
    <Box>
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

      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        {event?.e_title}
      </Typography>

      {imageList
        .filter((record) => record.img_tag !== "THUMBNAIL")
        .map((item) => (
          <Box
            key={`${item.img_name}-${item.img_idx}`}
            component="img"
            src={item.img_name}
            alt={event?.e_title || "이벤트 이미지"}
            sx={{
              width: "100%",
              maxHeight: 420,
              objectFit: "cover",
              borderRadius: 2,
              mb: 4,
            }}
          />
        ))}

      <Typography sx={{ whiteSpace: "pre-line", mb: 4 }}>
        {event?.e_content || "등록된 내용이 없습니다."}
      </Typography>

      {couponList.length > 0 && (
        <Box sx={{ mt: 4, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            이벤트 쿠폰
          </Typography>
          {couponList.map((coupon) => (
            <Box
              key={`${coupon.coupon_code}-${coupon.id}`}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                border: "1px solid #ddd",
                borderRadius: 1,
                p: 2,
                mb: 1,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700 }}>
                  {coupon.coupon_info}
                </Typography>
                <Typography color="text.secondary">
                  할인 {coupon.discount} / 최대 {coupon.coupon_max}
                </Typography>
                <Typography color="text.secondary">
                  유효기간 {coupon.coupon_end}
                </Typography>
              </Box>
              <CouponDownload coupon={coupon} />
            </Box>
          ))}
        </Box>
      )}

      <Button variant="contained" onClick={() => navigate("/event")}>
        목록으로
      </Button>
      {canUpdate && (
        <>
          <Button onClick={() => handleUpdate(e_id)}>수정</Button>
          <Button onClick={() => handleDelete(e_id)}>삭제</Button>
        </>
      )}
    </Box>
  );
};

export default EventArticle;
