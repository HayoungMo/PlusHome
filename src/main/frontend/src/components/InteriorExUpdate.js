import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import TextFieldMui from "./TextFieldMui";
import { Button } from "@mui/material";

const InteriorExUpdate = ({ company }) => {

  const [example, setExample] = useState([]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;

    const newExample = [...example];
    newExample[index] = {
      ...newExample[index],
      [name === "tag" ? "ie_tag" : name === "tag2" ? "ie_tag2" : "ie_content"]: value,
    };

    setExample(newExample);
  };
  const handleSubmit = async (e, item) => {
    e.preventDefault();

    await InteriorService.UpdateInteriorExample({
      c_id: company.c_id,
      c_kind: company.c_kind,
      c_name: company.c_name,
      tag: item.ie_tag,
      tag2: item.ie_tag2,
      content: item.ie_content,
    });
  };

  useEffect(() => {
    const fetchExample = async () => {
      const data = await InteriorService.fetchExample(company);
      setExample(Array.isArray(data) ? data : []);
    };
    fetchExample();
  }, []);

  return (
    <div>
      <p>인테리어 시공 사례 수정 예시</p>
      {example.map((item, index) => (
        <form name="example" onSubmit={(e) => handleSubmit(e, item)}>
          <div>
            <TextFieldMui name="tag" value={item.ie_tag} />
            <TextFieldMui name="tag2" value={item.ie_tag2} />
            <TextFieldMui
              name="content"
              value={item.ie_content}
              onChange={(e) => handleChange(index, e)}
            />
            <Button type="submit" variant="contained">
              제출
            </Button>
          </div>
        </form>
      ))}
    </div>
  );
};

export default InteriorExUpdate;
