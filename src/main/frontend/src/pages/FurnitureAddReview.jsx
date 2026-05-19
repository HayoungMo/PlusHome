import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TextFieldMui from "../components/TextFieldMui";
import FurnitureReviewService from "../service/furnitureReviewService";
import ImageService from "../service/imageService";
import { Alert, AlertTitle, Button, Snackbar } from "@mui/material";
import RatingMui from "../components/RatingMui";
import DialogMui from "../components/DialogMui";
import AlertMui from "../components/AlertMui";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import "../css/FurnitureAddReview.css";

const FurnitureAddReview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const c_code = location.state?.c_code;

  const id = localStorage.getItem("id");
  const f_code = useParams();
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

  const [form, setForm] = useState({ id: id, f_code: f_code, c_code: c_code });
  const [preview, setPreview] = useState([]);
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    if (!c_code) {
      setAlert({
        open: true,
        severity: "error",
        title: "주문 정보 없음",
        text: "주문 내역에서 리뷰 쓰기 버튼으로 다시 돌아와주세요.",
      });

      return;
    }

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

      navigate(`/userpage?menu=orders`);
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
    <div className="furniture-review-page">
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
      <div className="furniture-review-card">
        <div className="furniture-review-header">
          <h2>가구 리뷰 작성</h2>
          <p>구매한 상품의 별점과 후기를 남겨주세요.</p>
        </div>

      <form name="review" className="furniture-review-form">
        <div className="furniture-review-rating">
        <RatingMui
          name="star"
          label="별점"
          onChange={handleChange}
          precision={0.5}
        />
        </div>
        <div className="furniture-review-fields">
        <TextFieldMui name="subject" label="subject" onChange={handleChange} />
        <TextFieldMui name="content" label="content" onChange={handleChange} />
        <Button onClick={() => handleOpen()}>제출</Button>
        </div>
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
              variant: "outlined",
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
      <div className="furniture-review-upload">
      <form name="imageInsertTestForm" className="furniture-review-upload-form">
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
        <input type="hidden" value={c_code} name="dir_a" placeholder="DIR_A" />
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

        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
        >
          추가할 파일
          <input type="file" hidden name="file" onChange={() => onClickAdd()} />
        </Button>
      </form>
      </div>
      <div className="furniture-review-preview-grid">
      {preview &&
        preview.map((item, idx) => (
          <img
            key={idx}
            className="furniture-review-preview-image"
            src={item}
            alt=""
          />
        ))}
      </div>
      </div>
    </div>
  );
};

export default FurnitureAddReview;
