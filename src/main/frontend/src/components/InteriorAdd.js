import React, { useState } from 'react';
import TextFieldMui from './TextFieldMui';
import { Button } from '@mui/material';
import ImageService from '../service/imageService';
import InteriorService from '../service/interiorService';
import SelectMui from './SelectMui';

const InteriorAdd = ({company}) => {

      const [sendList, setSendList] = useState([]);
      const [form, setForm] = useState({
          c_id: company.c_id,
          c_kind: company.c_kind,
          c_name: company.c_name,
          tag: "",
          text: "",
        });


const tagOptions = [
  { value: "housingType", title: "주거 유형" },
  { value: "areaSize", title: "평수" },
  { value: "houseCondition", title: "주택 상태" },
  { value: "purpose", title: "목적" },
  { value: "spaces", title: "공간" },
  { value: "budget", title: "예산" },
  { value: "schedule", title: "일정" },
  { value: "location", title: "출장 장소" },
];

      const handleChange = (e) => {
        setForm({
          ...form,
          [e.target.name]: e.target.value,
        });
      };
      const handleSubmit = async (e) => {
        e.preventDefault(); // 🔥 페이지 새로고침 막기
        InteriorService.AddInterior(form);
        onClickInsert();
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

    return (
      <div>
        <p>인테리어 업체 추가</p>
        <form name="article" onSubmit={handleSubmit}>
          <div>
            <SelectMui
              name="tag"
              value={form.tag}
              onChange={handleChange}
              option={tagOptions}
              required
            />
            {form.tag&&<TextFieldMui name="text" label="text" onChange={handleChange} />}
            {form.text && <Button type="submit" variant="contained">
              제출
            </Button>}
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

export default InteriorAdd;