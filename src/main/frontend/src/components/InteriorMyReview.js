import React, { useEffect, useState } from "react";
import InteriorUserService from "../service/interiorUserService";
import GetImgDir from "../resources/function/GetImgDir";
import { Button } from "@mui/material";
import TextFieldMui from "./TextFieldMui";
import ImageService from "../service/imageService";
import DialogMui from "./DialogMui";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const InteriorMyReview = ({ id }) => {
  const [review, setReview] = useState([]);
  const [change, setChange] = useState([]);
  const [sendList, setSendList] = useState([]);

  const handleChange = (idx, e) => {
    const { name, value } = e.target;

    const newReview = [...review];

    newReview[idx] = {
      ...newReview[idx],
      [name]: value,
    };

    setReview(newReview);
  };

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const fetchReview = async () => {
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
  };

  useEffect(() => {
    fetchReview();
  }, []);

  const changeToUpdate = (idx) => {
    setChange((prv) => {
      const newChange = [...prv];
      newChange[idx] = !newChange[idx];
      return newChange;
    });
  };
  const reviewDeleteSubmit = async (idx) => {
    await InteriorUserService.DeleteInteriorReview(review[idx]);
    await Promise.all(
      review[idx].logo.result.map((record) =>
        imageDelete([record.img_originalName]),
      ),
    );
    await fetchReview();
  };
  const reviewUpdateSubmit = async (idx) => {
    const targetReview = review[idx];
    await InteriorUserService.UpdateInteriorReview(targetReview);
    await fetchReview();
    changeToUpdate(idx);
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
    await fetchReview();
  };

  const imageDelete = async (item) => {
    await ImageService.deleteImage(item);
    await fetchReview();
  };

  const onClickAdd = () => {
    const insertForm2 = document.getElementsByName(
      "imageInteriorReviewInsertTestForm",
    )[0];
    setSendList([
      ...sendList,
      {
        img_kind: insertForm2.img_kind.value,
        img_tag: insertForm2.img_tag.value,
        dir_a: insertForm2.dir_a.value,
        dir_b: insertForm2.dir_b.value,
        dir_c: insertForm2.dir_c.value,
        dir_d: insertForm2.dir_d.value,
        dir_e: insertForm2.dir_e.value,
        img_idx: sendList.length,
        file: insertForm2.file.files[0],
      },
    ]);
  };

  const onClickInsert = async () => {
    if (!sendList || sendList.length === 0) {
      console.log("보낼 이미지 없음");
      return; // 🚫 요청 안 보냄
    }
    console.log(sendList);
    await ImageService.insertImage(sendList);
    await fetchReview();
  };

  return (
    <div>
      {Array.isArray(review) && review.length > 0 ? (
        review.map((item, idx) => (
          <div>
            <p>내가 작성한 인테리어 리뷰 모음</p>
            {item.logo.result
              .filter((record) => record.dir_e === item.b_createdDate)
              .map((record, i) => (
                <div>
                  <img
                    src={record.img_name}
                    alt={`${item.c_name} 예시`}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
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
                        적용
                      </Button>

                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => imageDelete([record.img_originalName])}
                      >
                        삭제{" "}
                      </Button>
                    </form>
                  )}
                </div>
              ))}
            {change[idx] && (
              <form name="imageInteriorReviewInsertTestForm">
                <p>리뷰 이미지 추가 업로드</p>
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
                  value={item.c_id}
                  name="dir_a"
                  placeholder="DIR_A"
                />
                <input
                  type="hidden"
                  value={item.c_kind}
                  name="dir_b"
                  placeholder="DIR_B"
                />
                <input
                  type="hidden"
                  value={item.c_name}
                  name="dir_c"
                  placeholder="DIR_C"
                />
                <input
                  type="hidden"
                  value={item.id}
                  name="dir_d"
                  placeholder="DIR_D"
                />
                <input
                  type="hidden"
                  value={item.b_createdDate}
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
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onClickInsert}
                >
                  제출
                </Button>
              </form>
            )}
            {change[idx] ? (
              <form>
                <TextFieldMui
                  name="ir_content"
                  label="content"
                  value={item.ir_content}
                  onChange={(e) => handleChange(idx, e)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => reviewUpdateSubmit(idx)}
                >
                  수정 완료
                </Button>
              </form>
            ) : (
              item.ir_content
            )}
            <Button
              variant="contained"
              color={!change[idx] ? "primary" : "inherit"}
              onClick={() => changeToUpdate(idx)}
            >
              {!change[idx] ? "리뷰 수정" : "수정 취소"}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleOpen()}
            >
              리뷰 삭제
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
                  color: "error",
                  variant: "outlined",
                  onClick: () => {
                    console.log("삭제 실행");

                    reviewDeleteSubmit(idx);
                    handleClose();
                  },
                },
              ]}
            />
          </div>
        ))
      ) : (
        <p>작성한 리뷰가 없습니다.</p>
      )}
    </div>
  );
};

export default InteriorMyReview;
