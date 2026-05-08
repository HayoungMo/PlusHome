import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import TextFieldMui from "./TextFieldMui";
import { Button } from "@mui/material";
import ImageService from "../service/imageService";
import SelectMui from "./SelectMui";

const InteriorUpdate = ({ company }) => {
  const [article, setArticle] = useState([]);
  const [sendList, setSendList] = useState([]);

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
  };

  const handleDelete = async (e, item) => {
    e.preventDefault();

    await InteriorService.DeleteInterior({
      c_id: company.c_id,
      c_kind: company.c_kind,
      c_name: company.c_name,
      tag: item.i_tag,
    });
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
  }, []);

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
            <Button onClick={(e) => handleSubmit(e, item)} variant="contained">
              제출
            </Button>
            <Button onClick={(e)=>{handleDelete(e,item)}} variant="contained">
              삭제
            </Button>
          </div>
        </form>
      ))}

      <p>이미지 업로드</p>
      <form name="imageInsertTestForm">
        <input
          type="hidden"
          value="LOGO"
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
          value={company.c_id}
          name="dir_a"
          placeholder="DIR_A"
        />
        <input
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
        />
        <input type="hidden" value="LOGO" name="dir_d" placeholder="DIR_D" />
        {/* <input type="hidden" value="imgTest" name="dir_b" placeholder="DIR_B" /> */}
        <input type="hidden" name="img_idx" value="1" placeholder="IMG_IDX" />
        <input type="file" name="file" />
        <br />
        <input type="button" onClick={onClickAdd} value="Add" />
      </form>
    </div>
  );
};

export default InteriorUpdate;
