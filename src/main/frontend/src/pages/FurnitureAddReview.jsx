import React, { useState } from "react";
import { useParams } from "react-router-dom";
import TextFieldMui from "../components/TextFieldMui";
import FurnitureReviewService from "../service/furnitureReviewService";
import ImageService from "../service/imageService";
import { Button } from "@mui/material";
import RatingMui from "../components/RatingMui";
import DialogMui from "../components/DialogMui";
import AlertMui from "../components/AlertMui";
import FloatingActionButtonMui from "../components/FloatingActionButtonMui";
import AddIcon from "@mui/icons-material/Add";

const FurnitureAddReview = () => {
  const id = localStorage.getItem("id");
  const { f_code } = useParams();
  const [open, setOpen] = useState(false);
  const [sendList, setSendList] = useState([]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });

  const [form, setForm] = useState({ id: id, f_code: f_code });
  const [preview, setPreview] = useState([]);
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    const result2 = await onClickInsert();
    const result =
      result2.success && (await FurnitureReviewService.insertReview(form));

    if (result2.success && result.success) {
      setAlert({
        open: true,
        severity: "success",
        title: "등록 성공",
        text: "등록되었습니다.",
      });
    } else {
      setAlert({
        open: true,
        severity: "error",
        title: `에러 (${result.status || "이미지 누락"})`,
        text: result.message || "이미지를 1개 이상 넣어주세요.",
      });
    }
  };
  const onClickAdd = () => {
    const insertForm2 = document.getElementsByName("imageInsertTestForm")[0];
    setSendList([
      ...sendList,
      {
        img_kind: insertForm2.img_kind.value,
        img_tag: insertForm2.img_tag.value,
        dir_a: insertForm2.dir_a.value,
        //dir_b: insertForm2.dir_b.value,
        //dir_c: insertForm2.dir_c.value,
        dir_d: insertForm2.dir_d.value,
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

  const onClickInsert = () => {
    if (!sendList || sendList.length === 0) {
      console.log("보낼 이미지 없음");
      return {
        success: false,
        log: "보낼 이미지 없음",
      };
    }
    ImageService.insertImage(sendList);
    return { success: true };
  };

  return (
    <div>
      {alert.open && (
        <AlertMui
          severity={alert.severity}
          title={alert.title}
          text={alert.text}
          autoHideDuration={3000}
          onClose={() =>
            setAlert((prev) => ({
              ...prev,
              open: false,
            }))
          }
        />
      )}
      <form name="review">
        <RatingMui
          name="star"
          label="별점"
          onChange={handleChange}
          precision={0.5}
        />
        <TextFieldMui name="subject" label="subject" onChange={handleChange} />
        <TextFieldMui name="content" label="content" onChange={handleChange} />
        <Button onClick={() => handleOpen()}>제출</Button>
        <DialogMui
          open={open}
          onClose={handleClose}
          title="제출 확인"
          text="정말 제출하시겠습니까?"
          buttons={[
            {
              title: "취소",
              color: "inherit",
              onClick: handleClose,
            },
            {
              title: "제출",
              variant: "contained",
              onClick: (e) => {
                console.log("제출 실행");
                handleSubmit(e);
                handleClose();
              },
            },
          ]}
        />
      </form>
      <p>가구 리뷰 이미지 업로드</p>
      <form name="imageInsertTestForm">
        <input
          type="hidden"
          value="F_REVIEW"
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
        <input type="hidden" value={f_code} name="dir_a" placeholder="DIR_A" />
        {/* <input
          type="hidden"
          value={company.c_kind}
          name="dir_b"
          placeholder="DIR_B"
        />

        <input
          type="hidden"
          value={company.c_name}
          name="dir_c"
          placeholder="DIR_C"
        /> */}
        <input type="hidden" value={id} name="dir_d" placeholder="DIR_D" />
        {/*
 <input type="hidden" value="imgTest" name="dir_b" placeholder="DIR_B" /> */}
        <input type="hidden" name="img_idx" value="1" placeholder="IMG_IDX" />
        <input type="file" name="file" />
        <br />
        <FloatingActionButtonMui
          icon={<AddIcon />}
          color="primary"
          onClick={() => onClickAdd()}
        />
      </form>
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

export default FurnitureAddReview;
