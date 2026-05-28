import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import DeleteIcon from "@mui/icons-material/Delete";
import DatePickerMui from "./DatePickerMui";
import TextFieldMui from "./TextFieldMui";
import SelectMui from "./SelectMui";
import EventService from "../service/eventService";
import ImageService from "../service/imageService";
import GetImgDir from "../resources/function/GetImgDir";
import FloatingActionButtonMui from "./FloatingActionButtonMui";
import "../css/EventForm.css";
import CheckboxMui from "./CheckboxMui";

const EventUpdate = () => {
  const navigate = useNavigate();
  const { e_id } = useParams();

  const [form, setForm] = useState({});
  const [imageList, setImageList] = useState([]);
  const [sendList, setSendList] = useState([]);
  const [preview, setPreview] = useState([]);
  const [updatePreviewMap, setUpdatePreviewMap] = useState({});
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
    { value: "BANNER", title: "배너용 이미지" },
    { value: "OTHER", title: "본문 이미지" },
  ];

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

  useEffect(() => {
    const fetchEvent = async () => {
      if (!e_id) {
        showAlert({
          severity: "error",
          title: "조회 실패",
          text: "수정할 이벤트 정보를 찾을 수 없습니다.",
        });
        return;
      }

      try {
        const data = await EventService.selectEvent(e_id);

        if (!data || data.success === false) {
          showAlert({
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
          e_startDate: data.e_startDate || null,
          e_endDate: data.e_endDate || null,
          e_type: data.e_type || "notice",
        });
        setImageList(images?.result || []);
      } catch (err) {
        console.error(err);
        showAlert({
          severity: "error",
          title: "오류",
          text: "이벤트 정보를 불러오는 중 오류가 발생했습니다.",
        });
      }
    };

    fetchEvent();
  }, [e_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "e_type" &&
        value !== "event" && {
          e_startDate: null,
          e_endDate: null,
        }),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const hasThumbnail =
      imageList.some((item) => item.img_tag === "THUMBNAIL") ||
      sendList.some((item) => item.img_tag === "THUMBNAIL");

    if (imageTag === "THUMBNAIL" && hasThumbnail) {
      showAlert({
        severity: "warning",
        title: "썸네일 중복",
        text: "썸네일은 하나만 등록할 수 있습니다.",
      });
      e.target.value = "";
      return;
    }

    const nextIndex = imageList.length + sendList.length;
    const nextImage = {
      img_kind: "DEV",
      img_tag: imageTag,
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

  const handleExistingImageChange = async (item, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewKey = item.img_originalName;
    const previewUrl = URL.createObjectURL(file);

    setUpdatePreviewMap((prev) => {
      if (prev[previewKey]) URL.revokeObjectURL(prev[previewKey]);
      return { ...prev, [previewKey]: previewUrl };
    });

    try {
      await ImageService.updateImage([{ file, name: item.img_originalName }]);
      showAlert({
        severity: "success",
        title: "이미지 수정 완료",
        text: "이미지가 수정되었습니다.",
      });
    } catch (err) {
      console.error(err);
      setUpdatePreviewMap((prev) => {
        const next = { ...prev };
        delete next[previewKey];
        return next;
      });
      URL.revokeObjectURL(previewUrl);
      showAlert({
        severity: "error",
        title: "이미지 수정 실패",
        text: "이미지를 수정하는 중 오류가 발생했습니다.",
      });
    } finally {
      e.target.value = "";
    }
  };

  const imageDelete = async (item) => {
    await ImageService.deleteImage(item);
    setImageList((prev) =>
      prev.filter((image) => !item.includes(image.img_originalName)),
    );
    showAlert({
      severity: "success",
      title: "이미지 삭제 완료",
      text: "이미지가 삭제되었습니다.",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await EventService.updateEvent(form);

    if (!result.success) {
      showAlert({
        severity: "error",
        title: `오류${result.status || ""}`,
        text: result.message || "수정 실패",
      });
      return;
    }

    const imageResult = await insertNewImages();
    if (!imageResult.success) {
      showAlert({
        severity: "warning",
        title: "이미지 업로드 실패",
        text: "이벤트는 수정되었지만 이미지 업로드에 실패했습니다.",
      });
      return;
    }

    showAlert({
      severity: "success",
      title: "수정 성공",
      text: "이벤트가 수정되었습니다.",
    });

    setTimeout(() => {
      navigate("../event");
    }, 1500);
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
        이벤트 수정
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        이벤트 정보와 이미지를 수정합니다.
      </Typography>

      <Box
        className="event-form-layout"
        component="form"
        name="eventUpdate"
        onSubmit={handleSubmit}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 320px" },
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
              등록된 이미지
            </Typography>
            {imageList.length === 0 && (
              <Typography color="text.secondary">
                등록된 이미지가 없습니다.
              </Typography>
            )}
            <Box
              className="event-form-existing-grid"
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                gap: 2,
              }}
            >
              {imageList.map((item) => (
                <Box
                  className="event-form-existing-card"
                  key={`${item.img_name}-${item.img_idx}`}
                  sx={{
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="img"
                    src={
                      updatePreviewMap[item.img_originalName] || item.img_name
                    }
                    alt={item.img_tag || "event"}
                    sx={{
                      width: "100%",
                      height: 180,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ flex: 1 }}>
                      {item.img_tag === "THUMBNAIL"
                        ? "썸네일"
                        : item.img_tag === "BANNER"
                          ? "배너 이미지"
                          : "본문 이미지"}
                    </Typography>

                    <FloatingActionButtonMui
                      component="label"
                      icon={<CloudUploadIcon />}
                    >
                      <input
                        type="file"
                        hidden
                        name={item.img_originalName}
                        className="updateFile"
                        onChange={(e) => handleExistingImageChange(item, e)}
                      />
                    </FloatingActionButtonMui>
                    <FloatingActionButtonMui
                      icon={<DeleteIcon />}
                      color="error"
                      onClick={() => imageDelete([item.img_originalName])}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider />

          <Box className="event-form-section">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              새 이미지 추가
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
              >
                이미지 추가
                <input
                  type="file"
                  hidden
                  name="file"
                  onChange={handleImageChange}
                />
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
                      alt="preview"
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
                          : "본문 이미지"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
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
            수정 작업
          </Typography>
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
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            변경 내용을 확인한 뒤 저장하세요.
          </Typography>
          <Button type="submit" variant="contained" fullWidth size="large">
            수정
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => navigate("/event")}
          >
            취소
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EventUpdate;
