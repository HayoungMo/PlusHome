import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import TextFieldMui from "./TextFieldMui";
import { Button } from "@mui/material";
import ImageService from "../service/imageService";
import SelectMui from "./SelectMui";
import DialogMui from "./DialogMui";

const InteriorUpdate = ({ company }) => {
  const [article, setArticle] = useState([]);
  const [sendList, setSendList] = useState([]);

  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [open1, setOpen1] = useState(false);

  const handleOpen1 = () => {
    setOpen1(true);
  };

  const handleClose1 = () => {
    setOpen1(false);
  };

  const [reload, setReload] = useState(0);
  
    const refresh = () => {
      setReload((prev) => prev + 1);
    };

  const questionOptions = {
    q1: [
      { value: "apt", title: "아파트" },
      { value: "villa", title: "빌라" },
      { value: "house", title: "단독주택" },
      { value: "officetel", title: "오피스텔" },
    ],
    q2: [
      { value: "10_20", title: "10~20평" },
      { value: "30", title: "30평대" },
      { value: "40", title: "40평대" },
      { value: "50", title: "50평 이상" },
    ],
    q3: [
      { value: "kitchen", title: "키친" },
      { value: "bath", title: "바스" },
      { value: "storage", title: "수납" },
      { value: "door", title: "중문/문" },
      { value: "window", title: "창문" },
      { value: "wallpaper", title: "벽지" },
      { value: "lighting", title: "조명" },
      { value: "tile", title: "타일" },
      { value: "floor", title: "마루" },
    ],
  };

  const questions = [
    {
      value: "housingType",
      title: "주택 종류",
      options: questionOptions.q1,
    },
    {
      value: "areaSize",
      title: "평수",
      options: questionOptions.q2,
    },
    {
      value: "spaces",
      title: "필요한 공간",
      options: questionOptions.q3,
      multi: true,
    },
    {
      value: "location",
      title: "출장 장소",
      options: questionOptions.q3,
      multi: true,
    },
  ];

  const handleChange = (index, e) => {
    const { name, value } = e.target;

    const newArticle = [...article];
    newArticle[index] = {
      ...newArticle[index],
      [name === "tag" ? "i_tag" : "i_text"]: value,
    };

    setArticle(newArticle);
  };
  const handleSubmit = async (e, item) => {
    e.preventDefault();

    await InteriorService.UpdateInterior({
      c_id: company.c_id,
      c_kind: company.c_kind,
      c_name: company.c_name,
      tag: item.i_tag,
      text: item.i_text,
    });
    refresh();
  };

  const handleDelete = async (e, item) => {
    e.preventDefault();

    await InteriorService.DeleteInterior({
      c_id: company.c_id,
      c_kind: company.c_kind,
      c_name: company.c_name,
      tag: item.i_tag,
    });

    refresh();
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
        // dir_b: insertForm.dir_b.value,
        img_idx: insertForm.img_idx.value,
        file: insertForm.file.files[0],
      },
    ]);
  };

  const onClickInsert = () => {
    if (!sendList || sendList.length === 0) {
      console.log("보낼 이미지 없음");
      return; // 🚫 요청 안 보냄
    }
    ImageService.insertImage(sendList);
  };

  useEffect(() => {
    const fetchArticle = async () => {
      const data = await InteriorService.fetchArticle(company);
      setArticle(Array.isArray(data) ? data : []);
    };
    fetchArticle();
  }, [reload]);

  return (
    <div>
      <p>인테리어 수정 예시</p>
      {article.map((item, index) => (
        <form name="article">
          <div>
            <TextFieldMui name="tag" value={item.i_tag} />
            {item.i_tag && item.i_tag !== "location" ? (
              <SelectMui
                label="세부 선택"
                name="text"
                value={item.i_text}
                onChange={(e) => handleChange(index, e)}
                option={
                  questions.find((q) => q.value === item.i_tag)?.options || []
                }
                required
              />
            ) : (
              <TextFieldMui
                name="text"
                value={item.i_text}
                onChange={(e) => handleChange(index, e)}
                required
              />
            )}
            <Button onClick={() => handleOpen()} variant="contained">
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
                  variant: "contained",
                  onClick: (e) => {
                    console.log("제출 실행");
                    handleSubmit(e, item);
                    handleClose();
                  },
                },
              ]}
            />
            <Button
              onClick={(e) => {
                handleOpen1();
              }}
              variant="contained"
            >
              삭제
            </Button>
            <DialogMui
              open={open1}
              onClose={handleClose1}
              title="삭제 확인"
              text="정말 삭제하시겠습니까?"
              buttons={[
                {
                  title: "취소",
                  color: "inherit",
                  onClick: handleClose1,
                },
                {
                  title: "삭제",
                  color: "error",
                  variant: "contained",
                  onClick: (e) => {
                    console.log("삭제 실행");
                    handleDelete(e, item);
                    handleClose1();
                  },
                },
              ]}
            />
          </div>
        </form>
      ))}
    </div>
  );
};

export default InteriorUpdate;
