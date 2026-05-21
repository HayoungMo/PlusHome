import React, { useEffect, useRef, useState } from "react";
import TextFieldMui from "../components/TextFieldMui";
import { Alert, AlertTitle, Button, Snackbar } from "@mui/material";
import ImageService from "../service/imageService";
import InteriorUserService from "../service/interiorUserService";
import { useLocation, useNavigate } from "react-router-dom";
import DialogMui from "../components/DialogMui";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import "../css/InteriorReview.css";

const InteriorReview = () => {
  const [sendList, setSendList] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const invoice = location.state?.invoice;
  const [form, setForm] = useState({
    id: invoice.id,
    invoice_no: invoice.invoice_no,
    invoice_kind: invoice.invoice_kind,
    c_id: invoice.c_id,
    c_kind: invoice.c_kind,
    c_name: invoice.c_name,
    b_createdDate: invoice.b_createdDate,
  });

  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState([]);

  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const fetchReview = async () => {
      const data = await InteriorUserService.fetchInteriorReview(form.id);

      if (data.length !== 0) {
        setAlert({
          open: true,
          severity: "error",
          title: `에러`,
          text: "이미 작성한 리뷰가 있습니다.",
        });
        navigate("../interior/mypage");
      }
    };

    fetchReview();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    try {
      if (sendList.length === 0) {
        setAlert({
          open: true,
          severity: "error",
          title: `에러`        });
        return;
      }
      await InteriorUserService.AddInteriorReview(form);
      await ImageService.insertImage(sendList);

      setAlert({
        open: true,
        severity: "success",
        title: "등록 성공",
        text: "등록되었습니다.",
      });

      handleBack();
    } catch (error) {
      console.error(error);
      setAlert({
        open: true,
        severity: "error",
        title: `에러`,
        text: "에러 발생.",
      });
    }
  };

  const onClickAdd = () => {
    const insertForm = document.getElementsByName("imageInsertTestForm")[0];
    setSendList([
      ...sendList,
      {
        img_kind: insertForm.img_kind.value,
        img_tag: insertForm.img_tag.value,
        dir_a: insertForm.dir_a.value,
        dir_b: insertForm.dir_b.value,
        dir_c: insertForm.dir_c.value,
        dir_d: insertForm.dir_d.value,
        dir_e: insertForm.dir_e.value,
        img_idx: sendList.length,
        file: insertForm.file.files[0],
      },
    ]);
    setPreview((prev) => [
      ...prev,
      URL.createObjectURL(insertForm.file.files[0]),
    ]);
  };

  return (
    <div className="interior-review-page">
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
      <div className="interior-review-card">
        <div className="interior-review-header">
          <h2>인테리어 리뷰 작성</h2>
          <p>시공 후기를 작성하고 사진을 함께 등록해주세요.</p>
        </div>

        <form name="article" className="interior-review-form">
          <div className="interior-review-field">
            <TextFieldMui
              name="ir_content"
              label="content"
              onChange={handleChange}
            />
            <Button onClick={handleOpen} variant="contained">
              제출
            </Button>
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
                    console.log("제출");
                    handleSubmit(e);
                    handleClose();
                  },
                },
              ]}
            />
          </div>
        </form>
        <p>이미지 업로드</p>
        <div className="interior-review-upload">
          <form
            name="imageInsertTestForm"
            className="interior-review-upload-form"
          >
            <input
              type="hidden"
              value="I_REVIEW"
              name="img_kind"
              placeholder="IMG_KIND"
            />
            <input
              type="hidden"
              value={
                sendList === null || sendList.length === 0
                  ? "THUMBNAIL"
                  : "OTHER"
              }
              name="img_tag"
              placeholder="IMG_TAG"
            />
            <input
              type="hidden"
              value={invoice.c_id}
              name="dir_a"
              placeholder="DIR_A"
            />
            <input
              type="hidden"
              value={invoice.c_kind}
              name="dir_b"
              placeholder="DIR_B"
            />
            <input
              type="hidden"
              value={invoice.c_name}
              name="dir_c"
              placeholder="DIR_C"
            />
            <input
              type="hidden"
              value={invoice.id}
              name="dir_d"
              placeholder="DIR_D"
            />
            <input
              type="hidden"
              value={invoice.b_createdDate}
              name="dir_e"
              placeholder="DIR_E"
            />
            <input
              type="hidden"
              name="img_idx"
              value="1"
              placeholder="IMG_IDX"
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
        </div>
        <div className="interior-review-preview-grid">
          {preview &&
            preview.map((item, idx) => (
              <img
                key={idx}
                className="interior-review-preview-image"
                src={item}
                alt=""
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default InteriorReview;
