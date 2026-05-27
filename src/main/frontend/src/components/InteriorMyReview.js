import React, { useCallback, useEffect, useState } from "react";
import InteriorUserService from "../service/interiorUserService";
import GetImgDir from "../resources/function/GetImgDir";
import { Alert, AlertTitle, Button, Snackbar } from "@mui/material";
import TextFieldMui from "./TextFieldMui";
import ImageService from "../service/imageService";
import DialogMui from "./DialogMui";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Loading from "./Loading";
import "../css/InteriorMyReview.css";

const InteriorMyReview = ({ id }) => {
  const [review, setReview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [deleteTargetIdx, setDeleteTargetIdx] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [sendList, setSendList] = useState([]);
  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });

  const formatDate = (value) => {
    if (!value) return "-";
    return String(value).slice(0, 10);
  };

  const getReviewImages = (item) =>
    (item?.logo?.result || []).filter((record) => record.dir_e === item.b_createdDate);

  const fetchReview = useCallback(async () => {
    try {
      setLoading(true);

      const data = await InteriorUserService.fetchInteriorReview(id);
      const companyList = Array.isArray(data) ? data : [];
      const listWithImages = await Promise.all(
        companyList.map(async (item) => {
          const logo = await GetImgDir({
            kind: "I_REVIEW",
            returnType: "list",
            a: item.c_id,
            b: item.c_kind,
            c: item.c_name,
            d: item.id,
            e: item.b_createdDate,
            view: false,
          });

          return {
            ...item,
            logo,
          };
        }),
      );

      setReview(listWithImages);
    } catch (error) {
      console.error("인테리어 리뷰 조회 실패", error);
      setReview([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchReview();
    }
  }, [fetchReview, id, refresh]);

  const showAlert = (nextAlert) => {
    setAlert({
      open: true,
      ...nextAlert,
    });
  };

  const handleOpen = (idx) => {
    setDeleteTargetIdx(idx);
  };

  const handleClose = () => {
    setDeleteTargetIdx(null);
  };

  const openEditModal = (item) => {
    setEditItem({ ...item });
    setSendList([]);
    setEditOpen(true);
  };

  const closeEditModal = () => {
    setEditOpen(false);

    setTimeout(() => {
      setEditItem(null);
      setSendList([]);
    }, 200);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getNextIdx = (item) => {
    const currentList = getReviewImages(item);

    if (currentList.length === 0) return 0;

    return Math.max(...currentList.map((img) => Number(img.img_idx || 0))) + 1;
  };

  const onClickAdd = (item, e) => {
    const file = e.target.files?.[0];

    if (!file || !item) return;

    const nextIdx = getNextIdx(item) + sendList.length;

    setSendList((prev) => [
      ...prev,
      {
        img_kind: "I_REVIEW",
        img_tag: nextIdx === 0 ? "THUMBNAIL" : "OTHER",
        dir_a: item.c_id,
        dir_b: item.c_kind,
        dir_c: item.c_name,
        dir_d: item.id,
        dir_e: item.b_createdDate,
        img_idx: nextIdx,
        file,
        previewUrl: URL.createObjectURL(file),
      },
    ]);

    e.target.value = "";
  };

  const insertImages = async () => {
    if (!sendList || sendList.length === 0) return;

    await ImageService.insertImage(sendList);
  };

  const imageDelete = async (imgName) => {
    try {
      await ImageService.deleteImage([imgName]);

      setEditItem((prev) => {
        if (!prev?.logo?.result) return prev;

        return {
          ...prev,
          logo: {
            ...prev.logo,
            result: prev.logo.result.filter((img) => img.img_originalName !== imgName),
          },
        };
      });

      setReview((prev) =>
        prev.map((item) => ({
          ...item,
          logo: item.logo
            ? {
                ...item.logo,
                result: (item.logo.result || []).filter(
                  (img) => img.img_originalName !== imgName,
                ),
              }
            : item.logo,
        })),
      );
    } catch (error) {
      console.error("인테리어 리뷰 이미지 삭제 실패", error);
      showAlert({
        severity: "error",
        title: "삭제 실패",
        text: "이미지 삭제 중 오류가 발생했습니다.",
      });
    }
  };

  const reviewDeleteSubmit = async (idx) => {
    const targetReview = review[idx];

    if (!targetReview) return;

    try {
      const deleteImageNames = getReviewImages(targetReview)
        .map((record) => record.img_originalName)
        .filter(Boolean);

      if (deleteImageNames.length > 0) {
        await ImageService.deleteImage(deleteImageNames);
      }

      await InteriorUserService.DeleteInteriorReview(targetReview);

      showAlert({
        severity: "success",
        title: "삭제 완료",
        text: "리뷰가 삭제되었습니다.",
      });

      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("인테리어 리뷰 삭제 실패", error);
      showAlert({
        severity: "error",
        title: "삭제 실패",
        text: "리뷰 삭제 중 오류가 발생했습니다.",
      });
    }
  };

  const reviewUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!editItem) return;

    if (!String(editItem.ir_content || "").trim()) {
      showAlert({
        severity: "warning",
        title: "수정 불가",
        text: "리뷰 내용을 입력해주세요.",
      });
      return;
    }

    try {
      await insertImages();
      const result = await InteriorUserService.UpdateInteriorReview(editItem);

      if (result?.success === false) {
        throw new Error("Update failed");
      }

      showAlert({
        severity: "success",
        title: "수정 완료",
        text: "리뷰가 수정되었습니다.",
      });

      closeEditModal();
      setRefresh((prev) => prev + 1);
    } catch (error) {
      console.error("인테리어 리뷰 수정 실패", error);
      showAlert({
        severity: "error",
        title: "수정 실패",
        text: "리뷰 수정 중 오류가 발생했습니다.",
      });
    }
  };

  if (loading) {
    return <Loading message="인테리어 리뷰를 불러오는 중입니다." />;
  }

  if (!Array.isArray(review) || review.length === 0) {
    return <p className="interior-my-review-empty">작성한 인테리어 리뷰가 없습니다.</p>;
  }

  return (
    <div className="interior-my-review-panel">
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

      <div className="interior-my-review-list">
        {review.map((item, idx) => (
          <article className="interior-my-review-card" key={`${item.id}-${item.c_id}-${idx}`}>
            <div className="interior-my-review-company-area">
              <div className="interior-my-review-company-thumb">
                {getReviewImages(item)[0]?.img_name ? (
                  <img
                    src={`${getReviewImages(item)[0].img_name}?t=${refresh}`}
                    alt={`${item.c_name} 리뷰 이미지`}
                  />
                ) : (
                  <span>이미지 없음</span>
                )}
              </div>

              <div className="interior-my-review-company-info">
                <p>{item.c_kind || "인테리어"}</p>
                <h4>{item.c_name || "업체명 없음"}</h4>
                <span>작성일 {formatDate(item.b_createdDate)}</span>
              </div>
            </div>

            <div className="interior-my-review-body">
              <div className="interior-my-review-title-line">
                <h4>내가 작성한 인테리어 리뷰</h4>
                <span>{formatDate(item.b_createdDate)}</span>
              </div>

              <p className="interior-my-review-content">{item.ir_content || "내용 없음"}</p>

              <div className="interior-my-review-images">
                {getReviewImages(item).length > 0 ? (
                  getReviewImages(item).map((record, imageIdx) => (
                    <img
                      key={record.img_originalName || record.img_name || imageIdx}
                      src={`${record.img_name}?t=${refresh}`}
                      alt={`${item.c_name} 리뷰 이미지`}
                    />
                  ))
                ) : (
                  <div className="interior-my-review-no-image">리뷰 이미지 없음</div>
                )}
              </div>
            </div>

            <div className="interior-my-review-action-buttons">
              <Button
                className="user-review-primary-btn"
                variant="contained"
                onClick={() => openEditModal(item)}
              >
                수정
              </Button>
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
            <strong>인테리어 리뷰 수정</strong>
            <button type="button" onClick={closeEditModal}>
              x
            </button>
          </div>
        }
        maxWidth="sm"
        fullWidth={true}
        text={
          editItem && (
            <form className="interior-my-review-edit-form" onSubmit={reviewUpdateSubmit}>
              <div className="interior-my-review-edit-company-area">
                <div className="interior-my-review-company-thumb">
                  {getReviewImages(editItem)[0]?.img_name ? (
                    <img
                      src={`${getReviewImages(editItem)[0].img_name}?t=${refresh}`}
                      alt={`${editItem.c_name} 리뷰 이미지`}
                    />
                  ) : (
                    <span>이미지 없음</span>
                  )}
                </div>

                <div className="interior-my-review-company-info">
                  <p>{editItem.c_kind || "인테리어"}</p>
                  <h4>{editItem.c_name || "업체명 없음"}</h4>
                  <span>작성일 {formatDate(editItem.b_createdDate)}</span>
                </div>
              </div>

              <div className="user-review-edit-field">
                <span>내용</span>
                <TextFieldMui
                  name="ir_content"
                  label=""
                  value={editItem.ir_content || ""}
                  onChange={handleEditChange}
                  width="100%"
                  multiline={true}
                  minRows={5}
                />
              </div>

              <div className="user-review-edit-image-tools">
                <p>기존 이미지</p>

                <div className="user-review-edit-images">
                  {getReviewImages(editItem).map((record) => (
                    <div
                      className="user-review-edit-image"
                      key={record.img_originalName || record.img_name}
                    >
                      <img src={`${record.img_name}?t=${refresh}`} alt="리뷰 이미지" />

                      <button
                        type="button"
                        className="user-review-edit-image-delete"
                        onClick={() => imageDelete(record.img_originalName)}
                      >
                        x
                      </button>
                    </div>
                  ))}

                  {sendList.map((image, imageIdx) => (
                    <div
                      className="user-review-edit-image user-review-edit-image-new"
                      key={`${image.file.name}-${imageIdx}`}
                    >
                      <img src={image.previewUrl} alt="추가 이미지 미리보기" />

                      <button
                        type="button"
                        className="user-review-edit-image-delete"
                        onClick={() =>
                          setSendList((prev) => prev.filter((_, idx) => idx !== imageIdx))
                        }
                      >
                        x
                      </button>
                    </div>
                  ))}

                  {getReviewImages(editItem).length === 0 && sendList.length === 0 && (
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
            </form>
          )
        }
        buttons={[
          {
            title: "수정 완료",
            color: "primary",
            variant: "contained",
            onClick: reviewUpdateSubmit,
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
        open={deleteTargetIdx !== null}
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
            color: "error",
            variant: "contained",
            onClick: () => {
              reviewDeleteSubmit(deleteTargetIdx);
              handleClose();
            },
          },
        ]}
      />
    </div>
  );
};

export default InteriorMyReview;
