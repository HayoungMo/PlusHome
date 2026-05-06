import React, { useEffect, useState } from "react";
import InteriorService from "../service/interiorService";
import TextFieldMui from "./TextFieldMui";
import { Button } from "@mui/material";

const InteriorUpdate = ({ company }) => {
  const [form, setForm] = useState({
    c_id: company.c_id,
    c_kind: company.c_kind,
    c_name: company.c_name,
    tag: "",
    text: "",
  });

  const [article, setArticle] = useState([]);

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

  useEffect(() => {
    const fetchArticle = async () => {
      const data = await InteriorService.fetchArticle(company);
      setArticle(Array.isArray(data) ? data : []);
    };
    fetchArticle();
  }, []);

  return (
    <div>
      {article.map((item,index) => (
        <form name="article" onSubmit={(e) => handleSubmit(e, item)}>
          <div>
            <TextFieldMui
              name="tag"
              value={item.i_tag}
              slotProps={{
                input:{
                    readOnly : true,
                }
              }}
            />
            <TextFieldMui
              name="text"
              value={item.i_text}
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

export default InteriorUpdate;
