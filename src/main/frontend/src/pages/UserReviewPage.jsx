import React, { useEffect, useState } from "react";
import FurnitureReviewService from "../service/furnitureReviewService";
import GetImgDir from "../resources/function/GetImgDir";
import RatingMui from "../components/RatingMui";
import TextFieldMui from "../components/TextFieldMui";
import { Alert, AlertTitle, Button, Snackbar } from "@mui/material";
import DialogMui from "../components/DialogMui";
import AlertMui from "../components/AlertMui";
import ImageService from "../service/imageService";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Loading from "../components/Loading";

import { useNavigate } from "react-router-dom";

const UserReviewPage = ({ user }) => {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState();
  const [refresh, setRefresh] = useState(0);
  const [change, setChange] = useState([]);
  const [open, setOpen] = useState(false);
  const [sendList, setSendList] = useState([]);
  const [loading, setLoading] = useState(true)

  const goFurniture= (item) => {
    const fCode = item.f_code || item.furniture?.f_code
    if (fCode){
      navigate(`/furniture/article/${fCode}`)
    }
  }

  const formatDate = (value) => {
    if(!value) return "-";
    return String(value).slice(0,10)
  }

  const changeToUpdate = (idx) => {
    setChange((prv) => {
      const newChange = [...prv];
      newChange[idx] = !newChange[idx];
      return newChange;
    });
  };

  useEffect(() => {
    const fetchReview = async () => {
      try{
        setLoading(true)
        const result = await FurnitureReviewService.selectReview(user);
        const List = Array.isArray(result.data) ? result.data : [];
        const listWithImages = await Promise.all(
          List.map(async (item) => {
            const logo = await GetImgDir({
              kind: "F_REVIEW",
              returnType: "list",
              a: item.c_code,
              d: item.id,
              view: false,
            });

            if (!logo?.result?.length) {
              return item;
            }

            return {
              ...item,
              logo,
            };
          }),
        );

        setReviews(listWithImages);
      }catch(error){
        console.error("리뷰 내역 조회 실패", error)
        setReviews([])
      }finally{
        setLoading(false)
      }
    }
    if (user?.id) {
      fetchReview()
    }
  }, [user, refresh]);

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

  const handleChange = (idx, e) => {
    const { name, value } = e.target;

    setReviews((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              [name]: value,
            }
          : item,
      ),
    );
  };
  const handleSubmit = async (e, item) => {
    e.preventDefault(); // 🔥 페이지 새로고침 막기
    onClickInsert();
    const result = await FurnitureReviewService.updateReview(item);

    if (result.success) {
      setAlert({
        open: true,
        severity: "success",
        title: "수정 성공",
        text: "수정되었습니다.",
      });
    } else {
      setAlert({
        open: true,
        severity: "error",
        title: `에러 (${result.status})`,
        text: result.message || "오류가 발생했습니다.",
      });
    }    
  };

  const reviewDeleteSubmit = async (idx) => {
    FurnitureReviewService.deleteReview(reviews[idx]);
    await Promise.all(
      reviews[idx].logo?.result?.map((record) =>
        imageDelete([record.img_originalName]),
      ),
    );
    setAlert({
      open: true,
      severity: "error",
      title: `삭제완료`,
      text: "삭제가 완료되었습니다.",
    });
    setRefresh(refresh + 1);
  };

  const imageUpload = async (e) => {
    const updateList = document.getElementsByClassName("updateFile");
    if (updateList.length === 0) {
      alert("Idiot");
      return;
    }
    let fileList = [];
    for (const element of updateList) {
      if (element.files.length !== 0) {
        fileList.push({ file: element.files[0], name: element.name });
      }
    }

    if (fileList.length === 0) {
      alert("dumb");
      return;
    }
    // await ImageService.updateImage(fileList, updateTest);
    await ImageService.updateImage(fileList);
    setRefresh(refresh + 1);
  };

  const imageDelete = async (item) => {
    await ImageService.deleteImage(item);
    setRefresh(refresh + 1);
  };
  const getNextIdx = (item) => {
    const currentList = item?.logo?.result || [];

    if (currentList.length === 0) return 0;

    const maxIdx = Math.max(
      ...currentList.map((img) => Number(img.img_idx || 0)),
    );

    return maxIdx;
  };

  const onClickAdd = (item, e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const nextIdx = getNextIdx(item) + sendList.length;

    setSendList([
      ...sendList,
      {
        img_kind: "F_REVIEW",
        img_tag: nextIdx === 0 ? "THUMBNAIL" : "OTHER",
        dir_a: item.c_code,
        dir_d: user.id,
        img_idx: nextIdx,
        file,
      },
    ]);
  };

  const onClickInsert = () => {
    if (!sendList || sendList.length === 0) {
      console.log("보낼 이미지 없음");
      return; // 🚫 요청 안 보냄
    }
    console.log("sendlist");
    console.log(sendList);
    ImageService.insertImage(sendList);
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

      {reviews?.map((item, idx) => (
      <div className="user-review-item" key={item.fr_code || item.id || idx}>
        {change[idx] ? (
          <form name="review" className="user-review-edit-form">
            <div className="user-review-edit-images">
              {(item?.logo?.result || []).map((record) => (
                <div
                  className="user-review-edit-image"
                  key={record.img_originalName || record.img_name}
                >
                  <img
                    src={`${record.img_name}?t=${refresh}`}
                    alt={`${item.c_name || "리뷰"} 이미지`}
                  />

                  <div className="user-review-image-actions">
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                    >
                      파일 선택
                      <input
                        type="file"
                        hidden
                        name={record.img_originalName}
                        className="updateFile"
                      />
                    </Button>

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(e) => imageUpload(record, e)}
                    >
                      수정
                    </Button>

                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => imageDelete([record.img_originalName])}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <RatingMui
              name="fr_star"
              label="별점"
              value={item.fr_star}
              onChange={(e) => handleChange(idx, e)}
              precision={0.5}
            />

            <TextFieldMui
              name="fr_subject"
              label="제목"
              value={item.fr_subject}
              onChange={(e) => handleChange(idx, e)}
            />

            <TextFieldMui
              name="fr_content"
              label="내용"
              value={item.fr_content}
              onChange={(e) => handleChange(idx, e)}
            />

            <div className="user-review-add-image-form">
              <p>가구 리뷰 이미지 추가</p>

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
                  onChange={(e) => onClickAdd(item, e)}
                />
              </Button>
            </div>

            <div className="user-review-edit-actions">
              <Button
                variant="contained"
                color="primary"
                onClick={(e) => {
                  handleSubmit(e, item);
                  changeToUpdate(idx);
                }}
              >
                수정 완료
              </Button>

              <Button variant="outlined" onClick={() => changeToUpdate(idx)}>
                수정 취소
              </Button>

              <Button variant="contained" color="error" onClick={handleOpen}>
                삭제
              </Button>
            </div>

            <DialogMui
              open={open}
              onClose={handleClose}
              title="삭제 확인"
              text="정말 삭제하시겠습니까?"
              buttons={[
                {
                  title: "취소",
                  color: "inherit",
                  onClick: handleClose,
                },
                {
                  title: "삭제",
                  variant: "outlined",
                  color: "error",
                  onClick: () => {
                    reviewDeleteSubmit(idx);
                    handleClose();
                  },
                },
              ]}
            />
          </form>
        ) : (
          <article className="user-review-card">
            <div className="user-review-row user-review-title-row">
              <h4>{item.fr_subject || "제목 없음"}</h4>

              <RatingMui
                name="fr_star"
                label=""
                value={item.fr_star}
                readOnly={true}
                precision={0.5}
              />
            </div>

            <div className="user-review-date">
              {formatDate(item.fr_date || item.createdAt)}
            </div>

            <p className="user-review-content">
              {item.fr_content || "내용 없음"}
            </p>

            <div className="user-review-bottom-row">
              <div
                className="user-review-images"
                onClick={() => goFurniture(item)}
              >
                {(item?.logo?.result || []).length > 0 ? (
                  item.logo.result.slice(0, 4).map((record) => (
                    <img
                      key={record.img_originalName || record.img_name}
                      src={`${record.img_name}?t=${refresh}`}
                      alt={item.fr_subject || "리뷰 이미지"}
                    />
                  ))
                ) : (
                  <div className="user-review-no-image">이미지 없음</div>
                )}
              </div>

              <button
                type="button"
                className="user-review-edit-btn"
                onClick={(evt) => {
                  evt.stopPropagation();
                  changeToUpdate(idx);
                }}
              >
                수정
              </button>
            </div>
          </article>
        )}
      </div>
    ))}


    </div>
  );
};

export default UserReviewPage;
