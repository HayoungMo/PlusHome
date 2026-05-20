import React, { useEffect, useState } from "react";
import EventService from "../service/eventService";
import { Alert, AlertTitle, Button, Snackbar } from "@mui/material";
import DatePickerMui from "./DatePickerMui";
import TextFieldMui from "./TextFieldMui";
import ImageService from "../service/imageService";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const EventCreated = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
  const [sendList, setSendList] = useState([]);
  const [form, setForm] = useState({e_id : randomNum});
  const [preview, setPreview] = useState([]);
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });


  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const makeEvent = (name, value) => ({
    target: {
      name,
      value,
    },
  });
  const onClickAdd = () => {
    const insertForm2 = document.getElementsByName("imageInsertTestForm2")[0];
    setSendList([
      ...sendList,
      {
        img_kind: insertForm2.img_kind.value,
        img_tag: insertForm2.img_tag.value,
        dir_a: insertForm2.dir_a.value,
        dir_b: insertForm2.dir_b.value,
        //dir_c: insertForm2.dir_c.value,
        //dir_d: insertForm2.dir_d.value,
        // dir_e: insertForm.dir_e.value,
        img_idx: sendList.length,
        file: insertForm2.file.files[0],
      },
    ]);
    setPreview((prev) => [
      ...prev,
      URL.createObjectURL(insertForm2.file.files[0]),
    ]);
  };

  const onClickInsert = async () => {
    if (!sendList || sendList.length === 0) {
      console.log("보낼 이미지 없음");
      return {
        success: false,
        log: "보낼 이미지 없음",
      }; // 🚫 요청 안 보냄
    }
    try {
      await ImageService.insertImage(sendList);

      // 업로드 성공 후 초기화
      setSendList([]);
      return {
        success: true,
      };
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    const result = await EventService.insertEvent(form);    
    if (result.success) {
      setAlert({
        open: true,
        severity: "success",
        title: "등록 성공",
        text: "등록되었습니다.",
      });
      onClickInsert();
    } else {
      setAlert({
        open: true,
        severity: "error",
        title: `에러${result.status || ""}`,
        text: result.message || "등록 실패",
      });
    }
  };
  return (
    <div>
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
      <form name="event">
        <TextFieldMui
          name="e_title"
          label="이벤트 제목"
          onChange={handleChange}
        />
        <DatePickerMui
          name="e_long"
          label="이벤트 기간"
          value={form.e_long}
          onChange={(value) =>
            handleChange(makeEvent("e_long", value.format("YYYY-MM-DD")))
          }
        />
        <TextFieldMui
          name="e_content"
          label="이벤트 정보"
          onChange={handleChange}
        />

        <Button onClick={(e) => handleSubmit(e)}>게시</Button>
      </form>
      {form.e_title && (
        <form name="imageInsertTestForm2">
          <p>시공사례 이미지 업로드</p>
          <input
            type="hidden"
            value="DEV"
            name="img_kind"
            placeholder="IMG_KIND"
          />
          <input
            type="hidden"
            value={
              sendList === null || sendList.length === 0 ? "THUMBNAIL" : "OTHER"
            }
            name="img_tag"
            placeholder="IMG_TAG"
          />
          <input
            type="hidden"
            value={form.e_id}
            name="dir_a"
            placeholder="DIR_A"
          />
          <input
            type="hidden"
            value={form.e_title}
            name="dir_b"
            placeholder="DIR_B"
          />
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
          >
            추가할 파일
            <input
              type="file"
              hidden
              name="file"
              onChange={() => onClickAdd()}
            />
          </Button>
        </form>
      )}
      {preview &&
        preview.map((item) => (
          <img
            src={item}
            style={{ width: "150px", height: "150px", objectFit: "cover" }}
            alt=""
          />
        ))}
    </div>
  );
};

export default EventCreated;
