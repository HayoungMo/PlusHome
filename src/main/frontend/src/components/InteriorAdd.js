import React, { useState } from "react";
import TextFieldMui from "./TextFieldMui";
import { Button } from "@mui/material";
import ImageService from "../service/imageService";
import InteriorService from "../service/interiorService";
import SelectMui from "./SelectMui";
import AlertMui from "./AlertMui";

const InteriorAdd = ({ company }) => {
  const [sendList, setSendList] = useState([]);
  const [form, setForm] = useState({
    c_id: company.c_id,
    c_kind: company.c_kind,
    c_name: company.c_name,
    tag: "",
    text: "",
  });

  const [alert, setAlert] = useState({
    open: false,
    severity: "info",
    title: "",
    text: "",
  });

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

  const [preview, setPreview] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "tag" ? { text: "" } : {}),
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); // 🔥 페이지 새로고침 막기
    const result = await InteriorService.AddInterior(form);
    if (result.success) {
      setAlert({
        open: true,
        severity: "success",
        title: "등록 성공",
        text: "시공 사례가 등록되었습니다.",
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

  const selectedQuestion = questions.find((q) => q.value === form.tag);

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
        img_idx: sendList.length,
        file: insertForm.file.files[0],
      },
    ]);
    setPreview((prev) => [
      ...prev,
      URL.createObjectURL(insertForm.file.files[0]),
    ]);
  };

  const onClickInsert = async() => {
    if (!sendList || sendList.length === 0) {
      console.log("보낼 이미지 없음");
      return; // 🚫 요청 안 보냄
    }
    try {
      await ImageService.insertImage(sendList);
      // 업로드 성공 후 초기화
      setSendList([]);
      console.log("초기화 완료");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {alert.open && (
        <AlertMui
          severity={alert.severity}
          title={alert.title}
          text={alert.text}
          autoHideDuration={3000}
          onClose={() =>
            setAlert((prev) => ({
              ...prev,
              open: false,
            }))
          }
        />
      )}
      <p>인테리어 업체 추가</p>
      <form name="article" onSubmit={handleSubmit}>
        <div>
          <SelectMui
            name="tag"
            value={form.tag}
            onChange={handleChange}
            option={questions}
            required
          />
          {form.tag && form.tag !== "location" ? (
            <SelectMui
              label="세부 선택"
              name="text"
              value={form.text}
              onChange={handleChange}
              option={selectedQuestion?.options || []}
              required
            />
          ) : (
            <TextFieldMui
              name="text"
              value={form.text}
              onChange={handleChange}
              required
            />
          )}
          {form.text && (
            <Button type="submit" variant="contained">
              제출
            </Button>
          )}
        </div>
      </form>
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
          value={
            sendList === null || sendList.length === 0 ? "THUMBNAIL" : "OTHER"
          }
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
        <input type="button" onClick={onClickInsert} value="Insert" />
      </form>
      {preview &&
        preview.map((item) => (
          <img
            src={item}
            style={{ width: "150px", height: "150px", objectFit: "cover" }}
            alt=""
          />
        ))}
    </div>
  );
};

export default InteriorAdd;
