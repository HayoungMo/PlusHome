import React, { useEffect, useState } from "react";
import FurnitureReviewService from "../service/furnitureReviewService";
import GetImgDir from "../resources/function/GetImgDir";
import RatingMui from "../components/RatingMui";
import TextFieldMui from "../components/TextFieldMui";
import { Alert, AlertTitle, Button, Snackbar } from "@mui/material";
import DialogMui from "../components/DialogMui";
import ImageService from "../service/imageService";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Loading from "../components/Loading";
import ImageViewer from "../components/ImageViewer";
import "../css/UserReviewPage.css";

import FurnitureService from "../service/furnitureService";
import CartService from "../service/cartService";

import { useNavigate } from "react-router-dom";

const UserReviewPage = ({ user }) => {
  const REVIEW_TITLE_MAX = 50;
  const REVIEW_CONTENT_MAX_BYTES = 500;

  const navigate = useNavigate();
  const [reviews, setReviews] = useState();
  const [refresh, setRefresh] = useState(0);
  const [change, setChange] = useState([]);
  const [open, setOpen] = useState(false);
  const [sendList, setSendList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [addPreviewMap, setAddPreviewMap] = useState({});
  const [deleteIdx, setDeleteIdx] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerInfo, setViewerInfo] = useState({
    title: "",
    content: "",
    date: "",
    writer: "",
    star: 0,
    reply: null,
  });

  const getByteLength = (value) => {
    return new TextEncoder().encode(String(value || "")).length;
  };

  const sliceByByte = (value, maxBytes) => {
    const chars = Array.from(String(value || ""));
    let bytes = 0;
    let result = "";

    for (const char of chars) {
      const charBytes = getByteLength(char);

      if (bytes + charBytes > maxBytes) {
        break;
      }

      bytes += charBytes;
      result += char;
    }

    return result;
  };

  const goFurniture = (item) => {
    const fCode = item.f_code || item.furniture?.f_code;
    if (fCode) {
      navigate(`/furniture/article/${fCode}`);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return String(value).slice(0, 10);
  };

  const openImageViewer = (item, imageIdx = 0) => {
    const images = (item?.logo?.result || []).map((img) => ({
      src: `${img.img_name}?t=${refresh}`,
      alt: item.fr_subject || "리뷰 이미지",
    }));

    setViewerImages(
      images.length > 0
        ? images
        : [
            {
              src: "/no-image.png",
              alt: "리뷰 이미지 없음",
            },
          ]
    );

    setViewerIndex(images.length > 0 ? imageIdx : 0);

    setViewerInfo({
      title: item.fr_subject || "제목 없음",
      content: item.fr_content || "",
      date: formatDate(
        item.fr_createdDate ||
          item.fr_createddate ||
          item.fr_date ||
          item.createdAt ||
          item.cart_statusdate
      ),
      writer: item.id || "",
      star: item.fr_star || 0,
      reply: item.reply || null,
    });

    setViewerOpen(true);
  };

  const changeToUpdate = (idx) => {
    setChange((prv) => {
      const newChange = [...prv];
      newChange[idx] = !newChange[idx];
      return newChange;
    });
  };

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);
        const result = await FurnitureReviewService.selectReview(user);
        const List = Array.isArray(result.data) ? result.data : [];

        const reviewRows = List.filter((item) => Number(item.fr_idx) > 0);
        const replyRows = List.filter((item) => Number(item.fr_idx) < 0);

        const normalizedList = reviewRows.map((review) => {
          const reply = replyRows.find(
            (item) => Number(item.fr_idx) === Number(review.fr_idx) * -1
          );

          return {
            ...review,
            reply: reply || null,
          };
        });

        const listWithImages = await Promise.all(
          normalizedList.map(async (item) => {
            const logo = await GetImgDir({
              kind: "F_REVIEW",
              returnType: "list",
              a: item.c_code,
              d: item.id,
              view: false,
            });

            let furniture = null;
            let thumbnail = null;
            let options = [];

            try {
              furniture = await FurnitureService.getFurnitureItem(item.f_code);

              thumbnail =
                furniture?.imageList?.find((img) => img.img_tag === "THUMBNAIL") ||
                furniture?.imageList?.[0] ||
                null;
            } catch (error) {
              console.error("리뷰 상품 정보 조회 실패", error);
            }

            try {
              if (item.c_code) {
                const optionRes = await CartService.getCartOptions(item.c_code);
                options = optionRes.data || [];
              }
            } catch (error) {
              console.error("리뷰 상품 옵션 조회 실패", error);
            }

            return {
              ...item,
              logo,
              furniture,
              thumbnail: thumbnail?.img_name || null,
              options,
            };
          })
        );

        setReviews(listWithImages);
      } catch (error) {
        console.error("리뷰 내역 조회 실패", error);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchReview();
    }
  }, [user, refresh]);

  const handleOpen = (index) => {
    setDeleteIdx(index);
    setOpen(true);
  };

  const handleClose = () => {
    setDeleteIdx(null);
    setOpen(false);
  };

  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });

  const handleChange = (idx, e) => {
    const { name, value } = e.target;

    setReviews((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              [name]: value,
            }
          : item
      )
    );
  };

  const openEditModal = (item) => {
    setEditItem({ ...item });
    setSendList([]);
    setAddPreviewMap({});
    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);

    setTimeout(() => {
      setEditItem(null);
      setSendList([]);
      setAddPreviewMap({});
    }, 200);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    let nextValue = value;

    if (name === "fr_subject") {
      nextValue = nextValue.slice(0, REVIEW_TITLE_MAX);
    }

    if (name === "fr_content") {
      nextValue = sliceByByte(nextValue, REVIEW_CONTENT_MAX_BYTES);
    }

    setEditItem((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleSubmit = async (e, item) => {
    e.preventDefault();

    if (!item) return;

    if (!String(item.fr_subject || "").trim()) {
      setAlert({
        open: true,
        severity: "warning",
        title: "수정 불가",
        text: "제목을 입력해주세요.",
      });
      return;
    }

    if (!String(item.fr_content || "").trim()) {
      setAlert({
        open: true,
        severity: "warning",
        title: "수정 불가",
        text: "내용을 입력해주세요.",
      });
      return;
    }

    if (String(item.fr_subject || "").length > REVIEW_TITLE_MAX) {
      setAlert({
        open: true,
        severity: "warning",
        title: "수정 불가",
        text: `리뷰 제목은 ${REVIEW_TITLE_MAX}자 이하로 입력해주세요.`,
      });
      return;
    }

    if (getByteLength(item.fr_content) > REVIEW_CONTENT_MAX_BYTES) {
      setAlert({
        open: true,
        severity: "warning",
        title: "수정 불가",
        text: `리뷰 내용은 ${REVIEW_CONTENT_MAX_BYTES}byte 이하로 입력해주세요.`,
      });
      return;
    }

    try {
      await onClickInsert();
      await FurnitureReviewService.updateReview(item);

      setAlert({
        open: true,
        severity: "success",
        title: "수정 성공",
        text: "수정되었습니다.",
      });

      closeEditModal();
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("리뷰 수정 실패", error);

      setAlert({
        open: true,
        severity: "error",
        title: "수정 실패",
        text:
          error.response?.data?.message ||
          "리뷰 수정 중 오류가 발생했습니다.",
      });
    }
  };

  const reviewDeleteSubmit = async (idx) => {
    FurnitureReviewService.deleteReview(reviews[idx]);
    await Promise.all(
      reviews[idx].logo?.result?.map((record) =>
        imageDelete([record.img_originalName])
      )
    );
    setAlert({
      open: true,
      severity: "error",
      title: "삭제완료",
      text: "삭제가 완료되었습니다.",
    });
    setRefresh(refresh + 1);
  };

  const imageUpload = async (e) => {
    const updateList = document.getElementsByClassName("updateFile");
    if (updateList.length === 0) {
      window.alert("Idiot");
      return;
    }
    let fileList = [];
    for (const element of updateList) {
      if (element.files.length !== 0) {
        fileList.push({ file: element.files[0], name: element.name });
      }
    }

    if (fileList.length === 0) {
      window.alert("dumb");
      return;
    }
    await ImageService.updateImage(fileList);
    setRefresh(refresh + 1);
  };

  const imageDelete = async (item) => {
    try {
      await ImageService.deleteImage(item);

      const deletedNames = Array.isArray(item) ? item : [item];

      setEditItem((prev) => {
        if (!prev?.logo?.result) return prev;

        return {
          ...prev,
          logo: {
            ...prev.logo,
            result: prev.logo.result.filter(
              (img) => !deletedNames.includes(img.img_originalName)
            ),
          },
        };
      });

      setReviews((prev) =>
        (prev || []).map((review) => ({
          ...review,
          logo: review.logo
            ? {
                ...review.logo,
                result: (review.logo.result || []).filter(
                  (img) => !deletedNames.includes(img.img_originalName)
                ),
              }
            : review.logo,
        }))
      );
    } catch (error) {
      console.error("이미지 삭제 실패", error);
      setAlert({
        open: true,
        severity: "error",
        title: "삭제",
        text: "이미지 삭제 중 오류가 발생했습니다.",
      });
    }
  };

  const getNextIdx = (item) => {
    const currentList = item?.logo?.result || [];

    if (currentList.length === 0) return 0;

    const maxIdx = Math.max(
      ...currentList.map((img) => Number(img.img_idx || 0))
    );

    return maxIdx;
  };

  const onClickAdd = (item, e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const nextIdx = getNextIdx(item) + sendList.length + 1;
    const previewUrl = URL.createObjectURL(file);

    setSendList([
      ...sendList,
      {
        img_kind: "F_REVIEW",
        img_tag: nextIdx === 0 ? "THUMBNAIL" : "OTHER",
        dir_a: item.c_code,
        dir_d: user.id,
        img_idx: nextIdx,
        file,
        previewUrl,
      },
    ]);
  };

  const onClickInsert = async () => {
    if (!sendList || sendList.length === 0) {
      console.log("보낼 이미지 없음");
      return;
    }
    console.log("sendlist");
    console.log(sendList);
    await ImageService.insertImage(sendList);
  };

  if (loading) {
    return <Loading message="리뷰 내역을 불러오는 중입니다." />;
  }

  if (!reviews || reviews.length === 0) {
    return <p>작성한 리뷰가 없습니다.</p>;
  }

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

      <div className="user-review-list">
        {reviews?.map((item, idx) => (
          <article className="user-review-card" key={item.fr_idx || item.c_code || idx}>
            <div className="user-review-product-area">
              <div
                className="user-review-product-thumb"
                onClick={() => goFurniture(item)}
              >
                <img
                  src={
                    item.thumbnail
                      ? `/api/images/FURNITURE/${item.thumbnail}`
                      : "/no-image.png"
                  }
                  alt={item.furniture?.f_name || item.f_name || "상품 이미지"}
                />
              </div>

              <div className="user-review-product-info">
                <p className="user-review-company">
                  {item.furniture?.c_name || item.c_name || "업체명 없음"}
                </p>

                <h4
                  role="button"
                  tabIndex={0}
                  className="user-review-clickable-title"
                  onClick={() => goFurniture(item)}
                  onKeyDown={(evt) => {
                    if (evt.key === "Enter" || evt.key === " ") {
                      goFurniture(item);
                    }
                  }}
                >
                  {item.furniture?.f_name || item.f_name || "상품명 없음"}
                </h4>

                <div className="user-review-options">
                  {(item.options || []).length > 0 ? (
                    item.options.map((option, optionIdx) => (
                      <span key={`${option.co_select}-${option.co_text}-${optionIdx}`}>
                        옵션: {option.co_select} - {option.co_text}
                        {Number(option.co_price || 0) > 0
                          ? ` (+${Number(option.co_price).toLocaleString()}?)`
                          : ""}
                      </span>
                    ))
                  ) : (
                    <span className="user-review-option-empty">옵션: -</span>
                  )}
                </div>
              </div>
            </div>

            <div
              className="user-review-body"
              role="button"
              tabIndex={0}
              onClick={() => openImageViewer(item, 0)}
              onKeyDown={(evt) => {
                if (evt.key === "Enter" || evt.key === " ") {
                  openImageViewer(item, 0);
                }
              }}
            >
              <div className="user-review-rating-row">
                <div className="user-review-rating">
                  <RatingMui
                    name="fr_star"
                    label=""
                    value={item.fr_star}
                    readOnly={true}
                    precision={0.5}
                  />
                  <strong>{Number(item.fr_star || 0)}</strong>
                </div>

                {item.reply && (
                  <span className="user-review-reply-badge">답변 완료</span>
                )}
              </div>

              <div className="user-review-title-line">
                <h4>{item.fr_subject || "제목 없음"}</h4>
                <span>
                  {formatDate(
                    item.fr_createdDate ||
                      item.fr_createddate ||
                      item.fr_date ||
                      item.createdAt ||
                      item.cart_statusdate
                  )}
                </span>
              </div>

              <p className="user-review-content">
                {item.fr_content || "내용 없음"}
              </p>

              <div className="user-review-images">
                {(item?.logo?.result || []).length > 0 ? (
                  item.logo.result.map((record, imageIdx) => (
                    <img
                      key={record.img_originalName || record.img_name}
                      src={`${record.img_name}?t=${refresh}`}
                      alt={item.fr_subject || "리뷰 이미지"}
                      onClick={() => openImageViewer(item, imageIdx)}
                    />
                  ))
                ) : (
                  <div className="user-review-no-image">리뷰 이미지 없음</div>
                )}
              </div>
            </div>

            <div className="user-review-action-buttons">
              {!item.reply && (
                <Button
                  className="user-review-primary-btn"
                  variant="contained"
                  onClick={() => openEditModal(item)}
                >
                  수정
                </Button>
              )}

              <Button
                className="user-review-secondary-btn"
                variant="outlined"
                onClick={() => handleOpen(idx)}
              >
                삭제
              </Button>
            </div>
          </article>
        ))}
      </div>

      <DialogMui
        open={editOpen}
        onClose={closeEditModal}
        title={
          <div className="user-review-edit-dialog-title">
            <strong>가구 리뷰 수정</strong>
            <button type="button" onClick={closeEditModal}>
              ×
            </button>
          </div>
        }
        maxWidth="sm"
        fullWidth={true}
        text={
          editItem && (
            <div className="user-review-edit-form">
              <div className="user-review-edit-product-area">
                <div className="user-review-product-thumb">
                  <img
                    src={
                      editItem.thumbnail
                        ? `/api/images/FURNITURE/${editItem.thumbnail}`
                        : "/no-image.png"
                    }
                    alt={editItem.furniture?.f_name || editItem.f_name || "상품 이미지"}
                  />
                </div>

                <div className="user-review-product-info">
                  <p className="user-review-company">
                    {editItem.furniture?.c_name || editItem.c_name || "업체명 없음"}
                  </p>

                  <h4>{editItem.furniture?.f_name || editItem.f_name || "상품명 없음"}</h4>

                  <div className="user-review-options">
                    {(editItem.options || []).length > 0 ? (
                      editItem.options.map((option, optionIdx) => (
                        <span key={`${option.co_select}-${option.co_text}-${optionIdx}`}>
                          {option.co_select}: {option.co_text}
                          {Number(option.co_price || 0) > 0
                            ? ` (+${Number(option.co_price).toLocaleString()}?)`
                            : ""}
                        </span>
                      ))
                    ) : (
                      <span className="user-review-option-empty">옵션 -</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="user-review-edit-section">
                <RatingMui
                  name="fr_star"
                  label="별점"
                  value={editItem.fr_star}
                  onChange={handleEditChange}
                  precision={0.5}
                />
              </div>

              <div className="user-review-edit-field">
                <span>제목</span>
                <TextFieldMui
                  name="fr_subject"
                  label=""
                  value={editItem.fr_subject || ""}
                  onChange={handleEditChange}
                  width="100%"
                  inputProps={{ maxLength: REVIEW_TITLE_MAX }}
                  helperText={`${(editItem.fr_subject || "").length}/${REVIEW_TITLE_MAX}`}
                />
              </div>

              <div className="user-review-edit-field">
                <span>내용</span>
                <TextFieldMui
                  name="fr_content"
                  label=""
                  value={editItem.fr_content || ""}
                  onChange={handleEditChange}
                  width="100%"
                  multiline={true}
                  minRows={5}
                  helperText={`${getByteLength(editItem.fr_content)}/${REVIEW_CONTENT_MAX_BYTES}byte`}
                />
              </div>

              <div className="user-review-edit-image-tools">
                <p>기존 이미지</p>

                <div className="user-review-edit-images">
                  {(editItem?.logo?.result || []).map((record) => (
                    <div
                      className="user-review-edit-image"
                      key={record.img_originalName || record.img_name}
                    >
                      <img
                        src={`${record.img_name}?t=${refresh}`}
                        alt="리뷰 이미지"
                      />

                      <button
                        type="button"
                        className="user-review-edit-image-delete"
                        onClick={() => imageDelete([record.img_originalName])}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {sendList.map((image, imageIdx) => (
                    <div
                      className="user-review-edit-image user-review-edit-image-new"
                      key={`${image.file.name}-${imageIdx}`}
                    >
                      <img src={image.previewUrl} alt="추가 이미지 미리보기" />

                      <span className="user-review-new-badge">추가</span>
                      
                      <button
                        type="button"
                        className="user-review-edit-image-delete"
                        onClick={() => {
                          setSendList((prev) => prev.filter((_, idx) => idx !== imageIdx));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {(editItem?.logo?.result || []).length === 0 && sendList.length === 0 && (
                    <span className="user-review-option-empty">이미지 -</span>
                  )}
                </div>
              </div>

              <div className="user-review-add-image-form">
                <p>리뷰 이미지 추가</p>

                <Button
                  component="label"
                  variant="contained"
                  className="user-review-edit-upload-btn"
                  startIcon={<CloudUploadIcon />}
                >
                  파일 선택
                  <input
                    type="file"
                    hidden
                    name="file"
                    onChange={(e) => onClickAdd(editItem, e)}
                  />
                </Button>
              </div>
            </div>
          )
        }
        buttons={[
          {
            title: "수정 완료",
            color: "primary",
            variant: "contained",
            onClick: (e) => handleSubmit(e, editItem),
          },
          {
            title: "취소",
            color: "inherit",
            variant: "outlined",
            onClick: closeEditModal,
          },
        ]}
      />

      <DialogMui
        open={open}
        onClose={handleClose}
        title={<div className="user-review-delete-dialog-title">삭제 확인</div>}
        text={
          <div className="user-review-delete-dialog-content">
            <p>정말 리뷰를 삭제하시겠습니까?</p>
          </div>
        }
        buttons={[
          {
            title: "취소",
            color: "inherit",
            variant: "outlined",
            onClick: handleClose,
          },
          {
            title: "삭제",
            variant: "contained",
            color: "error",
            onClick: () => {
              if (deleteIdx !== null) {
                reviewDeleteSubmit(deleteIdx);
              }
              handleClose();
            },
          },
        ]}
      />

      <ImageViewer
        open={viewerOpen}
        images={viewerImages}
        startIndex={viewerIndex}
        title={viewerInfo.title}
        content={viewerInfo.content}
        date={viewerInfo.date}
        writer={viewerInfo.writer}
        star={viewerInfo.star}
        reply={viewerInfo.reply}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
};

export default UserReviewPage;
