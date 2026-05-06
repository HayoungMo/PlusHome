import React, { useState } from 'react';
import TextFieldMui from './TextFieldMui';
import { Button } from '@mui/material';
import InteriorService from '../service/interiorService';
import ImageService from '../service/imageService';

const InteriorExAdd = ({ company }) => {
  const [sendList2, setSendList2] = useState([]);
  const [sendList3, setSendList3] = useState([]);
  const [form2, setForm2] = useState({
    c_id: company.c_id,
    c_kind: company.c_kind,
    c_name: company.c_name,
    tag: "",
    tag2: "",
    content: "",
  });

  const handleChange2 = (e) => {
    setForm2({
      ...form2,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit2 = async (e) => {
    e.preventDefault(); // 🔥 페이지 새로고침 막기
    InteriorService.AddInteriorExample(form2);
    onClickInsert2();
    onClickInsert3();
  };

  const onClickAdd2 = () => {
    const insertForm2 = document.getElementsByName("imageInsertTestForm2")[0];
    setSendList2([
      ...sendList2,
      {
        img_kind: insertForm2.img_kind.value,
        img_tag: insertForm2.img_tag.value,
        dir_a: insertForm2.dir_a.value,
        dir_b: insertForm2.dir_b.value,
        dir_c: insertForm2.dir_c.value,
        dir_d: insertForm2.dir_d.value,
        // dir_e: insertForm.dir_e.value,
        img_idx: insertForm2.img_idx.value,
        file: insertForm2.file.files[0],
      },
    ]);
  };

  const onClickInsert2 = () => {
    if (!sendList2 || sendList2.length === 0) {
      console.log("보낼 이미지 없음");
      return; // 🚫 요청 안 보냄
    }
    console.log("sendlist2");
    console.log(sendList2);
    ImageService.insertImage(sendList2);
  };

  const onClickAdd3 = () => {
    const insertForm3 = document.getElementsByName("imageInsertTestForm3")[0];
    setSendList3([
      ...sendList3,
      {
        img_kind: insertForm3.img_kind.value,
        img_tag: insertForm3.img_tag.value,
        dir_a: insertForm3.dir_a.value,
        dir_b: insertForm3.dir_b.value,
        dir_c: insertForm3.dir_c.value,
        dir_d: insertForm3.dir_d.value,
        // dir_e: insertForm.dir_e.value,
        img_idx: insertForm3.img_idx.value,
        file: insertForm3.file.files[0],
      },
    ]);
  };

  const onClickInsert3 = () => {
    if (!sendList3 || sendList3.length === 0) {
      console.log("보낼 이미지 없음");
      return; // 🚫 요청 안 보냄
    }
    console.log("sendlist3");
    console.log(sendList3);
    ImageService.insertImage(sendList3);
  };

  return (
    <div>
      시공사례 3d 모델 업로드
      <form name="imageInsertTestForm3">
        <input
          type="hidden"
          value="LOGO"
          name="img_kind"
          placeholder="IMG_KIND"
        />
        <input
          type="hidden"
          value="MODEL"
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
        <input
          type="hidden"
          value="LOGO"
          name="dir_d"
          placeholder="DIR_D"
        />
        {/* <input type="hidden" value="imgTest" name="dir_b" placeholder="DIR_B" /> */}
        <input type="hidden" name="img_idx" value="1" placeholder="IMG_IDX" />
        <input type="file" name="file" />
        <br />
        <input type="button" onClick={onClickAdd3} value="Add" />
      </form>
      인테리어 시공 사례 추가
      <form name="example" onSubmit={handleSubmit2}>
        <div>
          <TextFieldMui name="tag" label="tag" onChange={handleChange2} />
          <TextFieldMui name="tag2" label="tag2" onChange={handleChange2} />
          <TextFieldMui
            name="content"
            label="content"
            onChange={handleChange2}
          />
          <Button type="submit" variant="contained">
            제출
          </Button>
        </div>
      </form>

      <p>시공사례 이미지 업로드</p>
      <form name="imageInsertTestForm2">
        <input
          type="hidden"
          value="I_EXAMPLE"
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
        <input
          type="hidden"
          value={form2.tag + "_" + form2.tag2}
          name="dir_d"
          placeholder="DIR_D"
        />
        {/* <input type="hidden" value="imgTest" name="dir_b" placeholder="DIR_B" /> */}
        <input type="hidden" name="img_idx" value="1" placeholder="IMG_IDX" />
        <input type="file" name="file" />
        <br />
        <input type="button" onClick={onClickAdd2} value="Add" />
      </form>
    </div>
  );
};

export default InteriorExAdd;