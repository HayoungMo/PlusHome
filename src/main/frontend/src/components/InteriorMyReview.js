import React, { useEffect, useState } from "react";
import InteriorUserService from "../service/interiorUserService";
import GetImgDir from "../resources/function/GetImgDir";
import { Button } from "@mui/material";
import TextFieldMui from "./TextFieldMui";
import ImageService from "../service/imageService";

const InteriorMyReview = () => {
  const [review, setReview] = useState([]);
  const [change, setChange] = useState([]);
  const [sendList, setSendList] = useState([]);
  const [refresh, setRefresh] = useState(0);

  const handleChange = (idx, e) => {
    const { name, value } = e.target;

    const newReview = [...review];

    newReview[idx] = {
      ...newReview[idx],
      [name]: value,
    };

    setReview(newReview);
  };

  useEffect(() => {
    const fetchReview = async () => {
      const data = await InteriorUserService.fetchInteriorReview();
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

    fetchReview();
  }, [refresh]);

  const changeToUpdate = (idx) => {
    setChange((prv) => {
      const newChange = [...prv];
      newChange[idx] = !newChange[idx];
      return newChange;
    });
  };
  const reviewDeleteSubmit = (idx) => {
    InteriorUserService.DeleteInteriorReview(review[idx]);
  };
  const reviewUpdateSubmit = (idx) => {
    changeToUpdate(idx);
    InteriorUserService.UpdateInteriorReview(review[idx]);
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
    setRefresh(refresh+1);
  };

  const imageDelete = async (item) => {
    await ImageService.deleteImage(item);
    setRefresh(refresh + 1);
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
        img_idx: insertForm2.img_idx.value,
        file: insertForm2.file.files[0],
      },
    ]);
  };

  const onClickInsert = () => {
    if (!sendList || sendList.length === 0) {
      console.log("보낼 이미지 없음");
      return; // 🚫 요청 안 보냄
    }
    console.log(sendList);
    ImageService.insertImage(sendList);
    setRefresh(refresh + 1);
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
                    <input
                      type="file"
                      name={record.img_originalName}
                      className="updateFile"
                    />
                    <Button onClick={(e) => imageUpload(record, e)}>
                      적용
                    </Button>

                    <Button
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
                value="PROFILE"
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
              <input type="file" name="file" />
              <br />
              <Button onClick={onClickAdd}>추가</Button>
              <Button onClick={onClickInsert}>제출</Button>
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
              <Button onClick={() => reviewUpdateSubmit(idx)}>수정 완료</Button>
            </form>
          ) : (
            item.ir_content
          )}
          <Button onClick={() => changeToUpdate(idx)}>
            {!change[idx] ? "리뷰 수정" : "수정 취소"}
          </Button>
          <Button onClick={() => reviewDeleteSubmit(idx)}>
            리뷰 삭제
          </Button>
        </div>
      ))) : (
        <p>작성한 리뷰가 없습니다.</p>
      )}
    </div>
  );
};

export default InteriorMyReview;
