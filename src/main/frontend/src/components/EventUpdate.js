import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Alert, AlertTitle, Box, Button, CircularProgress, Snackbar, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DatePickerMui from "./DatePickerMui";
import TextFieldMui from "./TextFieldMui";
import SelectMui from "./SelectMui";
import EventService from "../service/eventService";
import ImageService from "../service/imageService";
import GetImgDir from "../resources/function/GetImgDir";

const EventUpdate = () => {
  const navigate = useNavigate();
  const { e_id } = useParams();

  const [form, setForm] = useState( {});
  const [imageList, setImageList] = useState([]);
  const [sendList, setSendList] = useState([]);
  const [preview, setPreview] = useState([]);

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

  useEffect(() => {
    const fetchEvent = async () => {
      if (!e_id) {
        setAlert({
          open: true,
          severity: "error",
          title: "조회 실패",
          text: "수정할 이벤트 정보를 찾을 수 없습니다.",
        });

        return;
      }

      try {

        const data = await EventService.selectEvent(e_id);

        if (!data || data.success === false) {
          setAlert({
            open: true,
            severity: "error",
            title: "조회 실패",
            text: "이벤트 정보를 불러오지 못했습니다.",
          });
          return;
        }

        const images = await GetImgDir({
          kind: "DEV",
          returnType: "list",
          a: data.e_id,
          b: data.e_title,
          view: false,
        });

        setForm({
          ...data,
          e_long: data.e_long || null,
          e_type: data.e_type || "notice",
        });
        setImageList(images?.result || []);
      } catch (err) {
        console.error(err);
        setAlert({
          open: true,
          severity: "error",
          title: "오류",
          text: "이벤트 정보를 불러오는 중 오류가 발생했습니다.",
        });
      } 
    };

    fetchEvent();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "e_type" &&
        value !== "event" && {
          e_long: null,
        }),
    }));
  };

  const makeEvent = (name, value) => ({
    target: {
      name,
      value,
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const nextIndex = imageList.length + sendList.length;
    const nextImage = {
      img_kind: "DEV",
      img_tag: nextIndex === 0 ? "THUMBNAIL" : "OTHER",
      dir_a: form.e_id,
      dir_b: form.e_title,
      img_idx: nextIndex,
      file,
    };

    setSendList((prev) => [...prev, nextImage]);
    setPreview((prev) => [...prev, URL.createObjectURL(file)]);
    e.target.value = "";
  };

  const insertNewImages = async () => {
    if (sendList.length === 0) return { success: true };

    await ImageService.insertImage(sendList);
    setSendList([]);
    return { success: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await EventService.updateEvent(form);

    if (result.success) {
      await insertNewImages();
      setAlert({
        open: true,
        severity: "success",
        title: "수정 성공",
        text: "이벤트가 수정되었습니다.",
      });
    } else {
      setAlert({
        open: true,
        severity: "error",
        title: `오류${result.status || ""}`,
        text: result.message || "수정 실패",
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", px: 3, py: 5 }}>
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

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        이벤트 수정
      </Typography>

      <Box
        component="form"
        name="eventUpdate"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
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
        {form.e_type === "event" && (
          <DatePickerMui
            name="e_long"
            label="이벤트 기간"
            value={form.e_long}
            onChange={(value) => handleChange(makeEvent("e_long", value?.format("YYYY-MM-DD") || null))}
          />
        )}
        <TextFieldMui
          name="e_content"
          label="내용"
          value={form.e_content || ""}
          onChange={handleChange}
          multiline
          minRows={5}
          width="100%"
        />

        <Box>
          <Typography sx={{ mb: 1 }}>등록된 이미지</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {imageList.length === 0 && <Typography color="text.secondary">등록된 이미지가 없습니다.</Typography>}
            {imageList.map((item) => (
              <Box
                key={`${item.img_name}-${item.img_idx}`}
                component="img"
                src={item.img_name}
                alt={item.img_tag || "event"}
                sx={{ width: 120, height: 120, objectFit: "cover", borderRadius: 1 }}
              />
            ))}
          </Box>
        </Box>

        <Box>
          <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
            이미지 추가
            <input type="file" hidden name="file" onChange={handleImageChange} />
          </Button>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
            {preview.map((item) => (
              <Box
                key={item}
                component="img"
                src={item}
                alt="preview"
                sx={{ width: 120, height: 120, objectFit: "cover", borderRadius: 1 }}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
          <Button variant="outlined" onClick={() => navigate("/event")}>
            취소
          </Button>
          <Button type="submit" variant="contained">
            수정
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EventUpdate;
