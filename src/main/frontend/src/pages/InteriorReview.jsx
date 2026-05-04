import React, { useState } from "react";
import TextFieldMui from "../components/TextFieldMui";
import { Button } from "@mui/material";
import InteriorService from "../service/interiorService";
import ImageService from "../service/imageService";

const InteriorReview = () => {
  const [sendList, setSendList] = useState([]);
  const [invoice, setInvoice] = useState({
    id: "comp01",
    c_id: "comp02",
    c_kind: "interior",
    c_name: "감성인테리어",
    invoice_no: 4,
    invoice_kind: "Y",
    b_createdDate: "2026-04-30 10:29:39",
  });

  const [form, setForm] = useState({
    id: invoice.id,
    c_id: invoice.c_id,
    c_kind: invoice.c_kind,
    c_name: invoice.c_name,
    invoice_no: invoice.invoice_no,
    invoice_kind: invoice.invoice_kind,
    b_createdDate: invoice.b_createdDate,
    ir_content: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); // 🔥 페이지 새로고침 막기
    try {
      await InteriorService.AddInteriorReview(form);

      if (sendList.length > 0) {
        await ImageService.insertImage(sendList);
      }

    } catch (error) {
      console.error(error);
      alert("등록 중 오류가 발생했습니다.");
    }
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
        dir_e: insertForm.dir_e.value,
        img_idx: insertForm.img_idx.value,
        file: insertForm.file.files[0],
      },
    ]);
  };


  return (
    <div>
      <form name="article" onSubmit={handleSubmit}>
        <div>
          <TextFieldMui
            name="ir_content"
            label="content"
            onChange={handleChange}
          />
          <Button type="submit" variant="contained">
            제출
          </Button>
        </div>
      </form>
      <p>이미지 업로드</p>
      <form name="imageInsertTestForm">
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
          value={invoice.c_id}
          name="dir_a"
          placeholder="DIR_A"
        />
        <input
          type="hidden"
          value={invoice.c_kind}
          name="dir_b"
          placeholder="DIR_B"
        />
        <input
          type="hidden"
          value={invoice.c_name}
          name="dir_c"
          placeholder="DIR_C"
        />
        <input
          type="hidden"
          value={invoice.id}
          name="dir_d"
          placeholder="DIR_D"
        />
        <input
          type="hidden"
          value={invoice.b_createdDate}
          name="dir_e"
          placeholder="DIR_E"
        />
        <input type="hidden" name="img_idx" value="1" placeholder="IMG_IDX" />
        <input type="file" name="file" />
        <br />
        <input type="button" onClick={onClickAdd} value="Add" />
      </form>
    </div>
  );
};

export default InteriorReview;
