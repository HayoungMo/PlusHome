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

const UserReviewPage = ({ user }) => {
  const [reviews, setReviews] = useState();
  const [refresh, setRefresh] = useState(0);
  const [change, setChange] = useState([]);
  const [open, setOpen] = useState(false);
  const [sendList, setSendList] = useState([]);

  const changeToUpdate = (idx) => {
    setChange((prv) => {
      const newChange = [...prv];
      newChange[idx] = !newChange[idx];
      return newChange;
    });
  };
  useEffect(() => {
    const fetchReview = async () => {
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
    };
    fetchReview();
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

  const onClickAdd = (item) => {
    const insertForm2 = document.getElementsByName("imageInsertTestForm")[0];
    const nextIdx = getNextIdx(item) + sendList.length;
    setSendList([
      ...sendList,
      {
        img_kind: insertForm2.img_kind.value,
        img_tag: nextIdx === 0 ? "THUMBNAIL" : "OTHER",
        dir_a: insertForm2.dir_a.value,
        //dir_b: insertForm2.dir_b.value,
        //dir_c: insertForm2.dir_c.value,
        dir_d: insertForm2.dir_d.value,
        // dir_e: insertForm.dir_e.value,
        img_idx: nextIdx,
        file: insertForm2.file.files[0],
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
        <div>
          {item?.logo?.result.map((record, i) => (
            <div>
              <img
                src={`${record.img_name}?t=${refresh}`}
                alt={`${item.c_name} 예시`}
              />
              {change[idx] && (
                <form>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                  >
                    추가할 파일
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
                </form>
              )}
            </div>
          ))}
          {change[idx] ? (
            <form name="review">
              <RatingMui
                name="fr_star"
                label="별점"
                value={item.fr_star}
                onChange={(e) => handleChange(idx, e)}
                precision={0.5}
              />
              <TextFieldMui
                name="fr_subject"
                label="subject"
                value={item.fr_subject}
                onChange={(e) => handleChange(idx, e)}
              />
              <TextFieldMui
                name="fr_content"
                label="content"
                value={item.fr_content}
                onChange={(e) => handleChange(idx, e)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={(e) => {handleSubmit(e, item)
                  changeToUpdate(idx);
                }}
              >
                수정
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleOpen()}
              >
                삭제
              </Button>
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
                      console.log("삭제 실행");
                      reviewDeleteSubmit(idx);
                      handleClose();
                    },
                  },
                ]}
              />
            </form>
          ) : (
            <div>
              <RatingMui
                name="fr_star"
                label="별점"
                value={item.fr_star}
                readOnly={true}
                precision={0.5}
              />
              <TextFieldMui
                name="fr_subject"
                label="subject"
                value={item.fr_subject}
                readOnly={true}
              />
              <TextFieldMui
                name="fr_content"
                label="content"
                value={item.fr_content}
                readOnly={true}
              />
            </div>
          )}
          {change[idx] && (
            <form name="imageInsertTestForm">
              <p>가구 리뷰 이미지 추가</p>
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
                value={item.c_code}
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
              <input
                type="hidden"
                value={user.id}
                name="dir_d"
                placeholder="DIR_D"
              />
              {/*
 <input type="hidden" value="imgTest" name="dir_b" placeholder="DIR_B" /> */}
              <input
                type="hidden"
                name="img_idx"
                value={sendList.length + 1}
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
          )}
          <Button onClick={() => changeToUpdate(idx)}>
            {!change[idx] ? "리뷰 수정" : "수정 취소"}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default UserReviewPage;
