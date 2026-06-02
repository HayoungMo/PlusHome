import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TextFieldMui from "../components/TextFieldMui";
import FurnitureService from "../service/furnitureService";
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
  const routeFurniture = location.state?.furniture || null;
  const routeThumbnail = location.state?.thumbnail || null;
  const localUserData = localStorage.getItem("user");
  const userData = JSON.parse(localUserData);
  const {
    addr,
    birth,
    code,
    email,
    gender,
    id,
    name,
    tel,
    type,
    companyList = [],
  } = userData;

  const {f_code} = useParams();
  const [open, setOpen] = useState(false);
  const [sendList, setSendList] = useState([]);
  const [reviewFurniture, setReviewFurniture] = useState(routeFurniture);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

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

  useEffect(() => {
    if (reviewFurniture || !f_code) return;

    const fetchFurniture = async () => {
      try {
        const data = await FurnitureService.getFurnitureItem(f_code);
        setReviewFurniture(data);
      } catch (error) {
        console.error("리뷰 상품 정보 조회 실패", error);
      }
    };

    fetchFurniture();
  }, [f_code, reviewFurniture]);

  const getReviewFurnitureThumbnail = () => {
    const thumbnail =
      routeThumbnail ||
      reviewFurniture?.thumbnail ||
      reviewFurniture?.imageList?.find((image) => image.img_tag === "THUMBNAIL")
        ?.img_name ||
      reviewFurniture?.imageList?.[0]?.img_name;

    if (!thumbnail) return null;
    if (thumbnail.startsWith("/api/images")) return thumbnail;
    return `/api/images/FURNITURE/${thumbnail}`;
  };

  const furnitureThumbnail = getReviewFurnitureThumbnail();
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    if (submittingRef.current) return;

    if (!c_code) {
      setAlert({
        open: true,
        severity: "error",
        title: "주문 정보 없음",
        text: "주문 내역에서 리뷰 쓰기 버튼으로 다시 돌아와주세요.",
      });

      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

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
      submittingRef.current = false;
      setSubmitting(false);
      setAlert({
        open: true,
        severity: "error",
        title: `에러 (${result?.status || "이미지 누락"})`,
        text: result?.message || result2.log || "이미지를 1개 이상 넣어주세요.",
      });
    }
  };
  const onClickAdd = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isSameFile = (item) =>
      item.file?.name === file.name &&
      item.file?.size === file.size &&
      item.file?.lastModified === file.lastModified;

    if (sendList.some(isSameFile)) {
      e.target.value = "";
      return;
    }

    const insertForm2 = document.getElementsByName("imageInsertTestForm")[0];
    setSendList((prev) => [
      ...prev,
      {
        img_kind: insertForm2.img_kind.value,
        img_tag: prev.length === 0 ? "THUMBNAIL" : "OTHER",
        dir_a: insertForm2.dir_a.value,
        //dir_b: insertForm2.dir_b.value,
        //dir_c: insertForm2.dir_c.value,
        dir_d: insertForm2.dir_d.value,
        // dir_e: insertForm.dir_e.value,
        img_idx: prev.length,
        file,
      },
    ]);
    setPreview((prev) => [
      ...prev,
      URL.createObjectURL(file),
    ]);
    e.target.value = "";
  };

  const onClickInsert = async () => {
    if (!sendList || sendList.length === 0) {
      console.log("보낼 이미지 없음");
      return {
        success: false,
        log: "보낼 이미지 없음",
      };
    }
    const result = await ImageService.insertImage(sendList);
    return { success: Boolean(result?.data?.success ?? result?.success) };
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

        <div className="furniture-review-product">
          <div className="furniture-review-product-image-wrap">
            {furnitureThumbnail ? (
              <img
                className="furniture-review-product-image"
                src={furnitureThumbnail}
                alt={reviewFurniture?.f_name || f_code}
              />
            ) : (
              <div className="furniture-review-product-image-empty">
                이미지 없음
              </div>
            )}
          </div>

          <div className="furniture-review-product-info">
            <span>리뷰 작성 상품</span>
            <strong>{reviewFurniture?.f_name || f_code}</strong>
            {reviewFurniture?.f_price && (
              <p>{Number(reviewFurniture.f_price).toLocaleString()}원</p>
            )}
          </div>
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
            <TextFieldMui
              name="subject"
              label="subject"
              onChange={handleChange}
            />
            <TextFieldMui
              name="content"
              label="content"
              onChange={handleChange}
            />
            <Button disabled={submitting} onClick={() => handleOpen()}>제출</Button>
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
                disabled: submitting,
                onClick: async (e) => {
                  console.log("제출 실행");
                  await handleSubmit(e);
                  handleClose();
                },
              },
            ]}
          />
        </form>
        <p>가구 리뷰 이미지 업로드</p>
        <div className="furniture-review-upload">
          <form
            name="imageInsertTestForm"
            className="furniture-review-upload-form"
          >
            <input
              type="hidden"
              value="F_REVIEW"
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
              value={c_code}
              name="dir_a"
              placeholder="DIR_A"
            />
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
                onChange={onClickAdd}
              />
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
